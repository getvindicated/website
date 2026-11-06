// End-to-end checks for the UC Santa Cruz hub (/board/ucsc, the simple
// layout), in a real browser. Run against a local server on an EMPTY test
// database, in outbox mode, with the same variables as the server:
//
//   DATABASE_URL=postgres://…/ucsc_test BOARD_INVITE_OUTBOX=/tmp/outbox BREVO_API_KEY=stub \
//   BOARD_INVITE_FROM="VINdicated <board@getvindicated.org>" BOARD_SESSION_SECRET=… \
//   BOARD_UCSC_PASSWORD=… BOARD_UCSC_ADMIN_PASSWORD=… BOARD_ADMIN_PASSWORD=… \
//   BOARD_UCLA_ADMIN_PASSWORD=… pnpm start
//
//   (same variables) NODE_PATH=$(npm root -g) node scripts/test-board-ucsc.mjs
//
// It needs Playwright with Chromium (npx playwright install chromium);
// NODE_PATH lets it use a global install. TEST_BASE_URL defaults to
// http://localhost:3000. Nothing is really sent: every email lands in
// BOARD_INVITE_OUTBOX. It gives test members example.com addresses.
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import postgres from "postgres";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const B = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Set ${k} (see the top of this file).`);
  return v;
};
const OUT = env("BOARD_INVITE_OUTBOX");
const MEMBER = env("BOARD_UCSC_PASSWORD");
const ADMIN = env("BOARD_UCSC_ADMIN_PASSWORD");
const sql = postgres(env("DATABASE_URL"), { max: 1 });

let pass = 0;
let failN = 0;
const ok = (cond, label) => {
  if (cond) pass++;
  else failN++;
  console.log(cond ? "  ✓" : "  ✗", label);
};

const mails = () => (existsSync(OUT) ? readdirSync(OUT).filter((f) => f.endsWith(".eml")).sort() : []);
// Headers (folded lines joined), the raw body, and the calendar file
// written next to an invite.
const read = (f) => {
  const raw = readFileSync(`${OUT}/${f}`, "utf8");
  const [head, ...rest] = raw.split("\r\n\r\n");
  const icsFile = `${OUT}/${f.replace(/\.eml$/, ".ics")}`;
  const ics = existsSync(icsFile) ? readFileSync(icsFile, "utf8") : "";
  return { head: head.replace(/\r\n[ \t]+/g, " "), body: rest.join("\n").replace(/=\r\n/g, ""), ics };
};
const since = (n) => mails().slice(n).map(read);
const pacific = (days = 0) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date(Date.now() + days * 864e5));

const browser = await chromium.launch();
async function signIn(password, name) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${B}/board/ucsc`);
  await page.fill("#board-password", password);
  await page.click("button[type=submit]");
  await page.waitForSelector("text=Who are you?");
  if (name) {
    await page.click(`.people button:has-text("${name}")`);
    await page.waitForSelector("text=Your tasks this week");
  }
  return page;
}
const tab = async (page, name) => {
  await page.click(`nav.tabs a:has-text("${name}")`);
  await page.waitForTimeout(200);
};
const toast = async (page) => (await page.locator(".toast").innerText({ timeout: 15000 })).trim();
// Waits for a toast matching `re` (an earlier one may still be showing).
const toastLike = async (page, re) => {
  const t = page.locator(".toast").filter({ hasText: re });
  await t.waitFor({ timeout: 20000 }).catch(() => {});
  return (await t.count()) ? (await t.innerText()).trim() : await toast(page);
};
const settle = (page, ms = 1200) => page.waitForTimeout(ms);

