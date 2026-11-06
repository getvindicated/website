// End-to-end checks for the Car Confidence Survey (/survey, /api/survey)
// and the hub's Survey tab, in a real browser. Run against a local server
// on a TEST database (this script empties survey_responses), twice:
//
// 1. Before launch: build and start with SURVEY_PUBLIC unset.
//    DATABASE_URL=postgres://…/survey_test BOARD_SESSION_SECRET=… \
//    BOARD_ADMIN_PASSWORD=… BOARD_PASSWORD=… BOARD_UCLA_ADMIN_PASSWORD=… pnpm build && pnpm start
//    (same variables) NODE_PATH=$(npm root -g) node scripts/test-survey.mjs
//
// 2. Public: build and start again with SURVEY_PUBLIC=true and
//    SURVEY_ALLOW_DRAFT_WORDING=true (the second only while the wording in
//    lib/survey/questions.ts is still a placeholder), then run this again
//    with the same two variables set.
//
// It needs Playwright with Chromium; NODE_PATH lets it use a global
// install. TEST_BASE_URL defaults to http://localhost:3000. Each browser
// run waits the survey's 40-second minimum, so it takes a few minutes.
import { createRequire } from "node:module";
import { createHmac } from "node:crypto";
import postgres from "postgres";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const B = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Set ${k} (see the top of this file).`);
  return v;
};
const SECRET = env("BOARD_SESSION_SECRET");
const ADMIN = env("BOARD_ADMIN_PASSWORD");
const MEMBER = env("BOARD_PASSWORD");
const UCLA_ADMIN = env("BOARD_UCLA_ADMIN_PASSWORD");
const PUBLIC = process.env.SURVEY_PUBLIC === "true";
const sql = postgres(env("DATABASE_URL"), { max: 1 });

let pass = 0;
let failN = 0;
const ok = (cond, label) => {
  if (cond) pass++;
  else failN++;
  console.log(cond ? "  ✓" : "  ✗", label);
};

// The survey's items, in order (lib/survey/questions.ts).
const SECTIONS = { breakdown: 4, buying: 7, repair: 6 };
const IDS = [
  ...Object.entries(SECTIONS).flatMap(([s, n]) => Array.from({ length: n }, (_, i) => `${s}_${i + 1}`)),
  ...[1, 2, 3, 4].flatMap((i) => [`fair_${i}a`, `fair_${i}b`]),
];
const answersBy = (f) => Object.fromEntries(IDS.map((id, i) => [id, f(i, id)]));
const avg = (a, s) => {
  const v = IDS.filter((id) => id.startsWith(`${s}_`)).map((id) => a[id]);
  return Math.round((v.reduce((x, y) => x + y, 0) / v.length) * 10) / 10;
};

// A signed start time like the page hands out, `secondsAgo` in the past.
const token = (secondsAgo = 60) => {
  const t = String(Date.now() - secondsAgo * 1000);
  return `${t}.${createHmac("sha256", `survey:${SECRET}`).update(t).digest("base64url")}`;
};
let ipN = 0;
const post = (body, ip = `203.0.113.${++ipN}`) =>
  fetch(`${B}/api/survey`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) });
const good = (extra = {}) => ({ answers: answersBy((i) => (i % 5) + 1), demographics: {}, locale: "en", source: null, started: token(), company: "", ...extra });
const rows = () => sql`SELECT * FROM survey_responses ORDER BY id`;

const browser = await chromium.launch();
async function context(password, chapter = "berkeley", viewport = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport });
  if (password) {
    const r = await ctx.request.post(`${B}/api/board/login?chapter=${chapter}`, { data: { password } });
    if (!r.ok()) throw new Error(`Sign-in failed for ${chapter}: ${r.status()}`);
  }
  return ctx;
}

// Takes the survey in the browser with the answers `a`. Checks the
// required-item highlighting and the too-fast refusal on the way.
async function takeSurvey(page, path, a, { about } = {}) {
  const loaded = Date.now();
  await page.goto(`${B}${path}`);
  const start = page.getByRole("button", { name: "Start the survey" });
  ok(await start.isDisabled(), "Start is disabled until the consent box is checked");
  await page.getByLabel(/18 or older/).check();
  await start.click();
  let first = true;
  for (const s of ["breakdown", "buying", "repair", "fair"]) {
    const ids = IDS.filter((id) => id.startsWith(`${s}_`));
    if (first) {
      await page.getByRole("button", { name: "Next" }).click();
      ok((await page.locator("fieldset.sv-miss").count()) === ids.length, "Next with nothing answered marks every item in red");
      ok(await page.getByText("Please answer every question on this page").isVisible(), "…and says why");
      ok(await page.getByText("If your car breaks down").first().isVisible(), "…and stays on the page");
      first = false;
    }
    for (const id of ids) await page.locator(`#q-${id} label`).nth(a[id] - 1).click();
    if (s === "breakdown") ok((await page.locator("fieldset.sv-miss").count()) === 0, "Answering clears the red marks");
    await page.getByRole("button", { name: "Next" }).click();
  }
  ok(await page.getByText("A little about you").first().isVisible(), "The last page is the background questions");
  ok(await page.getByText(/25 of 25 answered/).isVisible(), "Progress reads 25 of 25 answered");
  if (about) await about(page);
  // Too fast: refused, nothing saved, still on the page.
  const before = (await rows()).length;
  if (Date.now() - loaded < 35_000) {
    await page.getByRole("button", { name: "Finish" }).click();
    await page.getByText("That was very fast").waitFor();
    ok((await rows()).length === before, "Finishing in under 40 seconds is refused and saves nothing");
  }
  const wait = 41_000 - (Date.now() - loaded);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.getByRole("button", { name: "Finish" }).click();
  await page.getByText("Here's where you stand").waitFor();
}

