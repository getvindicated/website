import "server-only";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "./db";
import starter from "./starter-data.json";
import ucla from "./starter-ucla.json";
import { seedSettings } from "./settings-server";
import { CHAPTER_SERVER } from "./chapter-server";
import { UCLA_ROW2 } from "./chapters";

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

  const empty = async (table: string, chapter = "berkeley") => {
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM ${sql(table)} WHERE chapter = ${chapter}`;
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
  await allowExcused(sql);
  const [{ n: berkeleyRounds }] = await sql`SELECT count(*)::int AS n FROM board_rounds WHERE chapter = 'berkeley'`;
  if (berkeleyRounds === 0) {
    await sql`INSERT INTO board_rounds (chapter, round, due_date, is_current) VALUES
      ('berkeley', 1, '2026-09-26', false), ('berkeley', 2, ${starter.dueRound2}, true)`;
  }
  await seedUcla(sql, empty);
  await seedSettings(sql);
  await markHubAdmins(sql);
  await renameEvanceline(sql);
  await adminsOnlyToHubAdmins(sql);
  await uclaPhotoRow2(sql);
  await seedFirstEvent(sql);
  await fillNegotiationLink(sql);
  await negotiationFlyer(sql);
}

const SEEDED_HOST_TITLE = "Negotiation Professor, UC Berkeley Law · CEO, Oakbay Consulting";

// Gives the Negotiation Workshop its flyer (public/images/events), once, if
// no admin has uploaded one, and matches the host's title to the flyer if
// it's still the seeded one. Stored like a hub upload, so admins can
// replace or remove it on the Events tab.
async function negotiationFlyer(sql: ReturnType<typeof db>) {
  await sql.begin(async (tx) => {
    const [first] = await tx`INSERT INTO board_changes (name) VALUES ('2026-10-27-negotiation-flyer')
      ON CONFLICT DO NOTHING RETURNING name`;
    if (!first) return;
    const [event] = await tx`SELECT id, title, flyer_id, host_title FROM board_events
      WHERE chapter = 'berkeley' AND date = '2026-11-19' AND title = 'Negotiation Workshop with Emily Epstein'
      ORDER BY id LIMIT 1 FOR UPDATE`;
    if (!event) return;
    const done: string[] = [];
    if (!event.flyer_id) {
      const data = readFileSync(join(process.cwd(), "public", "images", "events", "negotiation-workshop-2026.webp"));
      const [photo] = await tx`INSERT INTO board_photos (chapter, content_type, data) VALUES ('berkeley', 'image/webp', ${data}) RETURNING id`;
      await tx`UPDATE board_events SET flyer_id = ${photo.id} WHERE id = ${event.id}`;
      done.push("added the flyer");
    }
    if (event.host_title === SEEDED_HOST_TITLE) {
      await tx`UPDATE board_events SET host_title = 'Negotiation Lecturer, UC Berkeley Law · CEO, Oakbay Consulting' WHERE id = ${event.id}`;
      done.push("changed the host's title to match it");
    }
    if (!done.length) return;
    await tx`INSERT INTO board_changelog (chapter, role, actor, action, summary, changes)
      VALUES ('berkeley', 'system', '', 'note', ${`"${event.title}": ${done.join(" and ")}`}, '[]')`;
  });
}

// Fills in the Negotiation Workshop's meeting link from the Railway variable
// EVENT_LINK_NEGOTIATION_2026, so the link (it has the Zoom passcode) never
// goes in this public repo. Only when the variable is set and the event's
// link is empty, and only once: after that, an admin's edit always wins,
// even clearing the link. The change log says the link was set, never what
// it is.
const NEGOTIATION_LINK_VAR = "EVENT_LINK_NEGOTIATION_2026";

async function fillNegotiationLink(sql: ReturnType<typeof db>) {
  const link = process.env[NEGOTIATION_LINK_VAR]?.trim();
  if (!link) return;
  let ok = false;
  try {
    ok = new URL(link).protocol === "https:";
  } catch {
    ok = false;
  }
  if (!ok) {
    console.error(`[events] ${NEGOTIATION_LINK_VAR} isn't an https:// link, so the Negotiation Workshop's meeting link wasn't set.`);
    return;
  }
  await sql.begin(async (tx) => {
    const [done] = await tx`SELECT 1 FROM board_changes WHERE name = '2026-10-27-negotiation-link'`;
    if (done) return;
    const [event] = await tx`SELECT id, title, meeting_link FROM board_events
      WHERE chapter = 'berkeley' AND date = '2026-11-19' AND title = 'Negotiation Workshop with Emily Epstein'
      ORDER BY id LIMIT 1 FOR UPDATE`;
    if (!event || event.meeting_link) return;
    await tx`UPDATE board_events SET meeting_link = ${link} WHERE id = ${event.id}`;
    await tx`INSERT INTO board_changes (name) VALUES ('2026-10-27-negotiation-link')`;
    await tx`INSERT INTO board_changelog (chapter, role, actor, action, summary, changes)
      VALUES ('berkeley', 'system', '', 'note', ${`Set the meeting link for "${event.title}" from ${NEGOTIATION_LINK_VAR}`}, '[]')`;
    console.log(`[events] Set the Negotiation Workshop's meeting link from ${NEGOTIATION_LINK_VAR}.`);
  });
}

