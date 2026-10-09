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
