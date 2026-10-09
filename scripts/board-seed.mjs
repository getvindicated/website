// Loads the starting data for /board (from docs/board-preview.html).
// The site also does this by itself on first start, except for members,
// which an admin imports on the Board tab. Use this script from a computer
// when you'd rather load members (or reset everything) from the command line.
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

// Assignments, socials, announcements and meetings. The site loads the same
// file on first start (lib/board/setup.ts).
const starter = JSON.parse(readFileSync(new URL("../lib/board/starter-data.json", import.meta.url), "utf8"));
const DUE_R2 = starter.dueRound2;
const r2 = starter.round2;
const r1 = starter.round1;
const { socials, announcements, meetings } = starter;

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
