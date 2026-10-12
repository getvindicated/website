import "server-only";
import { db } from "./db";
import { bad, isDate } from "./api";
import type { ChapterId } from "./chapters";
import { isEmail } from "./submit-rules";
import type { Invitee, ScheduledMeeting } from "./schedule";

// Reading and checking scheduled meetings for the schedule API routes.

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export type MeetingInput = Omit<ScheduledMeeting, "id" | "uid" | "sequence" | "invitees" | "audience" | "cancelledDates">;
export type InviteSpec = { kind: "all" } | { kind: "team"; team: string } | { kind: "people"; ids: number[] };

export function parseMeeting(body: Record<string, unknown>): { error: string } | { meeting: MeetingInput; invite: InviteSpec } {
  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const title = str("title", 200);
  const date = body.date;
  const startTime = str("startTime", 5);
  const endTime = str("endTime", 5);
  const weekly = body.weekly === true;
  const until = weekly ? body.until : null;
  if (!title) return { error: "Add a title." };
  if (!isDate(date)) return { error: "Choose a date." };
  if (!TIME.test(startTime) || !TIME.test(endTime)) return { error: "Add a start and end time." };
  if (endTime <= startTime) return { error: "The meeting has to end after it starts." };
  if (weekly && (!isDate(until) || until < date)) return { error: "Choose the date the weekly meeting ends, on or after the first one." };
  if (weekly && isDate(until) && Date.parse(until) - Date.parse(date) > 370 * 86400000) return { error: "A weekly series can run for up to a year." };

  const inv = body.invite as Record<string, unknown> | undefined;
  let invite: InviteSpec;
  if (inv?.kind === "all") invite = { kind: "all" };
  else if (inv?.kind === "team" && typeof inv.team === "string" && inv.team) invite = { kind: "team", team: inv.team };
  else if (inv?.kind === "people" && Array.isArray(inv.ids) && inv.ids.every((n) => Number.isInteger(n))) invite = { kind: "people", ids: inv.ids as number[] };
  else return { error: "Choose who to invite." };

  return {
    meeting: { title, date, startTime, endTime, location: str("location", 500), notes: str("notes", 2000), weekly, until: weekly ? (until as string) : null },
    invite,
  };
}

// Who an invite reaches: members with an email on file, and the names of
// anyone picked who has none.
export async function resolveInvitees(chapter: ChapterId, invite: InviteSpec) {
  const sql = db();
  const rows = await sql`SELECT id, name, email, team, also_team FROM board_members WHERE chapter = ${chapter} ORDER BY sort, id`;
  const picked = rows.filter((m) =>
    invite.kind === "all" ? true : invite.kind === "team" ? m.team === invite.team || m.also_team === invite.team : invite.ids.includes(m.id),
  );
  const invitees: Invitee[] = picked.filter((m) => isEmail(m.email)).map((m) => ({ name: m.name, email: m.email.trim() }));
  const skipped: string[] = picked.filter((m) => !isEmail(m.email)).map((m) => m.name);
  const audience = invite.kind === "all" ? "Whole board" : invite.kind === "team" ? `${invite.team} team` : `${picked.length} ${picked.length === 1 ? "person" : "people"}`;
  return { invitees, skipped, audience };
}

const COLUMNS = (sql: ReturnType<typeof db>) => sql`id, uid, sequence, title, to_char(date, 'YYYY-MM-DD') AS date,
  start_time AS "startTime", end_time AS "endTime", location, notes, weekly, to_char(until, 'YYYY-MM-DD') AS until,
  invitees, audience, ARRAY(SELECT to_char(d, 'YYYY-MM-DD') FROM unnest(cancelled_dates) d) AS "cancelledDates"`;

export async function listScheduled(chapter: ChapterId): Promise<ScheduledMeeting[]> {
  const sql = db();
  const rows = await sql`SELECT ${COLUMNS(sql)} FROM board_scheduled WHERE chapter = ${chapter} ORDER BY date, start_time`;
  return JSON.parse(JSON.stringify(rows));
}

export async function getScheduled(chapter: ChapterId, id: number): Promise<ScheduledMeeting | null> {
  const sql = db();
  const [row] = await sql`SELECT ${COLUMNS(sql)} FROM board_scheduled WHERE chapter = ${chapter} AND id = ${id}`;
  return row ? JSON.parse(JSON.stringify(row)) : null;
}

export const notReady = (problem: string) => {
  console.error(`[board] ${problem}`);
  return bad(problem, 503);
};