async function checkScores(page, a, label) {
  for (const [s, name] of [["breakdown", "Breaking down"], ["buying", "Buying a car"], ["repair", "Getting a repair"]]) {
    const row = page.locator(".sv-scores li", { hasText: name });
    ok((await row.textContent()).includes(`${avg(a, s).toFixed(1)} out of 5`), `${label}: ${name} shows ${avg(a, s).toFixed(1)} out of 5`);
  }
}

// Loading the hub once creates the tables in an empty database.
await (await context(ADMIN)).request.get(`${B}/board`);
await sql`DELETE FROM survey_responses`;

if (!PUBLIC) {
  console.log("Before launch (SURVEY_PUBLIC unset)");
  const anon = await (await context(null)).newPage();
  ok((await anon.goto(`${B}/en/survey`)).status() === 404, "The public gets a 404 for /en/survey");
  ok((await post(good())).status === 404, "The public can't send answers to /api/survey");
  const home = await (await anon.goto(`${B}/en`)).text();
  ok(!home.includes("/en/survey"), "The home page doesn't link to the survey");
  ok(!(await (await anon.goto(`${B}/sitemap.xml`)).text()).includes("/survey"), "The sitemap leaves it out");

  const adminCtx = await context(ADMIN);
  const page = await adminCtx.newPage();
  const res = await page.goto(`${B}/en/survey`);
  ok(res.status() === 200, "A hub admin can open the preview");
  ok(await page.getByText("Private preview: only admins can see this page.").isVisible(), "…with the private preview banner");
  ok((await page.locator('meta[name="robots"]').getAttribute("content"))?.includes("noindex"), "…kept out of search engines");

  const a = answersBy((i) => [2, 4, 5, 3, 1][i % 5]);
  await takeSurvey(page, "/en/survey?src=workshop", a, {
    about: async (p) => {
      await p.getByLabel("Woman").check();
      await p.getByLabel("UCLA").check();
    },
  });
  const saved = await rows();
  ok(saved.length === 1 && saved[0].test === true, "The admin's answers are saved once, as a test");
  ok(saved[0].source === "workshop" && saved[0].locale === "en", "?src= and the language are saved");
  await checkScores(page, a, "Results");
  ok(await page.getByText("Where to start").isVisible(), "A tip points to a guide");
  const lowest = ["breakdown", "buying", "repair"].reduce((lo, k) => (avg(a, k) < avg(a, lo) ? k : lo), "breakdown");
  const guide = { breakdown: "/en/inspection", buying: "/en/documents", repair: "/en/fraud" }[lowest];
  ok((await page.locator(".sv-tip a").getAttribute("href")) === guide, `…for the lowest area (${lowest}: ${guide})`);
  ok((await page.getByRole("link", { name: "Come to a workshop" }).getAttribute("href")) === "/en/events", "Come to a workshop goes to /events");

  await page.reload();
  await page.getByText("You've already taken the survey. Thanks!").waitFor();
  ok(true, "Reloading shows the already-taken state");
  await checkScores(page, a, "Already taken");
  await page.getByRole("button", { name: "Take it again" }).click();
  ok(await page.getByRole("button", { name: "Start the survey" }).isVisible(), "Take it again starts over");

  // The hub tab.
  console.log("Hub: Survey tab");
  const member = await (await context(MEMBER)).newPage();
  await member.goto(`${B}/board`);
  await member.getByText("Signed in as").waitFor();
  ok((await member.locator("nav a", { hasText: "Survey" }).count()) === 0, "Members don't see the Survey tab");
  for (const [method, path] of [["GET", "/api/board/survey"], ["GET", "/api/board/survey/csv"], ["DELETE", "/api/board/survey"]]) {
    const r = await member.request.fetch(`${B}${path}?chapter=berkeley`, { method });
    ok(r.status() === 404, `Members get a 404 from ${method} ${path}`);
  }

  // Known responses: 6 women (one group), 3 men (too few to show).
  const w = answersBy((i, id) => (id.startsWith("buying") ? 2 : 4));
  const m = answersBy(() => 5);
  for (let i = 0; i < 6; i++)
    await sql`INSERT INTO survey_responses (created_at, questions_version, locale, source, answers, demographics) VALUES (${i < 3 ? "2026-10-05" : "2026-10-20"}, 1, 'en', ${i < 4 ? "instagram" : null}, ${sql.json(w)}, ${sql.json({ gender: "woman", student: "ucsc" })})`;
  for (let i = 0; i < 3; i++)
    await sql`INSERT INTO survey_responses (created_at, questions_version, locale, source, answers, demographics) VALUES ('2026-10-20', 1, 'es', 'ucsc', ${sql.json(m)}, ${sql.json({ gender: "man" })})`;

  // Admins of another chapter see the same org-wide data.
  const ucla = await context(UCLA_ADMIN, "ucla");
  const get = async (q = "") => (await ucla.request.get(`${B}/api/board/survey?chapter=ucla${q ? `&${q}` : ""}`)).json();
  let s = await get();
  ok(s.total === 9, "Totals leave out test responses by default (9)");
  ok(s.tests === 1 && (await get("test=1")).total === 10, "Include test responses adds the admin's test (10)");
  const exp = (6 * 2 + 3 * 5) / 9;
  ok(Math.abs(s.items.buying_1.avg - Math.round(exp * 100) / 100) < 0.01, `Item averages are right (buying_1 = ${exp.toFixed(2)})`);
  ok(JSON.stringify(s.items.buying_1.dist) === "[0,6,0,0,3]", "…with the 1–5 breakdown");
  ok(s.bySource.find((x) => x.key === "instagram")?.n === 4 && s.bySource.find((x) => x.key === "ucsc")?.n === 3, "Counts by source");
  ok(s.bySchool.find((x) => x.key === "ucsc")?.n === 6, "Counts by school");
  const women = s.splits.gender.find((g) => g.key === "woman");
  const men = s.splits.gender.find((g) => g.key === "man");
  ok(women?.n === 6 && women.sections.buying === 2 && women.sections.breakdown === 4, "Group split: women's averages");
  ok(men?.hidden === true && !("n" in men) && !("sections" in men), "Groups under 5 are hidden, with no numbers sent");
  ok((await get("from=2026-10-10")).total === 6, "Date filter: from");
  ok((await get("to=2026-10-10")).total === 3, "Date filter: to");
  ok((await get("source=instagram")).total === 4, "Source filter");
  ok((await get("source=(none)")).total === 2, "Source filter: no source");

  const csv = await (await ucla.request.get(`${B}/api/board/survey/csv?chapter=ucla`)).text();
  const lines = csv.replace(/^﻿/, "").trim().split("\r\n");
  const head = lines[0].split(",");
  ok(lines.length === 10, "CSV: one row per response (9) plus the header");
  ok(IDS.every((id) => head.includes(id)), "CSV: every item id is a column");
  ok(!/company|ip|agent|email|name/i.test(lines[0].replace("questions_version", "")), "CSV: no hidden or personal fields");
  ok((await (await ucla.request.get(`${B}/api/board/survey/csv?chapter=ucla&test=1`)).text()).trim().split("\r\n").length === 11, "CSV follows the test filter");

  // The tab in the browser.
  const tab = await ucla.newPage();
  await tab.goto(`${B}/board/ucla#survey`);
  await tab.getByText("Responses per week").waitFor();
  ok(await tab.locator("nav a", { hasText: "Survey" }).isVisible(), "Admins see the Survey tab");
  ok(await tab.getByText("Too few responses to show.").isVisible(), "The tab says when a group is too small");
  await tab.getByRole("button", { name: "Delete test responses" }).click();
  await tab.getByRole("button", { name: "Yes, delete" }).click();
  await tab.getByText("Deleted 1 test response.").waitFor();
  const left = await rows();
  ok(left.length === 9 && left.every((r) => !r.test), "Delete test responses removes only the tests");
} else {
  console.log("Public (SURVEY_PUBLIC=true)");
  const anonCtx = await context(null);
  const page = await anonCtx.newPage();
  const res = await page.goto(`${B}/es/survey?src=UCSC`);
  ok(res.status() === 200, "Anyone can open /es/survey");
  ok((await page.locator(".ev-preview").count()) === 0, "…with no preview banner");
  ok((await page.locator('meta[name="robots"][content*="noindex"]').count()) === 0, "…and search engines may index it");
  await page.goto(`${B}/en/survey?src=UCSC`);
  const a = answersBy((i) => [5, 4, 4, 3, 2][i % 5]);
  await takeSurvey(page, "/en/survey?src=UCSC", a, {
    about: async (p) => {
      await p.getByLabel("I have a driver's license").check();
      await p.getByLabel("None of these").check();
      ok(!(await p.getByLabel("I have a driver's license").isChecked()), "None of these clears the other experience answers");
      await p.getByLabel("Prefer to self-describe").first().check();
      await p.locator(".sv-self input").fill("  Genderfluid  ");
      await p.getByLabel("21–24").check();
    },
  });
  await checkScores(page, a, "Results");
  const saved = await rows();
  ok(saved.length === 1 && saved[0].test === false, "A full run saves one row, not a test");
  const r = saved[0];
  ok(JSON.stringify(Object.keys(r.answers).sort()) === JSON.stringify([...IDS].sort()), "…with exactly the 25 item ids");
  ok(IDS.every((id) => r.answers[id] === a[id]), "…and the right answers");
  ok(r.source === "ucsc", "?src=UCSC is saved as ucsc");
  const sorted = (o) => JSON.stringify(Object.entries(o).sort(([x], [y]) => x.localeCompare(y)));
  ok(sorted(r.demographics) === sorted({ experience: ["none"], gender: "self", genderSelf: "Genderfluid", age: "21_24" }), "Background answers are saved as option ids");
  const [{ data_type }] = await sql`SELECT data_type FROM information_schema.columns WHERE table_name = 'survey_responses' AND column_name = 'created_at'`;
  ok(data_type === "date", "Only the day is stored (created_at is a date, no time)");
  const cols = (await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'survey_responses' ORDER BY column_name`).map((c) => c.column_name);
  ok(JSON.stringify(cols) === JSON.stringify(["answers", "created_at", "demographics", "id", "locale", "questions_version", "source", "test"]), "The table has no name, email, IP, user agent or cookie columns");
  await page.reload();
  await page.getByText("You've already taken the survey. Thanks!").waitFor();
  ok(true, "Reloading shows the already-taken state");

  const home = await page.goto(`${B}/en`);
  ok((await home.text()).includes('href="/en/survey"'), "The home page links to the survey");
  ok(await page.getByText("Take the 5-minute survey").isVisible(), "…with Take the 5-minute survey");
  ok((await page.locator('.rd-hdr a[href="/en/survey"]').count()) === 1, "Learning Resources links to it");
  ok((await (await page.goto(`${B}/sitemap.xml`)).text()).includes("/en/survey"), "The sitemap lists it");

  console.log("Server checks");
  const n0 = (await rows()).length;
  const missing = good();
  delete missing.answers.repair_3;
  ok((await post(missing)).status === 422, "A missing 1–5 answer is refused");
  ok((await post(good({ answers: answersBy((i) => (i === 3 ? 6 : 3)) }))).status === 422, "An answer out of range is refused");
  ok((await post(good({ answers: { ...answersBy(() => 3), extra_1: 3 } }))).status === 422, "An unknown item is refused");
  const fast = await post(good({ started: token(5) }));
  ok(fast.status === 422 && (await fast.json()).error === "tooFast", "Finishing in under 40 seconds is refused");
  ok((await post(good({ started: `${Date.now() - 60_000}.forged` }))).status === 422, "A forged start time is refused");
  const bot = await post(good({ company: "Acme" }));
  ok(bot.status === 200 && (await rows()).length === n0, "The honeypot looks fine to a bot but saves nothing");
  const sneaky = await post(good({ demographics: { gender: "robot", race: ["asian", "x"], email: "a@b.c" }, source: "<b>" }));
  const last = (await rows()).at(-1);
  ok(sneaky.status === 200 && JSON.stringify(last.demographics) === '{"race":["asian"]}' && last.source === null, "Unknown background answers, extra fields and odd sources are dropped");
  const ip = "198.51.100.7";
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await post(good(), ip)).status);
  ok(codes.slice(0, 5).every((c) => c === 200) && codes[5] === 429, `The rate limit allows 5 per IP per hour (${codes.join(",")})`);
}

await browser.close();
await sql.end();
console.log(`\n${pass} passed, ${failN} failed`);
process.exit(failN ? 1 : 0);