// The first public event, once. Admins edit it on the Events tab (the
// meeting link and flyer are left for them to add).
async function seedFirstEvent(sql: ReturnType<typeof db>) {
  await sql.begin(async (tx) => {
    const [first] = await tx`INSERT INTO board_changes (name) VALUES ('2026-10-19-first-event')
      ON CONFLICT DO NOTHING RETURNING name`;
    if (!first) return;
    await tx`INSERT INTO board_events ${tx({
      chapter: "berkeley",
      uid: `berkeley-${randomUUID()}@getvindicated.org`,
      title: "Negotiation Workshop with Emily Epstein",
      tag: "Workshop · UC Berkeley",
      date: "2026-11-19",
      start_time: "18:00",
      end_time: "19:00",
      online: true,
      meeting_link: "",
      host_name: "Emily Epstein",
      host_title: SEEDED_HOST_TITLE,
      description:
        "Learn how to negotiate the price of a car, and anything else, from someone who teaches it at Berkeley Law. Bring your questions.",
      show_count: false,
    })}`;
  });
}

// Adds UCLA's second photo row under the existing photos, once. The first
// row is left exactly as it is.
async function uclaPhotoRow2(sql: ReturnType<typeof db>) {
  await sql.begin(async (tx) => {
    const [first] = await tx`INSERT INTO board_changes (name) VALUES ('2026-10-15-ucla-photo-row-2')
      ON CONFLICT DO NOTHING RETURNING name`;
    if (!first) return;
    const [row] = await tx`SELECT value FROM board_settings WHERE chapter = 'ucla' AND key = 'photos'`;
    const photos = (row?.value ?? []) as { src: string; row?: 2 }[];
    const have = new Set(photos.map((p) => p.src));
    const added = UCLA_ROW2.filter((src) => !have.has(src)).map((src) => ({ src, row: 2 as const }));
    if (!row || added.length === 0) return;
    await tx`UPDATE board_settings SET value = ${tx.json([...photos, ...added] as never)} WHERE chapter = 'ucla' AND key = 'photos'`;
  });
}

// Announcements marked "admins only" before "Send to" existed are for Hub
// admins. Safe to re-run: a restored old version gets converted too.
async function adminsOnlyToHubAdmins(sql: ReturnType<typeof db>) {
  await sql`UPDATE board_announcements SET audience = '{"kind":"hubAdmins"}', admins_only = false WHERE admins_only`;
}

