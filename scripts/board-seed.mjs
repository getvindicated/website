// Loads the starting data for /board (from docs/board-preview.html).
//
//   DATABASE_URL=... node scripts/board-seed.mjs          fills empty tables only
//   DATABASE_URL=... node scripts/board-seed.mjs --reset  wipes and reloads everything
//                                                         except submissions
//
// Members come from scripts/board-members.local.json (not committed: it has
// phone numbers). Without it, the placeholder board-members.example.json is used.
import { existsSync, readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}
const reset = process.argv.includes("--reset");
const sql = postgres(url, { ssl: /sslmode=require|proxy\.rlwy\.net/.test(url) ? "require" : false, onnotice: () => {} });

const local = new URL("./board-members.local.json", import.meta.url);
const example = new URL("./board-members.example.json", import.meta.url);
const membersFile = existsSync(local) ? local : example;
const members = JSON.parse(readFileSync(membersFile, "utf8"));

const DUE_R2 = "2026-10-12";
const r2 = [
  ["Chloe", "Outreach Lead · Social Media", [
    ["Post twice on @ucb_vindicated before Monday night", "Link to each post"],
    ["2-week content calendar: what gets posted, which days, who makes each one", "Doc link"],
    ["Follow up with the high schools and YMCA programs you emailed in round 1 that haven't replied", "Screenshot of each follow-up, plus a list of who replied"],
  ]],
  ["Noirit", "IVP · Price Is Right Lead", [
    ["Price Is Right week 2 check: pipeline started, database set up, game screens running with placeholder data", "GitHub commit links and a screenshot of the screens"],
    ["Sunday night: message every board member who hasn't submitted yet", "Screenshot of the messages"],
  ]],
  ["Pierce", "Socials", [
    ["VINdiBasketball: set the date and book an RSF court", "Booking confirmation"],
    ["RSVP form for basketball, sent to Chloe to post", "Form link"],
    ["Send invites for every social on the Socials calendar to the full member email list", "Screenshot of the sent email showing the recipients"],
    ["Keep the Socials calendar current: confirm each location and update it on the page", "The updated calendar"],
  ]],
  ["Ian", "Software Lead", [
    ["Get access to the website repo from Rizwaan or Ray", "Screenshot showing access"],
    ["Start the /board page on getvindicated.org from this preview", "Link to your branch or pull request"],
  ]],
  ["Halima", "EVP · Partnerships", [
    ["Follow up with Cal TV and set a collaboration date", "The email or DM thread"],
    ["Message 5 Berkeley clubs that overlap with us (pre-law, consumer or business clubs, cultural orgs, transfer/first-gen groups) about co-hosting a workshop", "Screenshot of each sent message, plus any replies"],
  ]],
  ["Daryen", "Communications Lead", [
    ["Call 5 local mechanics about recording a short video with us (carried over from round 1)", "Call log: shop name, number, time called, what they said"],
  ]],
  ["Jordan", "Data Lead", [
    ["Project spec, including how many people you need (carried over)", "Doc link"],
    ["Message James Cheng about the project (carried over)", "Screenshot of the message"],
    ["Answer Ray (carried over)", "Screenshot of your reply"],
  ]],
];

// Round 1: one row per person, as in the preview's archive table.
const r1 = [
  ["Noirit", "Spec, socials schedule, upload project doc", "submitted", "Submitted Oct 8 (4 docs)"],
  ["Halima", "Cal TV outreach, 4 social posts", "done", "Marked completed"],
  ["Ian", "Follow up with Rizwaan, project spec", "done", "Marked completed"],
  ["Chloe", "Event ideas, 5 mechanic calls, 10 high schools + YMCA", "done", "Marked completed"],
  ["Daryen", "Help Halima, 5 mechanic calls", "missing", "Not done"],
  ["Pierce", "Event ideas doc, workshop timeline, connect with Halima", "missing", "Not done"],
  ["Jordan", "Project spec, connect with James, answer Ray", "missing", "Not done"],
];

