import "server-only";
import { db } from "@/lib/board/db";
import { ensureSetup } from "@/lib/board/setup";
import { boardUser, type BoardUser } from "@/lib/board/session";
import { CHAPTER_IDS, isChapterId, type ChapterId } from "@/lib/board/chapters";
import { pacificToUtc } from "@/lib/board/ics";
import type { AdminEvent, EventText, EventTranslations, PublicEvent, Rsvp } from "./types";
import { eventsPublic } from "./flag";

// The public Events page stays private until launch: unless the Railway
// variable EVENTS_PUBLIC is exactly "true", /events is a 404 and the RSVP
// API refuses, except for someone signed in to either board hub as admin.
// See BOARD_SETUP.md.

export { eventsPublic };

// An admin session for either hub, or null.
export function eventsAdmin(headers: Headers): BoardUser | null {
  for (const chapter of CHAPTER_IDS) {
    const user = boardUser(headers, chapter);
    if (user?.role === "admin") return user;
  }
  return null;
}

// Whether this request may see events: everyone once public, else admins.
export const canSeeEvents = (headers: Headers) => eventsPublic() || eventsAdmin(headers) !== null;

type Row = Record<string, unknown>;

const endsAt = (r: Row) => pacificToUtc(r.date as string, r.end_time as string);
const startsAt = (r: Row) => pacificToUtc(r.date as string, r.start_time as string);

// Every column but meeting_link. Public reads select exactly these, so the
// link can't end up in a public reply by accident.
const PUBLIC_COLUMNS = [
  "id",
  "chapter",
  "uid",
  "title",
  "tag",
  "date",
  "start_time",
  "end_time",
  "online",
  "address",
  "host_name",
  "host_title",
  "description",
  "flyer_id",
  "show_count",
  "translations",
] as const;

// The event's wording in this language, falling back to the English.
function inLanguage(r: Row, locale: string) {
  const t: EventText = locale === "en" ? {} : ((r.translations as EventTranslations | null)?.[locale] ?? {});
  return {
    title: t.title || (r.title as string),
    tag: t.tag || (r.tag as string),
    hostTitle: t.hostTitle || (r.host_title as string),
    description: t.description || (r.description as string),
  };
}

function toPublic(r: Row, count: number, locale = "en"): PublicEvent {
  const text = inLanguage(r, locale);
  return {
    id: r.id as number,
    title: text.title,
    tag: text.tag,
    date: r.date as string,
    startTime: r.start_time as string,
    endTime: r.end_time as string,
    startsAt: startsAt(r).toISOString(),
    endsAt: endsAt(r).toISOString(),
    online: r.online as boolean,
    address: r.online ? "" : (r.address as string),
    hostName: r.host_name as string,
    hostTitle: text.hostTitle,
    description: text.description,
    flyer: r.flyer_id ? `/api/events/${r.id}/flyer` : null,
    count: r.show_count ? count : null,
    past: endsAt(r).getTime() < Date.now(),
  };
}

async function ready(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  await ensureSetup();
  return true;
}

async function counts(ids: number[]): Promise<Map<number, number>> {
  if (!ids.length) return new Map();
  const rows = await db()`SELECT event_id, count(*)::int AS n FROM board_event_rsvps WHERE event_id IN ${db()(ids)} GROUP BY event_id`;
  return new Map(rows.map((r) => [r.event_id as number, r.n as number]));
}

// All events from both chapters, soonest first, in the page's language, for
// the public page. Empty when the database isn't connected.
export async function listPublicEvents(locale = "en"): Promise<PublicEvent[]> {
  if (!(await ready())) return [];
  const sql = db();
  const rows = await sql`SELECT ${sql(PUBLIC_COLUMNS as unknown as string[])} FROM board_events ORDER BY date, start_time, id`;
  const n = await counts(rows.map((r) => r.id as number));
  return rows.map((r) => toPublic(r, n.get(r.id as number) ?? 0, locale));
}

// The next event that hasn't ended, for the home page strip.
export async function nextPublicEvent(locale = "en"): Promise<PublicEvent | null> {
  return (await listPublicEvents(locale)).find((e) => !e.past) ?? null;
}

// One event with everything, including the meeting link, for emails, in
// the given language.
export type FullEvent = PublicEvent & { chapter: ChapterId; uid: string; meetingLink: string };

export async function getFullEvent(id: number, locale = "en"): Promise<FullEvent | null> {
  if (!(await ready())) return null;
  const [r] = await db()`SELECT * FROM board_events WHERE id = ${id}`;
  if (!r || !isChapterId(r.chapter)) return null;
  const [{ n }] = await db()`SELECT count(*)::int AS n FROM board_event_rsvps WHERE event_id = ${id}`;
  return { ...toPublic(r, n, locale), chapter: r.chapter, uid: r.uid, meetingLink: r.meeting_link };
}

export const toRsvp = (r: Row): Rsvp => ({
  id: r.id as number,
  name: r.name as string,
  email: r.email as string,
  school: r.school as string,
  question: r.question as string,
  optIn: r.opt_in as boolean,
  at: new Date(r.created_at as string).toISOString(),
});

// A chapter's events with their RSVPs, newest date first, for the hub.
export async function listAdminEvents(chapter: ChapterId): Promise<AdminEvent[]> {
  const sql = db();
  const rows = await sql`SELECT * FROM board_events WHERE chapter = ${chapter} ORDER BY date DESC, start_time DESC, id DESC`;
  const ids = rows.map((r) => r.id as number);
  const rsvps = ids.length
    ? await sql`SELECT * FROM board_event_rsvps WHERE event_id IN ${sql(ids)} ORDER BY created_at, id`
    : [];
  return rows.map((r) => {
    const pub: Partial<PublicEvent> = toPublic(r, 0);
    delete pub.flyer;
    delete pub.count;
    return {
      ...(pub as Omit<PublicEvent, "flyer" | "count">),
      chapter: r.chapter as string,
      meetingLink: r.meeting_link as string,
      flyerId: (r.flyer_id as number | null) ?? null,
      showCount: r.show_count as boolean,
      translations: (r.translations as EventTranslations | null) ?? {},
      rsvps: rsvps.filter((x) => x.event_id === r.id).map(toRsvp),
    };
  });
}