// UCLA's Design Lead is Evanceline Tang; the starting data called her
// Celine. Renames her in UCLA's assignments, submissions and meeting notes,
// once, so her tasks match her member entry.
async function renameEvanceline(sql: ReturnType<typeof db>) {
  await sql.begin(async (tx) => {
    const [first] = await tx`INSERT INTO board_changes (name) VALUES ('2026-10-15-ucla-evanceline')
      ON CONFLICT DO NOTHING RETURNING name`;
    if (!first) return;
    await tx`UPDATE board_assignments SET person = 'Evanceline' WHERE chapter = 'ucla' AND person = 'Celine'`;
    await tx`UPDATE board_submissions SET person = 'Evanceline' WHERE chapter = 'ucla' AND person = 'Celine'`;
    const word = String.raw`\mCeline\M`;
    await tx`UPDATE board_meetings SET absent = regexp_replace(absent, ${word}, 'Evanceline', 'g')
      WHERE chapter = 'ucla' AND absent ~ ${word}`;
  });
}

// Ticks "Hub admin" for each chapter's starting admins, once.
async function markHubAdmins(sql: ReturnType<typeof db>) {
  await sql.begin(async (tx) => {
    const [first] = await tx`INSERT INTO board_changes (name) VALUES ('2026-10-14-hub-admins')
      ON CONFLICT DO NOTHING RETURNING name`;
    if (!first) return;
    for (const [chapter, s] of Object.entries(CHAPTER_SERVER)) {
      await tx`UPDATE board_members SET is_hub_admin = true WHERE chapter = ${chapter} AND name IN ${tx(s.hubAdmins)}`;
    }
  });
}

const OLD_IAN = "Start the /board page on getvindicated.org from this preview";
const OLD_HALIMA = ["Follow up with Cal TV and set a collaboration date", "Message 5 Berkeley clubs that overlap with us"];