try {
  console.log("Sign-in");
  const bad = await browser.newPage();
  await bad.goto(`${B}/board/ucsc`);
  ok((await bad.locator("text=Use the board password Ashwin shared with you.").count()) === 1, "sign-in screen with the help line");
  ok((await bad.locator('a:has-text("Take me to Berkeley\'s hub")').count()) === 1 && (await bad.locator('a:has-text("Take me to UCLA\'s hub")').count()) === 1, "links to the Berkeley and UCLA hubs");
  await bad.fill("#board-password", "wrong-password");
  await bad.click("button[type=submit]");
  await bad.waitForSelector("text=That password isn't right.");
  ok(true, "a wrong password is refused");
  await bad.close();

  console.log("Who are you?");
  // The first signed-in page load sets up the database.
  const saanvi = await signIn(MEMBER);
  // Test addresses for a few members, so invites and announcements have
  // someone to reach.
  for (const [name, email] of [
    ["Ashwin Vinod", "ashwin@example.com"],
    ["Saanvi Nadendla", "saanvi@example.com"],
    ["William Guo", "william@example.com"],
  ]) {
    await sql`UPDATE board_members SET email = ${email}, phone = '555 010 0000' WHERE chapter = 'ucsc' AND name = ${name}`;
  }

  await saanvi.reload();
  await saanvi.waitForSelector("text=Who are you?");
  const names = await saanvi.locator(".people b").allInnerTexts();
  ok(names.length === 8 && names.includes("Ashwin Vinod"), `name list from the member list (${names.length})`);
  await saanvi.click('.people button:has-text("Saanvi Nadendla")');
  await saanvi.waitForSelector("text=Hi, Saanvi");
  await saanvi.reload();
  await saanvi.waitForSelector("text=Hi, Saanvi");
  ok(true, "the device remembers the person after a reload");
  ok((await saanvi.locator("text=No tasks for you this week yet.").count()) === 1, "no tasks yet: the empty message");
  ok((await saanvi.locator('button:has-text("Post")').count()) === 0, "members don't see Post");
  await tab(saanvi, "Tasks");
  ok((await saanvi.locator('button:has-text("Add a task")').count()) === 0 && (await saanvi.locator('button:has-text("Start a new week")').count()) === 0, "members don't see task admin buttons");
  await tab(saanvi, "Calendar");
  ok((await saanvi.locator('button:has-text("Add to calendar")').count()) === 0, "members can't add to the calendar");
  await saanvi.click("text=Not you?");
  await saanvi.waitForSelector("text=Who are you?");
  ok(true, "Not you? goes back to the name list");
  await saanvi.click('.people button:has-text("Saanvi Nadendla")');
  await saanvi.waitForSelector("text=Hi, Saanvi");

  console.log("Admin: tasks");
  const admin = await signIn(ADMIN, "Ashwin Vinod");
  await tab(admin, "Tasks");
  const addTask = async (who, text, due) => {
    await admin.click('button:has-text("Add a task")');
    await admin.selectOption("#who-new", { label: who });
    await admin.fill("#what-new", text);
    await admin.fill("#due-new", due);
    await admin.click('button:has-text("Add task")');
    await admin.waitForSelector(`.task-text:has-text("${text}")`);
  };
  await addTask("Saanvi Nadendla", "Draft the Instagram intro post", pacific(3));
  await addTask("Saanvi Nadendla", "Pick three photos for the reel", pacific(4));
  await addTask("William Guo", "Fix the Discord roles", pacific(-1));
  await addTask("William Guo", "Throwaway task", pacific(2));
  ok((await admin.locator(".task").count()) === 4, "admin adds tasks for people");
  const row = admin.locator(".task", { hasText: "Pick three photos for the reel" });
  await row.locator('button:has-text("Edit")').click();
  await admin.locator('form.panel input[id^="what-"]').fill("Pick four photos for the reel");
  await admin.click('form.panel button:has-text("Save")');
  await admin.waitForSelector('.task-text:has-text("Pick four photos for the reel")');
  ok(true, "admin edits a task");
  const doomed = admin.locator(".task", { hasText: "Throwaway task" });
  await doomed.locator('button:has-text("Delete")').click();
  await doomed.locator('button:has-text("Yes, delete it")').click();
  await admin.waitForSelector('.task-text:has-text("Throwaway task")', { state: "detached" });
  ok(true, "admin deletes a task");
  ok((await admin.locator(".task", { hasText: "Fix the Discord roles" }).locator(".pill").innerText()) === "Late", "past due and not done shows Late");

  console.log("Home: only your tasks, Submit and Undo");
  await saanvi.reload();
  await tab(saanvi, "Home");
  await saanvi.waitForSelector("text=Draft the Instagram intro post");
  const home = await saanvi.locator(".task-text").allInnerTexts();
  ok(home.length === 2 && !home.includes("Fix the Discord roles"), "Home shows only Saanvi's tasks");
  const n = mails().length;
  await saanvi.locator(".task", { hasText: "Draft the Instagram intro post" }).locator('button:has-text("Submit")').click();
  await saanvi.waitForSelector("text=Submit: Draft the Instagram intro post");
  await saanvi.fill("#sub-link", "https://example.com/draft");
  await saanvi.fill("#sub-note", "First draft is in the doc.");
  await saanvi.setInputFiles("#sub-file", { name: "draft.txt", mimeType: "text/plain", buffer: Buffer.from("draft") });
  await saanvi.click('dialog button[type=submit]');
  ok((await toastLike(saanvi, /Submitted/)) === "Submitted! Ashwin got an email.", "toast: Submitted! Ashwin got an email.");
  await settle(saanvi);
  const [sub] = await sql`SELECT person, body, filenames FROM board_submissions WHERE chapter = 'ucsc' ORDER BY id DESC LIMIT 1`;
  ok(sub && sub.person === "Saanvi" && sub.body.includes("https://example.com/draft") && sub.filenames.includes("draft.txt"), "the submission is stored with the link, note and file");
  const subMail = since(n).find((m) => /Subject: \[VINdicated UCSC\]/.test(m.head));
  ok(subMail && /^To: .*asvinod@ucsc\.edu/m.test(subMail.head) && /^Cc: .*ranadarwich05@gmail\.com/m.test(subMail.head), "emailed to Ashwin, cc Rana");
  ok(subMail && /^Reply-To: .*saanvi@example\.com/m.test(subMail.head) && /draft\.txt/.test(subMail.body), "reply-to is Saanvi and the file is attached");
  const state = async (text) => (await saanvi.locator(".task", { hasText: text }).locator(".pill").innerText()).trim();
  ok((await state("Draft the Instagram intro post")) === "Done", "the task is marked Done");
  await saanvi.locator(".task", { hasText: "Pick four photos" }).locator('button:has-text("Submit")').click();
  await saanvi.fill("#sub-note", "Picked them.");
  await saanvi.click('dialog button[type=submit]');
  await toast(saanvi);
  await settle(saanvi);
  ok((await saanvi.locator("text=You're all caught up. Nice work!").count()) === 1, "all done: You're all caught up. Nice work!");
  await saanvi.locator(".task", { hasText: "Pick four photos" }).locator('button:has-text("Undo")').click();
  await toast(saanvi);
  await settle(saanvi);
  ok((await state("Pick four photos for the reel")) === "To do", "Undo puts it back to To do");

  console.log("Admin: announcements");
  await tab(admin, "Home");
  let before = mails().length;
  await admin.click('button:has-text("Post")');
  await admin.fill("#post-title", "Tabling on Friday");
  await admin.fill("#post-body", "Meet at Quarry Plaza at noon.");
  ok(await admin.locator('label.check:has-text("Also email the whole board") input').isChecked(), "Also email the whole board is checked by default");
  await admin.click('form.panel button[type=submit]');
  ok(/Posted and emailed to 3 people/.test(await toastLike(admin, /Posted/)), "posted and emailed to the people with an email on file");
  await settle(admin);
  const ann = since(before).filter((m) => /Tabling on Friday/.test(m.head));
  ok(ann.length === 3 && ann.every((m) => /^From: "?VINdicated at UCSC"? <board@getvindicated\.org>/m.test(m.head)), "announcement emails come from VINdicated at UCSC (fallback address until verified)");
  ok((await admin.locator(".post", { hasText: "Tabling on Friday" }).locator(".by").innerText()).startsWith("Ashwin Vinod"), "the post shows who posted it");
  await admin.locator(".post", { hasText: "Tabling on Friday" }).locator('button:has-text("Remove")').click();
  await admin.locator(".post", { hasText: "Tabling on Friday" }).locator('button:has-text("Yes, remove it")').click();
  await admin.waitForSelector('.post:has-text("Tabling on Friday")', { state: "detached" });
  ok(true, "admin removes an announcement");

  console.log("Admin: calendar");
  await tab(admin, "Calendar");
  before = mails().length;
  await admin.click('button:has-text("Add to calendar")');
  await admin.selectOption("#cal-kind", "meeting");
  await admin.fill("#cal-date", pacific(6));
  await admin.fill("#cal-title", "Board meeting");
  await admin.fill("#cal-start", "18:00");
  await admin.fill("#cal-end", "19:00");
  await admin.fill("#cal-where", "Baskin Engineering 152");
  await admin.click('button:has-text("Add and send invites")');
  const added = await toastLike(admin, /Invites went to/);
  ok(/Invites went to 3 people/.test(added), `invites sent to the board (${added})`);
  await settle(admin);
  const invites = since(before);
  ok(invites.length === 3 && invites.every((m) => /METHOD:REQUEST/.test(m.ics)), "each invite carries a calendar request");
  ok((await admin.locator(".card .kind").first().innerText()) === "MEETING", "the calendar shows the type");
  const [meeting] = await sql`SELECT id FROM board_scheduled WHERE chapter = 'ucsc' ORDER BY id DESC LIMIT 1`;
  const icsRes = await admin.request.get(`${B}/api/board/schedule/${meeting.id}/ics?chapter=ucsc`);
  ok(icsRes.ok() && /METHOD:PUBLISH/.test(await icsRes.text()), "Add to calendar downloads an .ics");
  await saanvi.reload();
  await tab(saanvi, "Home");
  await saanvi.waitForSelector("text=Your tasks this week");
  ok((await saanvi.locator("section", { hasText: "Next meeting" }).innerText()).includes("Board meeting"), "Home shows the next meeting");
  before = mails().length;
  await admin.locator(".card", { hasText: "Board meeting" }).locator('button:has-text("Cancel")').click();
  await admin.click('button:has-text("Yes, cancel it")');
  const cancelled = await toastLike(admin, /Cancelled/);
  ok(/Cancelled/.test(cancelled), `admin cancels it (${cancelled})`);
  await settle(admin);
  ok(since(before).filter((m) => /METHOD:CANCEL/.test(m.ics)).length === 3, "everyone gets the cancellation");
  ok((await admin.locator("text=Nothing on the calendar yet.").count()) === 1, "it's off the calendar");

  console.log("Admin: start a new week");
  await tab(admin, "Tasks");
  await admin.click('button:has-text("Start a new week")');
  await admin.click('button:has-text("Yes, start a new week")');
  await admin.waitForSelector("text=No tasks this week yet.");
  ok(true, "the new week starts empty");
  await admin.click('button:has-text("Earlier weeks")');
  const weeks = await admin.locator("h2").allInnerTexts();
  ok(weeks.filter((h) => h.startsWith("Week of")).length === 2 && weeks.includes("Week of Oct 15"), `earlier weeks are listed (${weeks.filter((h) => h.startsWith("Week of")).join(", ")})`);
  const archived = admin.locator(".task", { hasText: "Draft the Instagram intro post" });
  ok((await archived.locator(".pill").innerText()) === "Done", "archived tasks keep Done");
  ok((await admin.locator(".task", { hasText: "Fix the Discord roles" }).locator(".pill").innerText()) === "Not done", "archived tasks keep Not done");

  console.log("Team");
  await tab(saanvi, "Team");
  const heads = (await saanvi.locator(".team-head").allInnerTexts()).join("|");
  ok(heads.toLowerCase() === "executive|software & data|research|marketing", `teams in order (${heads})`);
  ok((await saanvi.locator(".person-card", { hasText: "Ashwin Vinod" }).locator('a:has-text("Email")').getAttribute("href")) === "mailto:ashwin@example.com", "Email button");
  ok((await saanvi.locator(".person-card", { hasText: "Ashwin Vinod" }).locator('a:has-text("Call")').getAttribute("href")) === "tel:5550100000", "Call button");
  ok((await saanvi.locator('button:has-text("Edit")').count()) === 0, "members can't edit people");
  await tab(admin, "Team");
  await admin.locator(".person-card", { hasText: "Aryan Bhatia" }).locator('button:has-text("Edit")').click();
  await admin.locator('form.panel input[id$="-role"]').fill("Research Lead");
  await admin.click('form.panel button:has-text("Save")');
  await admin.waitForSelector('.person-card:has-text("Research Lead")');
  ok(true, "admin edits a person");

  console.log("Server checks");
  const memberCookie = (await saanvi.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
  const r = await fetch(`${B}/api/board/assignments?chapter=ucsc`, {
    method: "POST",
    headers: { cookie: memberCookie, "content-type": "application/json" },
    body: JSON.stringify({ round: 1, person: "Saanvi", task: "x" }),
  });
  ok(r.status === 404, "members can't add tasks through the API");

  console.log("Berkeley and UCLA");
  const other = await browser.newPage();
  await other.goto(`${B}/board`);
  ok((await other.locator('a:has-text("Take me to UCSC\'s hub")').count()) === 1 && (await other.locator('a:has-text("Take me to UCLA\'s hub")').count()) === 1, "Berkeley sign-in links to UCLA and UCSC");
  await other.goto(`${B}/board/ucla`);
  ok((await other.locator('a:has-text("Take me to UCSC\'s hub")').count()) === 1 && (await other.locator('a:has-text("Take me to Berkeley\'s hub")').count()) === 1, "UCLA sign-in links to Berkeley and UCSC");
  await other.goto(`${B}/board`);
  await other.fill("#board-password", env("BOARD_ADMIN_PASSWORD"));
  await other.click("button[type=submit]");
  await other.waitForSelector('nav[aria-label="Sections"] >> text=My page');
  ok(true, "Berkeley still opens the classic hub");
} finally {
  await browser.close();
  await sql.end();
}

console.log(`\n${pass} passed, ${failN} failed`);
process.exit(failN ? 1 : 0);