const socials = [
  { date: "2026-10-17", time: "2:00–4:00pm", title: "VINdiBasketball", location: "RSF", kind: "b", lead: "Pierce", status: "Planning", cost: "Free. Optional boba after, self-pay.", note: "First Berkeley social. Court booking and RSVP form due Mon, Oct 12." },
  { date: "2026-10-21", time: "9:00–10:00pm", title: "Skribbl night", location: "Discord", kind: "o", lead: "Chloe", status: "Planning", cost: "Free", note: "Open to all three chapters. Chloe posts the link that afternoon." },
  { date: "2026-10-24", time: "Afternoon", title: "UCSC × UCB social", location: "San Francisco · spot TBD", kind: "x", lead: "Rana + Ashwin", status: "Idea", cost: "Self-pay", note: "Combined social with UCSC. Location still being decided." },
  { date: "2026-10-30", time: "5:00–8:00pm", title: "Glade Night + Chipotle", location: "Memorial Glade", kind: "b", lead: "Pierce", status: "Planning", cost: "Chipotle catering from the $240, if the Oct 13 budget allows", note: "Halloween eve, costumes optional. Last week of daylight before clocks change." },
  { date: "2026-11-06", time: "", title: "Price Is Right demo", location: "", kind: "org", lead: "Noirit", status: "", cost: "", note: "Not a social. No socials Nov 5–15." },
  { date: "2026-11-18", time: "8:00–10:30pm", title: "Movie Night + Menchie's", location: "TBD", kind: "b", lead: "Daryen (movie), Chloe (Menchie's)", status: "Idea", cost: "Self-pay froyo", note: "" },
  { date: "2026-11-21", time: "1:00–4:00pm", title: "UCSC × UCB basketball", location: "Irvington Park, 41825 Blacow Rd, Fremont", kind: "x", lead: "Pierce + UCSC lead", status: "Idea", cost: "Free", note: "Meet-in-the-middle game, separate from VINdiBasketball. Outdoor court, first come. Backup: Karl Nordvik Park." },
];

const announcements = [
  { title: "New deliverables rule, effective Oct 9", body: "Round 2 deliverables are due Monday, Oct 12 at 11:59pm. Every task needs proof submitted through this page. If any deliverable is missing after the deadline, you're off the board.", posted_on: "2026-10-09", link_tab: "assignments", link_label: "See your tasks" },
  { title: "Board meeting 09/27", body: "Updates · Partnerships · Logistics", posted_on: "2026-09-27", link_tab: "", link_label: "" },
  { title: "Attendance, board meeting 09/21", body: "Everyone attended except Halima and Saad.", posted_on: "2026-09-21", link_tab: "", link_label: "" },
  { title: "Socials", body: "First social: VINdiBasketball at the RSF, Saturday Oct 17, 2–4pm.", posted_on: "2026-10-08", link_tab: "socials", link_label: "See the socials calendar" },
];

const meetings = [
  { date: "2026-09-27", title: "Board meeting", summary: "Updates, partnerships, logistics, socials.", recording_url: "" },
  { date: "2026-09-21", title: "Board meeting", summary: "Everyone attended except Halima and Saad.", recording_url: "" },
];

async function empty(table) {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM ${sql(table)}`;
  return n === 0;
}

await sql.begin(async (tx) => {
  if (reset) {
    await tx`TRUNCATE board_members, board_socials, board_announcements, board_meetings RESTART IDENTITY`;
    await tx`UPDATE board_submissions SET assignment_id = NULL`;
    await tx`TRUNCATE board_assignments RESTART IDENTITY CASCADE`;
  }
});

if (await empty("board_members")) {
  for (const [i, m] of members.entries()) {
    await sql`INSERT INTO board_members (name, first_name, role, team, also_team, tier, is_lead, email, phone, sort)
      VALUES (${m.name}, ${m.name.split(" ")[0]}, ${m.role}, ${m.team}, ${m.alsoTeam ?? null}, ${m.tier ?? null}, ${!!m.lead}, ${m.email}, ${m.phone}, ${i})`;
  }
  console.log(`Members: ${members.length} (from ${membersFile.pathname.split("/").pop()})`);
}
if (await empty("board_assignments")) {
  let sort = 0;
  for (const [person, role, items] of r2) {
    for (const [task, proof] of items) {
      await sql`INSERT INTO board_assignments (round, person, person_role, task, proof_required, due_date, sort)
        VALUES (2, ${person}, ${role}, ${task}, ${proof}, ${DUE_R2}, ${sort++})`;
    }
  }
  for (const [person, task, status, note] of r1) {
    await sql`INSERT INTO board_assignments (round, person, task, due_date, status, status_note, sort)
      VALUES (1, ${person}, ${task}, ${"2026-09-26"}, ${status}, ${note}, ${sort++})`;
  }
  console.log("Assignments: round 1 and round 2");
}
if (await empty("board_socials")) {
  for (const s of socials) await sql`INSERT INTO board_socials ${sql(s)}`;
  console.log(`Socials: ${socials.length}`);
}
if (await empty("board_announcements")) {
  for (const [i, a] of announcements.entries()) await sql`INSERT INTO board_announcements ${sql({ ...a, sort: i })}`;
  console.log(`Announcements: ${announcements.length}`);
}
if (await empty("board_meetings")) {
  for (const m of meetings) await sql`INSERT INTO board_meetings ${sql(m)}`;
  console.log(`Meetings: ${meetings.length}`);
}
await sql.end();