// Round 2 tasks for Ian and Halima changed after the board went live. If a
// database still has the old ones, swap them for the new ones once.
async function retaskRound2(sql: ReturnType<typeof db>) {
  const [old] = await sql`SELECT id FROM board_assignments
    WHERE chapter = 'berkeley' AND round = 2 AND person = 'Ian' AND task = ${OLD_IAN}`;
  if (!old) return;
  const tasks = (name: string) =>
    (starter.round2 as [string, string, [string, string][]][]).find(([p]) => p === name)![2];
  await sql.begin(async (tx) => {
    const ian = tasks("Ian");
    await tx`UPDATE board_assignments SET task = ${ian[1][0]}, proof_required = ${ian[1][1]} WHERE id = ${old.id}`;
    await tx`UPDATE board_assignments SET person_role = 'Software Lead' WHERE chapter = 'berkeley' AND round = 2 AND person = 'Ian'`;

    const halima = await tx`SELECT id, task FROM board_assignments WHERE chapter = 'berkeley' AND round = 2 AND person = 'Halima' ORDER BY sort, id`;
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
      WHERE chapter = 'berkeley' AND (lower(email) = 'pierce.kosobayashi@berkeley.edu' OR name ILIKE '%Kosobayashi%')`;
    await tx`DELETE FROM board_submissions WHERE chapter = 'berkeley' AND person = 'Pierce'`;
    await tx`DELETE FROM board_assignments WHERE chapter = 'berkeley' AND person = 'Pierce'`;

    // His round 2 tasks: Daryen's court booking, then the unowned three.
    const add = async (person: string, task: string, proof: string, role: string, sort: number) => {
      const [exists] = await tx`SELECT 1 FROM board_assignments WHERE chapter = 'berkeley' AND round = 2 AND person = ${person} AND task = ${task}`;
      if (exists) return;
      await tx`INSERT INTO board_assignments (round, person, person_role, task, proof_required, due_date, sort)
        VALUES (2, ${person}, ${role}, ${task}, ${proof}, ${starter.dueRound2}, ${sort})`;
    };
    const [{ max }] = await tx`SELECT coalesce(max(sort), 0) AS max FROM board_assignments WHERE chapter = 'berkeley' AND round = 2 AND person = 'Daryen'`;
    const [, daryenRole, daryen] = tasksOf("Daryen");
    const court = daryen[daryen.length - 1];
    await add("Daryen", court[0], court[1], daryenRole, max + 1);
    const [unassigned, , unowned] = tasksOf("Unassigned");
    for (const [i, [task, proof]] of unowned.entries()) await add(unassigned, task, proof, "", -unowned.length + i);

    // Roles on the chart
    await tx`UPDATE board_members SET role = 'Outreach Lead · Social Media', team = 'Outreach', is_lead = true, tier = NULL
      WHERE chapter = 'berkeley' AND name ILIKE 'Chloe%Lin'`;
    await tx`UPDATE board_members SET role = 'Research Analyst', team = 'Research & Legal', is_lead = false, tier = NULL
      WHERE chapter = 'berkeley' AND name ILIKE 'Rami%Dakak'`;
    await tx`UPDATE board_members SET role = 'President · Research Lead', team = 'Executive', tier = 0, also_team = 'Research & Legal'
      WHERE chapter = 'berkeley' AND name ILIKE 'Rana%Darwich'`;
    await tx`UPDATE board_members SET role = 'Software Lead', team = 'Software', is_lead = true, tier = NULL
      WHERE chapter = 'berkeley' AND name ILIKE 'Ian%Houssaye'`;

    // Socials: exactly the starter list, and no more UCSC x UCB type.
    await tx`DELETE FROM board_socials WHERE chapter = 'berkeley'`;
    for (const s of starter.socials) await tx`INSERT INTO board_socials ${tx(s)}`;
    await tx`ALTER TABLE board_socials DROP CONSTRAINT IF EXISTS board_socials_kind_check`;
    await tx`ALTER TABLE board_socials ADD CONSTRAINT board_socials_kind_check CHECK (kind IN ('b', 'o', 'org'))`;
  });
}

// Adds the "excused" status (UCLA) to a database made before it existed.
async function allowExcused(sql: ReturnType<typeof db>) {
  await sql.begin(async (tx) => {
    const [first] = await tx`INSERT INTO board_changes (name) VALUES ('2026-10-13-excused-status')
      ON CONFLICT DO NOTHING RETURNING name`;
    if (!first) return;
    await tx`ALTER TABLE board_assignments DROP CONSTRAINT IF EXISTS board_assignments_status_check`;
    await tx`ALTER TABLE board_assignments ADD CONSTRAINT board_assignments_status_check
      CHECK (status IN ('pending', 'submitted', 'done', 'missing', 'excused'))`;
  });
}

// UCLA's starting data from docs/board-ucla-preview.html: the deliverables
// Fiona set on Oct 11 (due Oct 18), the Oct 4 week as an archive with no
// status, events, announcements and meetings. Members are imported on the
// Board tab, like Berkeley's.
async function seedUcla(sql: ReturnType<typeof db>, empty: (table: string, chapter?: string) => Promise<boolean>) {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM board_rounds WHERE chapter = 'ucla'`;
  if (n === 0) {
    for (const r of ucla.rounds) await sql`INSERT INTO board_rounds ${sql({ ...r, chapter: "ucla" })}`;
  }
  if (await empty("board_assignments", "ucla")) {
    const due = (round: number) => ucla.rounds.find((r) => r.round === round)!.due_date;
    let sort = 0;
    for (const [person, role, tasks] of ucla.current as [string, string, string[]][]) {
      for (const task of tasks) {
        await sql`INSERT INTO board_assignments (chapter, round, person, person_role, task, due_date, sort)
          VALUES ('ucla', 2, ${person}, ${role}, ${task}, ${due(2)}, ${sort++})`;
      }
    }
    for (const [person, role, task] of ucla.archive as [string, string, string][]) {
      await sql`INSERT INTO board_assignments (chapter, round, person, person_role, task, due_date, sort)
        VALUES ('ucla', 1, ${person}, ${role}, ${task}, ${due(1)}, ${sort++})`;
    }
  }
  if (await empty("board_socials", "ucla")) {
    for (const e of ucla.events) await sql`INSERT INTO board_socials ${sql({ ...e, chapter: "ucla" })}`;
  }
  if (await empty("board_announcements", "ucla")) {
    for (const [i, a] of ucla.announcements.entries()) {
      await sql`INSERT INTO board_announcements ${sql({ ...a, sort: i, chapter: "ucla" })}`;
    }
  }
  if (await empty("board_meetings", "ucla")) {
    for (const m of ucla.meetings) await sql`INSERT INTO board_meetings ${sql({ ...m, chapter: "ucla" })}`;
  }
}
