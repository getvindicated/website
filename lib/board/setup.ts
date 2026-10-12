import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "./db";
import starter from "./starter-data.json";

// Makes the board database ready on first use, so nobody has to run
// commands: creates the tables (scripts/board-schema.sql, safe to re-run)
// and fills empty tables with the starting data from docs/board-preview.html.
// Members are not loaded here; they have phone numbers, so an admin imports
// them from a file on the Board tab.

let ready: Promise<void> | null = null;

export function ensureSetup(): Promise<void> {
  ready ??= setup().catch((e) => {
    ready = null; // try again on the next request
    throw e;
  });
  return ready;
}

async function setup() {
  const sql = db();
  const schema = readFileSync(join(process.cwd(), "scripts", "board-schema.sql"), "utf8");
  await sql.unsafe(schema);

  const empty = async (table: string) => {
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM ${sql(table)}`;
    return n === 0;
  };

  if (await empty("board_assignments")) {
    let sort = 0;
    for (const [person, role, items] of starter.round2 as [string, string, [string, string][]][]) {
      for (const [task, proof] of items) {
        await sql`INSERT INTO board_assignments (round, person, person_role, task, proof_required, due_date, sort)
          VALUES (2, ${person}, ${role}, ${task}, ${proof}, ${starter.dueRound2}, ${sort++})`;
      }
    }
    for (const [person, task, status, note] of starter.round1 as [string, string, string, string][]) {
      await sql`INSERT INTO board_assignments (round, person, task, due_date, status, status_note, sort)
        VALUES (1, ${person}, ${task}, ${"2026-09-26"}, ${status}, ${note}, ${sort++})`;
    }
  }
  await retaskRound2(sql);
  if (await empty("board_socials")) {
    for (const s of starter.socials) await sql`INSERT INTO board_socials ${sql(s)}`;
  }
  if (await empty("board_announcements")) {
    for (const [i, a] of starter.announcements.entries()) {
      await sql`INSERT INTO board_announcements ${sql({ ...a, sort: i })}`;
    }
  }
  if (await empty("board_meetings")) {
    for (const m of starter.meetings) await sql`INSERT INTO board_meetings ${sql(m)}`;
  }
  await octoberUpdates(sql);
}

const OLD_IAN = "Start the /board page on getvindicated.org from this preview";
const OLD_HALIMA = ["Follow up with Cal TV and set a collaboration date", "Message 5 Berkeley clubs that overlap with us"];

// Round 2 tasks for Ian and Halima changed after the board went live. If a
// database still has the old ones, swap them for the new ones once.
async function retaskRound2(sql: ReturnType<typeof db>) {
  const [old] = await sql`SELECT id FROM board_assignments
    WHERE round = 2 AND person = 'Ian' AND task = ${OLD_IAN}`;
  if (!old) return;
  const tasks = (name: string) =>
    (starter.round2 as [string, string, [string, string][]][]).find(([p]) => p === name)![2];
  await sql.begin(async (tx) => {
    const ian = tasks("Ian");
    await tx`UPDATE board_assignments SET task = ${ian[1][0]}, proof_required = ${ian[1][1]} WHERE id = ${old.id}`;
    await tx`UPDATE board_assignments SET person_role = 'Software Lead' WHERE round = 2 AND person = 'Ian'`;

    const halima = await tx`SELECT id, task FROM board_assignments WHERE round = 2 AND person = 'Halima' ORDER BY sort, id`;
    const stale = halima.filter((r) => OLD_HALIMA.some((t) => r.task.startsWith(t)));
    if (stale.length) {
      const [task, proof] = tasks("Halima")[0];
      await tx`UPDATE board_assignments SET task = ${task}, proof_required = ${proof} WHERE id = ${stale[0].id}`;
      for (const r of stale.slice(1)) await tx`DELETE FROM board_assignments WHERE id = ${r.id}`;
    }
  });
}

type Round2 = [string, string, [string, string][]][];

// Board changes from Oct 12, applied once to a database that was set up
// before them (a fresh one already has them from starter-data.json):
// Pierce leaves the board; his court booking goes to Daryen and his other
// tasks wait in the admin-only Unassigned group; four members' roles are
// set; the socials calendar is replaced and the UCSC x UCB type is retired.
async function octoberUpdates(sql: ReturnType<typeof db>) {
  const round2 = starter.round2 as Round2;
  const tasksOf = (person: string) => round2.find(([p]) => p === person)!;
  await sql.begin(async (tx) => {
    const [first] = await tx`INSERT INTO board_changes (name) VALUES ('2026-10-12-board-updates')
      ON CONFLICT DO NOTHING RETURNING name`;
    if (!first) return;

    // Pierce
    await tx`DELETE FROM board_members
      WHERE lower(email) = 'pierce.kosobayashi@berkeley.edu' OR name ILIKE '%Kosobayashi%'`;
    await tx`DELETE FROM board_submissions WHERE person = 'Pierce'`;
    await tx`DELETE FROM board_assignments WHERE person = 'Pierce'`;

    // His round 2 tasks: Daryen's court booking, then the unowned three.
    const add = async (person: string, task: string, proof: string, role: string, sort: number) => {
      const [exists] = await tx`SELECT 1 FROM board_assignments WHERE round = 2 AND person = ${person} AND task = ${task}`;
      if (exists) return;
      await tx`INSERT INTO board_assignments (round, person, person_role, task, proof_required, due_date, sort)
        VALUES (2, ${person}, ${role}, ${task}, ${proof}, ${starter.dueRound2}, ${sort})`;
    };
    const [{ max }] = await tx`SELECT coalesce(max(sort), 0) AS max FROM board_assignments WHERE round = 2 AND person = 'Daryen'`;
    const [, daryenRole, daryen] = tasksOf("Daryen");
    const court = daryen[daryen.length - 1];
    await add("Daryen", court[0], court[1], daryenRole, max + 1);
    const [unassigned, , unowned] = tasksOf("Unassigned");
    for (const [i, [task, proof]] of unowned.entries()) await add(unassigned, task, proof, "", -unowned.length + i);

    // Roles on the chart
    await tx`UPDATE board_members SET role = 'Outreach Lead · Social Media', team = 'Outreach', is_lead = true, tier = NULL
      WHERE name ILIKE 'Chloe%Lin'`;
    await tx`UPDATE board_members SET role = 'Research Analyst', team = 'Research & Legal', is_lead = false, tier = NULL
      WHERE name ILIKE 'Rami%Dakak'`;
    await tx`UPDATE board_members SET role = 'President · Research Lead', team = 'Executive', tier = 0, also_team = 'Research & Legal'
      WHERE name ILIKE 'Rana%Darwich'`;
    await tx`UPDATE board_members SET role = 'Software Lead', team = 'Software', is_lead = true, tier = NULL
      WHERE name ILIKE 'Ian%Houssaye'`;

    // Socials: exactly the starter list, and no more UCSC x UCB type.
    await tx`DELETE FROM board_socials`;
    for (const s of starter.socials) await tx`INSERT INTO board_socials ${tx(s)}`;
    await tx`ALTER TABLE board_socials DROP CONSTRAINT IF EXISTS board_socials_kind_check`;
    await tx`ALTER TABLE board_socials ADD CONSTRAINT board_socials_kind_check CHECK (kind IN ('b', 'o', 'org'))`;
  });
}
