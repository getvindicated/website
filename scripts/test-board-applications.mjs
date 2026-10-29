// End-to-end checks for board applications (/apply and the hub's
// Applications tab). Run against a local server on an EMPTY test database,
// in outbox mode, with the same variables as the server:
//
//   DATABASE_URL=postgres://…/apply_test BOARD_INVITE_OUTBOX=/tmp/outbox \
//   BOARD_SESSION_SECRET=… BOARD_ADMIN_PASSWORD=… BOARD_PASSWORD=… \
//   BOARD_UCLA_ADMIN_PASSWORD=… BOARD_UCLA_PASSWORD=… pnpm start
//
//   (same variables) node scripts/test-board-applications.mjs
//
// TEST_BASE_URL defaults to http://localhost:3000. It never sends real
// email: everything lands in BOARD_INVITE_OUTBOX.
import { readdirSync, readFileSync } from "node:fs";
import postgres from "postgres";
const B = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const OUT = process.env.BOARD_INVITE_OUTBOX;
const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Set ${k} (see the top of this file).`);
  return v;
};
const sql = postgres(env("DATABASE_URL"), { max: 1 });
if (!OUT) throw new Error("Set BOARD_INVITE_OUTBOX (see the top of this file).");
let pass = 0, failN = 0;
const ok = (cond, label) => { if (cond) { pass++; console.log("  ✓", label); } else { failN++; console.log("  ✗", label); } };
let ipN = 1;
const ip = () => ({ "x-forwarded-for": `10.0.0.${ipN++}` });
const pacificToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
const shift = (iso, d) => { const t = new Date(iso + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10); };
const outbox = () => readdirSync(OUT).filter((f) => f.endsWith(".eml")).sort();
// Header block with folded lines joined, plus the decoded body.
const eml = (f) => {
  const raw = readFileSync(`${OUT}/${f}`, "utf8");
  const [head, ...rest] = raw.split("\r\n\r\n");
  const body = rest.join("\n").replace(/=\r\n/g, "").replace(/=([0-9A-F]{2})/g, "%$1");
  let text = body; try { text = decodeURIComponent(body.replace(/%(?![0-9A-F]{2})/g, "%25")); } catch {}
  return head.replace(/\r\n[ \t]+/g, " ") + "\n\n" + text;
};

async function login(chapter, password) {
  const r = await fetch(`${B}/api/board/login?chapter=${chapter}`, { method: "POST", headers: { "content-type": "application/json", ...ip() }, body: JSON.stringify({ password }) });
  return (r.headers.get("set-cookie") ?? "").split(";")[0];
}
const hub = (cookie, chapter) => async (path, method = "GET", body) => {
  const r = await fetch(`${B}${path}${path.includes("?") ? "&" : "?"}chapter=${chapter}`, {
    method, headers: { cookie, "x-board-actor": "Test Admin", ...(body ? { "content-type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let j = null; try { j = JSON.parse(text); } catch {}
  return { status: r.status, j, text, headers: r.headers };
};

const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
function form(o = {}) {
  const f = new FormData();
  const v = { chapter: "berkeley", positions: ["Outreach Lead"], name: "Ada Lovelace", email: "ada@example.com", phone: "510 555 0100", year: "3", major: "Computer Science", why: "I want to help people buy cars without getting scammed.", bring: "Ran outreach for two campus clubs and built a small website.", hours: "6", link: "linkedin.com/in/ada", heard: "Instagram", commit: "yes", locale: "en", ...o };
  for (const [k, val] of Object.entries(v)) {
    if (k === "resume") continue;
    if (Array.isArray(val)) val.forEach((x) => f.append(k, x)); else if (val !== null) f.append(k, val);
  }
  if (o.resume) f.append("resume", new Blob([o.resume.data], { type: o.resume.type ?? "application/pdf" }), o.resume.name);
  return f;
}
const apply = async (o) => {
  const r = await fetch(`${B}/api/apply`, { method: "POST", body: form(o), headers: ip() });
  return { status: r.status, j: await r.json().catch(() => null) };
};
const page = async (p) => (await fetch(`${B}${p}`)).text();

const admin = hub(await login("berkeley", env("BOARD_ADMIN_PASSWORD")), "berkeley");
const member = hub(await login("berkeley", env("BOARD_PASSWORD")), "berkeley");
const uclaAdmin = hub(await login("ucla", env("BOARD_UCLA_ADMIN_PASSWORD")), "ucla");

console.log("Closed chapter");
let html = await page("/en/apply");
ok(html.includes("Board applications are closed right now."), "closed message shows when every chapter is closed");
ok(/href="\/en\/join#apply"/.test(html), "button to the volunteer form");
ok(!html.includes('name="why"') && !html.includes("ba-why"), "no application form while closed");
let r = await apply({});
ok(r.status === 409 && r.j?.error === "closed", `server refuses a closed chapter (${r.status} ${r.j?.error})`);
const n1 = await fetch(`${B}/api/apply/notify`, { method: "POST", headers: { "content-type": "application/json", ...ip() }, body: JSON.stringify({ chapter: "berkeley", email: "Wait@Example.com", locale: "es" }) });
const n2 = await fetch(`${B}/api/apply/notify`, { method: "POST", headers: { "content-type": "application/json", ...ip() }, body: JSON.stringify({ chapter: "berkeley", email: "wait@example.com" }) });
const n3 = await fetch(`${B}/api/apply/notify`, { method: "POST", headers: { "content-type": "application/json", ...ip() }, body: JSON.stringify({ chapter: "berkeley", email: "not-an-email" }) });
ok(n1.status === 200 && n2.status === 200 && n3.status === 422, "email-me-when-open saves, bad emails refused");
let g = await admin("/api/board/applications");
ok(g.j.notify.length === 1 && g.j.notify[0].email === "wait@example.com", "notify list has the email once");
ok(g.j.config.open === false && g.j.closedReason === "off", "applications are off by default");

console.log("Members can't see applicant data");
for (const p of ["/api/board/applications", "/api/board/applications/csv", "/api/board/applications/1/resume"]) {
  const m = await member(p);
  ok(m.status === 404, `member gets 404 for ${p}`);
}
ok((await member("/api/board/applications", "PUT", { open: true, deadline: null, positions: ["X"], term: "Fall 2026" })).status === 404, "member can't open applications");
ok((await fetch(`${B}/api/board/applications?chapter=berkeley`)).status === 404, "signed-out request gets 404");
ok((await uclaAdmin("/api/board/applications")).j.notify.length === 0, "UCLA admin doesn't see Berkeley's list");

console.log("Opening");
ok((await admin("/api/board/applications", "PUT", { open: true, deadline: null, positions: [], term: "Fall 2026" })).status === 400, "can't open without positions");
const deadline = shift(pacificToday(), 21);
r = await admin("/api/board/applications", "PUT", { open: true, deadline, positions: ["Outreach Lead", "Data Engineer", "Research Analyst", "Design Lead"], term: "Fall 2026" });
ok(r.status === 200, "admin opens Berkeley with positions and a deadline");
await uclaAdmin("/api/board/applications", "PUT", { open: true, deadline: null, positions: ["Research Lead"], term: "Fall 2026" });
html = await page("/en/apply");
ok(html.includes('id="ba-chapter"') && html.includes("Outreach Lead") && !html.includes('<h2 class="h2">Board applications are closed'), "form shows with open positions");
const mon = new Date(deadline + "T12:00:00Z").toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
ok(html.includes(`Open until ${mon}`), `status says "Open until ${mon}"`);
const join = await page("/en/join");
ok(join.includes("Apply for the board") && join.includes(`Open until ${mon}`) && join.includes('href="/en/apply"'), "Get Involved shows the board section, status and link");

console.log("Validation");
const before = outbox().length;
const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
r = await apply({ why: words(151) }); ok(r.status === 422 && r.j.error === "why", "151-word answer refused");
r = await apply({ bring: words(151) }); ok(r.status === 422 && r.j.error === "bring", "151-word 'bring' refused");
r = await apply({ commit: null }); ok(r.status === 422 && r.j.error === "commit", "missing commitment checkbox refused");
r = await apply({ positions: ["Outreach Lead", "Data Engineer", "Research Analyst", "Design Lead"] }); ok(r.status === 422 && r.j.error === "positions", "4 positions refused");
r = await apply({ positions: ["President"] }); ok(r.status === 422 && r.j.error === "positions", "position that isn't open refused");
r = await apply({ positions: [] }); ok(r.status === 422 && r.j.error === "positions", "no position refused");
r = await apply({ year: "7" }); ok(r.status === 422 && r.j.error === "year", "bad year refused");
r = await apply({ hours: "0" }); ok(r.status === 422 && r.j.error === "hours", "0 hours refused");
r = await apply({ email: "nope" }); ok(r.status === 422 && r.j.error === "email", "bad email refused");
r = await apply({ link: "javascript:alert(1)" }); ok(r.status === 422 && r.j.error === "link", "non-web link refused");
r = await apply({ resume: { data: Buffer.from("hello, not a pdf"), name: "resume.pdf" } }); ok(r.status === 415 && r.j.error === "resumeType", "fake PDF refused");
r = await apply({ resume: { data: PDF, name: "resume.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } }); ok(r.status === 415, "Word file refused");
const big = Buffer.concat([PDF, Buffer.alloc(2 * 1024 * 1024)]);
r = await apply({ resume: { data: big, name: "big.pdf" } }); ok(r.status === 413 && r.j.error === "resumeSize", "resume over 2 MB refused");
r = await apply({ chapter: "ucsc" }); ok(r.status === 422 && r.j.error === "chapter", "unknown chapter refused");
ok(outbox().length === before, "no emails for refused applications");
ok((await admin("/api/board/applications")).j.applications.length === 0, "nothing saved for refused applications");

console.log("Valid application");
r = await apply({ why: words(150), resume: { data: PDF, name: "Ada Resume.pdf" } });
ok(r.status === 201 && r.j.ok && r.j.email === "ada@example.com", "valid application saved (150 words is fine)");
let mails = outbox().slice(before);
ok(mails.length === 2, `two emails (${mails.length})`);
const confirm = mails.map(eml).find((m) => /^To: .*ada@example\.com/m.test(m));
const notice = mails.map(eml).find((m) => /^Subject: \[VINdicated Board\] Board application/m.test(m));
ok(confirm && /Subject: We got your application: VINdicated UC Berkeley board/.test(confirm), "applicant gets a confirmation");
ok(confirm && confirm.includes("Computer Science") && confirm.includes("Ada Resume.pdf"), "confirmation has a copy of the answers");
ok(notice && /^To: .*ranadarwich05@gmail\.com/m.test(notice) && /Subject: \[VINdicated Board\] Board application: Ada Lovelace/.test(notice), "Berkeley notice goes to Rana");
ok(notice && notice.includes("?application=") && notice.includes("#applications") && /Reply-To: .*ada@example\.com/.test(notice), "notice links to the hub and replies go to the applicant");
g = await admin("/api/board/applications");
const ada = g.j.applications[0];
ok(g.j.applications.length === 1 && ada.status === "new" && ada.hasResume && ada.link === "https://linkedin.com/in/ada", "hub lists it as New with the resume");

console.log("Duplicate updates instead of doubling");
const b2 = outbox().length;
r = await apply({ email: "ADA@example.com", major: "Data Science", positions: ["Data Engineer"] });
ok(r.status === 201 && !("updated" in r.j), "second application accepted, and the reply doesn't reveal it was a repeat");
g = await admin("/api/board/applications");
ok(g.j.applications.length === 1 && g.j.applications[0].major === "Data Science" && g.j.applications[0].hasResume, "still one application, new answers, resume kept");
ok(outbox().slice(b2).some((f) => /Updated board application/.test(eml(f))), "chapter told it was updated");
ok(outbox().slice(b2).some((f) => /^To: .*ada@example\.com/im.test(eml(f)) && /You applied again/.test(eml(f))), "applicant's confirmation says it replaced their earlier answers");

console.log("UCLA routing");
const b3 = outbox().length;
r = await apply({ chapter: "ucla", positions: ["Research Lead"], email: "bruin@example.com", name: "Joe Bruin", locale: "es" });
ok(r.status === 201, "UCLA application saved");
const u = outbox().slice(b3).map(eml);
const uNotice = u.find((m) => /^Subject: \[VINdicated UCLA\]/m.test(m));
ok(uNotice && /^To: .*fionarhine@ucla\.edu.*prawira\.j\.william@gmail\.com/m.test(uNotice) && /^Cc: .*ranadarwich05@gmail\.com/m.test(uNotice), "UCLA notice to Fiona and Will, cc Rana");
const uConfirm = u.find((m) => /^To: .*bruin@example\.com/m.test(m)) ?? "";
ok(/Hola, Joe/.test(uConfirm) && /Tu solicitud/.test(uConfirm), "Spanish applicant gets the confirmation in Spanish");
ok((await admin("/api/board/applications")).j.applications.every((a) => a.email !== "bruin@example.com"), "Berkeley hub doesn't show UCLA's applicant");

console.log("Hub actions");
let p = await admin(`/api/board/applications/${ada.id}`, "PATCH", { status: "interview" });
ok(p.status === 200, "status → Interview");
p = await admin(`/api/board/applications/${ada.id}`, "PATCH", { notes: "Strong outreach background." });
ok(p.status === 200, "notes saved");
ok((await admin(`/api/board/applications/${ada.id}`, "PATCH", { status: "hired" })).status === 400, "unknown status refused");
g = await admin("/api/board/applications");
ok(g.j.applications[0].status === "interview" && g.j.applications[0].notes === "Strong outreach background.", "status and notes stored");
const pdf = await admin(`/api/board/applications/${ada.id}/resume`);
ok(pdf.status === 200 && pdf.headers.get("content-type") === "application/pdf" && /attachment/.test(pdf.headers.get("content-disposition")), "admin downloads the resume");
const b4 = outbox().length;
let e = await admin(`/api/board/applications/${ada.id}/email`, "POST", { subject: "Interview with VINdicated", body: "Hi Ada,\n\nCan you meet Tuesday at 5?\n\nRana" });
const sentMail = outbox().slice(b4).map(eml)[0] ?? "";
ok(e.status === 200 && /^To: .*ada@example\.com/m.test(sentMail) && /Subject: Interview with VINdicated/.test(sentMail) && /^From: .*president@getvindicated\.org/m.test(sentMail), "Email applicant sends from the chapter sender");
ok((await admin(`/api/board/applications/${ada.id}/email`, "POST", { subject: "", body: "x" })).status === 400, "email needs a subject");
ok((await admin(`/api/board/applications/${ada.id}/member`, "POST", { role: "President", team: "Executive" })).status === 400, "role must be one they applied for");
ok((await admin(`/api/board/applications/${ada.id}/member`, "POST", { role: "Data Engineer", team: "Nope" })).status === 400, "team must be one of the chapter's");
let m2 = await admin(`/api/board/applications/${ada.id}/member`, "POST", { role: "Data Engineer", team: "Executive" });
ok(m2.status === 201, `Add to board (${m2.status} ${m2.text.slice(0, 80)})`);
const mem = await admin(`/api/board/applications/${ada.id}/member`, "POST", { role: "Data Engineer", team: "Executive" });
ok(mem.status === 400, "can't add the same person twice");
const csv = await admin("/api/board/applications/csv?status=interview&position=Data%20Engineer");
ok(csv.status === 200 && csv.text.includes("Ada Lovelace") && csv.text.includes("Interview") && !csv.text.includes("Strong outreach") && !csv.text.includes("%PDF"), "CSV for the filter, without notes or resumes");
const csv2 = await admin("/api/board/applications/csv?status=declined");
ok(csv2.text.split("\r\n").filter(Boolean).length === 1, "CSV respects the filter (header only)");

console.log("Change log");
const logRows = (await sql`SELECT summary FROM board_changelog WHERE chapter = 'berkeley' ORDER BY id`).map((r) => r.summary).join("\n");
ok(/Opened board applications/.test(logRows), "opening is logged");
ok(/Ada Lovelace: marked Interview/.test(logRows) && /Ada Lovelace: edited the notes/.test(logRows), "status and notes changes are logged");
ok(/Emailed Ada Lovelace/.test(logRows) && /Added Ada Lovelace to the board/.test(logRows), "emails and Add to board are logged");
const memberRow = (await sql`SELECT name, first_name, role, team, email, phone FROM board_members WHERE chapter = 'berkeley'`)
  .map((r) => [r.name, r.first_name, r.role, r.team, r.email, r.phone].join("|"))
  .join("\n");
ok(memberRow === "Ada Lovelace|Ada|Data Engineer|Executive|ada@example.com|510 555 0100", `member entry made (${memberRow})`);

console.log("Auto-close after the deadline");
await admin("/api/board/applications", "PUT", { open: true, deadline: pacificToday(), positions: ["Outreach Lead", "Data Engineer"], term: "Fall 2026" });
r = await apply({ email: "today@example.com" });
ok(r.status === 201, "deadline today: still open");
await admin("/api/board/applications", "PUT", { open: true, deadline: shift(pacificToday(), -1), positions: ["Outreach Lead", "Data Engineer"], term: "Fall 2026" });
r = await apply({ email: "late@example.com" });
ok(r.status === 409 && r.j.error === "closed", "deadline yesterday: closed");
g = await admin("/api/board/applications");
ok(g.j.closedReason === "deadline" && g.j.config.open === true, "hub says the deadline passed (switch still on)");
html = await page("/en/apply");
ok(html.includes("Board applications are closed right now for UC Berkeley") || html.includes("closed right now for UC Berkeley"), "page lists Berkeley as closed while UCLA is open");

console.log("Deletes");
await admin("/api/board/applications", "PUT", { open: false, deadline: null, positions: ["Outreach Lead"], term: "Spring 2027" });
r = await admin("/api/board/applications/purge", "POST", {});
ok(r.status === 200 && r.j.deleted === 2, `delete all from past terms (${r.j?.deleted})`);
ok((await admin("/api/board/applications")).j.applications.length === 0, "past-term applications gone");
ok((await admin(`/api/board/applications/${ada.id}/resume`)).status === 404, "their resumes are gone too");
const ug = await uclaAdmin("/api/board/applications");
const bruin = ug.j.applications[0];
ok((await uclaAdmin(`/api/board/applications/${bruin.id}`, "DELETE")).status === 200 && (await uclaAdmin("/api/board/applications")).j.applications.length === 0, "admin deletes one application");
ok((await admin("/api/board/applications/notify", "DELETE", {})).j.removed === 1, "notify list cleared");

const after = (await sql`SELECT summary FROM board_changelog WHERE chapter = 'berkeley' ORDER BY id DESC LIMIT 3`).map((r) => r.summary).join("\n");
ok(/Deleted 2 board applications from terms before Spring 2027/.test(after), "past-term delete is logged without content");
await sql.end();
console.log(`\n${pass} passed, ${failN} failed`);
process.exit(failN ? 1 : 0);
