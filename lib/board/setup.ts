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
