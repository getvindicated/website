// End-to-end checks for event RSVP emails: "Location to be announced",
// "Send the location to everyone" (updated calendar invite: same UID,
// higher SEQUENCE), and the VINdicated / VINdicated at UCLA sender name.
// Run against a local server on an EMPTY test database, in outbox mode,
// with events public and the same variables as the server:
//
//   EVENTS_PUBLIC=true DATABASE_URL=postgres://…/events_test BOARD_INVITE_OUTBOX=/tmp/outbox \
//   BOARD_SESSION_SECRET=… BOARD_ADMIN_PASSWORD=… BOARD_UCLA_ADMIN_PASSWORD=… pnpm start
//
//   (same variables) node scripts/test-event-emails.mjs
//
// TEST_BASE_URL defaults to http://localhost:3000. Nothing is really sent:
// every email lands in BOARD_INVITE_OUTBOX with its .ics next to it.
import { existsSync, readdirSync, readFileSync } from "node:fs";

const B = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Set ${k} (see the top of this file).`);
  return v;
};
const OUT = env("BOARD_INVITE_OUTBOX");
let pass = 0;
let failN = 0;
const ok = (cond, label) => {
  if (cond) pass++;
  else failN++;
  console.log(cond ? "  ✓" : "  ✗", label);
};
let ipN = 1;
const ip = () => ({ "x-forwarded-for": `10.1.0.${ipN++}` });

// The emails written since `since`, each with its headers (folded lines
// joined), decoded body and calendar file.
const outbox = () => (existsSync(OUT) ? readdirSync(OUT).filter((f) => f.endsWith(".eml")).sort() : []);
function read(f) {
  const raw = readFileSync(`${OUT}/${f}`, "utf8");
  const [head, ...rest] = raw.split("\r\n\r\n");
  const body = rest.join("\n").replace(/=\r\n/g, "").replace(/=([0-9A-F]{2})/g, "%$1");
  let text = body;
  try {
    text = decodeURIComponent(body.replace(/%(?![0-9A-F]{2})/g, "%25"));
  } catch {
    /* keep the raw body */
  }
  const icsFile = `${OUT}/${f.replace(/\.eml$/, ".ics")}`;
  const ics = existsSync(icsFile) ? readFileSync(icsFile, "utf8").replace(/\r\n[ \t]/g, "") : "";
  // Headers with folded lines joined and =?UTF-8?Q?…?= words decoded.
  const words = (h) =>
    h.replace(/=\?UTF-8\?Q\?([^?]*)\?=\s*/gi, (_, q) => {
      const bytes = q.replace(/_/g, " ").replace(/=([0-9A-F]{2})/gi, "%$1");
      try {
        return decodeURIComponent(bytes);
      } catch {
        return q;
      }
    });
  return { head: words(head.replace(/\r\n[ \t]+/g, " ")), text, ics };
}
const since = (n) => outbox().slice(n).map(read);
const header = (m, name) => (new RegExp(`^${name}: (.*)$`, "im").exec(m.head) ?? [])[1] ?? "";
const icsField = (ics, name) => (new RegExp(`^${name}[^:]*:(.*)$`, "m").exec(ics) ?? [])[1] ?? "";

async function login(chapter, password) {
  const r = await fetch(`${B}/api/board/login?chapter=${chapter}`, { method: "POST", headers: { "content-type": "application/json", ...ip() }, body: JSON.stringify({ password }) });
  return (r.headers.get("set-cookie") ?? "").split(";")[0];
}
const hub = (cookie, chapter) => async (path, method = "GET", body) => {
  const r = await fetch(`${B}${path}${path.includes("?") ? "&" : "?"}chapter=${chapter}`, {
    method,
    headers: { cookie, "x-board-actor": "Test Admin", ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, j: await r.json().catch(() => null) };
};
const rsvp = async (eventId, name, email, locale = "en") => {
  const r = await fetch(`${B}/api/events/rsvp`, {
    method: "POST",
    headers: { "content-type": "application/json", ...ip() },
    body: JSON.stringify({ eventId, name, email, school: "berkeley", question: "", optIn: true, locale }),
  });
  return { status: r.status, j: await r.json().catch(() => null) };
};

const day = (n) => {
  const d = new Date(Date.now() + n * 864e5);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(d);
};
const event = (o) => ({ title: "Test", tag: "Workshop", date: day(20), startTime: "17:00", endTime: "18:00", online: true, meetingLink: "", address: "", hostName: "", hostTitle: "", description: "", flyerId: null, showCount: false, translations: {}, ...o });

const berkeley = hub(await login("berkeley", env("BOARD_ADMIN_PASSWORD")), "berkeley");
const ucla = hub(await login("ucla", env("BOARD_UCLA_ADMIN_PASSWORD")), "ucla");

console.log("Location to be announced");
let r = await berkeley("/api/board/events", "POST", event({ title: "Car Repair Basics", online: false, locationTba: true }));
ok(r.status === 201, "admin creates an in-person event with the location to be announced");
const tbaId = r.j.id;
ok((await berkeley("/api/board/events", "POST", event({ title: "No place", online: false }))).status === 400, "in person without an address or TBA is refused");
const page = await (await fetch(`${B}/en/events`)).text();
ok(page.includes("Location to be announced"), "Events page shows \"Location to be announced\"");

let n = outbox().length;
r = await rsvp(tbaId, "Ada Lovelace", "ada@example.com");
ok(r.status === 201 && r.j.emailed, "RSVP to the TBA event is saved and confirmed");
let [mail] = since(n);
ok(/We'll send you a follow-up email with the location closer to the date\./.test(mail.text), "confirmation says the location will follow by email");
ok(mail.text.includes("Location to be announced"), "confirmation's Where says \"Location to be announced\"");
ok(icsField(mail.ics, "LOCATION") === "Location to be announced", `calendar location is "Location to be announced" (${icsField(mail.ics, "LOCATION")})`);
ok(icsField(mail.ics, "SEQUENCE") === "0", "first invite has SEQUENCE:0");
const uid = icsField(mail.ics, "UID");
ok(/^From: "?VINdicated"? <president@getvindicated\.org>$/m.test(mail.head), `sender is VINdicated (${header(mail, "From")})`);
ok(/\nVINdicated\n?/.test(mail.text) && !/Rana/.test(mail.text.split("Event details")[1] ?? ""), "signed VINdicated, not a person");

n = outbox().length;
r = await rsvp(tbaId, "Luis Ortega", "luis@example.com", "es");
[mail] = since(n);
ok(r.status === 201 && /Lugar por confirmar/.test(mail.text) && icsField(mail.ics, "LOCATION") === "Lugar por confirmar", "Spanish RSVP gets the TBA wording and calendar location in Spanish");

let list = (await berkeley("/api/board/events")).j.events;
ok(list.find((e) => e.id === tbaId)?.locationPending === false, "nothing to send while the location is still TBA");

console.log("Adding the address and sending it");
const withAddress = event({ title: "Car Repair Basics", online: false, locationTba: false, address: "Eshleman Hall, Room 104, Berkeley, CA" });
r = await berkeley(`/api/board/events/${tbaId}`, "PATCH", withAddress);
ok(r.status === 200, "admin adds the address");
list = (await berkeley("/api/board/events")).j.events;
ok(list.find((e) => e.id === tbaId)?.locationPending === true, "the tab offers \"Send the location to everyone\"");
n = outbox().length;
r = await berkeley(`/api/board/events/${tbaId}/location`, "POST", {});
ok(r.status === 200 && r.j.sent === 2, `location sent to both RSVPs (${r.j?.sent})`);
const updates = since(n);
ok(updates.length === 2, "one email per RSVP");
ok(updates.every((m) => icsField(m.ics, "UID") === uid), "updated invites keep the same UID");
ok(updates.every((m) => icsField(m.ics, "SEQUENCE") === "1"), "updated invites have SEQUENCE:1");
ok(updates.every((m) => icsField(m.ics, "LOCATION").startsWith("Eshleman Hall")), "updated invites have the address as the location");
ok(updates.some((m) => /^Subject: Location for Car Repair Basics/m.test(m.head) && m.text.includes("Eshleman Hall, Room 104")), "the email gives the address");
ok(updates.every((m) => /^From: "?VINdicated"? </m.test(m.head)), "location emails come from VINdicated");
list = (await berkeley("/api/board/events")).j.events;
ok(list.find((e) => e.id === tbaId)?.locationPending === false, "the button goes away once sent");
n = outbox().length;
r = await berkeley(`/api/board/events/${tbaId}/remind`, "POST", {});
const reminders = since(n);
ok(r.status === 200 && reminders.every((m) => m.text.includes("Eshleman Hall, Room 104") && icsField(m.ics, "SEQUENCE") === "1"), "reminders include the address and the current SEQUENCE");
n = outbox().length;
r = await rsvp(tbaId, "Grace Hopper", "grace@example.com");
[mail] = since(n);
ok(mail.text.includes("Eshleman Hall, Room 104") && !mail.text.includes("follow-up email") && icsField(mail.ics, "SEQUENCE") === "1", "new RSVPs get the address right away");

console.log("Online events are unchanged");
r = await berkeley("/api/board/events", "POST", event({ title: "Financing 101", online: true, meetingLink: "https://example.com/zoom" }));
const onlineId = r.j.id;
n = outbox().length;
r = await rsvp(onlineId, "Maya Chen", "maya@example.com");
[mail] = since(n);
ok(r.status === 201 && mail.text.includes("Join on Zoom: https://example.com/zoom") && !mail.text.includes("follow-up email"), "online confirmation still has the Zoom link");
ok(icsField(mail.ics, "LOCATION") === "https://example.com/zoom" && icsField(mail.ics, "SEQUENCE") === "0", "online calendar file unchanged");
ok(/^From: "?VINdicated"? <president@getvindicated\.org>$/m.test(mail.head), "online event email also comes from VINdicated");
list = (await berkeley("/api/board/events")).j.events;
ok(list.find((e) => e.id === onlineId)?.locationPending === false, "online events never ask to send a location");
ok((await berkeley(`/api/board/events/${onlineId}/location`, "POST", {})).status === 400, "online events can't send a location");

console.log("UCLA");
r = await ucla("/api/board/events", "POST", event({ title: "Bruin Car Talk", online: false, locationTba: true }));
const uclaId = r.j.id;
n = outbox().length;
r = await rsvp(uclaId, "Joe Bruin", "joe@example.com");
[mail] = since(n);
ok(/^From: "?VINdicated at UCLA"? <vindicatedbruins@getvindicated\.org>$/m.test(mail.head), `UCLA sender is "VINdicated at UCLA" (${header(mail, "From")})`);
ok(/VINdicated at UCLA\s*$/.test(mail.text.split("Event details")[1]?.split("\n").filter(Boolean).slice(0, 2).join("\n") ?? "") || mail.text.includes("\nVINdicated at UCLA"), "signed VINdicated at UCLA");
ok(!/Fiona/.test(header(mail, "From") + header(mail, "Reply-To")), "no person's name in From or Reply-To");

console.log(`\n${pass} passed, ${failN} failed`);
process.exit(failN ? 1 : 0);
