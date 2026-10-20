import { db } from "@/lib/board/db";
import { idFrom, readJson } from "@/lib/board/api";
import { isEmail } from "@/lib/board/submit-rules";
import { inviteSetupProblem } from "@/lib/board/invites";
import { canSeeEvents, getFullEvent } from "@/lib/events/server";
import { sendEventEmails } from "@/lib/events/email";
import { SCHOOL_LABELS, SCHOOLS, type School } from "@/lib/events/types";

// RSVPs from the public Events page. Before launch (EVENTS_PUBLIC isn't
// "true") only a board admin session gets through; everyone else gets the
// same 404 as the page. One RSVP per email per event: sending again just
// resends the confirmation. The reply never includes the meeting link.

// 20 RSVPs per IP per 10 minutes. Kept in memory, which is enough for one
// Railway instance.
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 20;
const recent = new Map<string, { n: number; since: number }>();

function limited(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const r = recent.get(ip);
  if (!r || now - r.since > WINDOW_MS) {
    recent.set(ip, { n: 1, since: now });
    return false;
  }
  r.n++;
  return r.n > MAX;
}

const bad = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!canSeeEvents(request.headers)) return new Response("Not found", { status: 404 });
  if (limited(request)) return bad("Too many RSVPs from here. Try again in a few minutes.", 429);
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const id = idFrom(String(body.eventId ?? ""));
  const name = str("name", 100);
  const email = str("email", 254).toLowerCase();
  const school = str("school", 20) as School;
  const question = str("question", 1000);
  const optIn = body.optIn !== false;
  if (!id) return bad("That event isn't here anymore.", 404);
  if (!name) return bad("name", 422);
  if (!isEmail(email)) return bad("email", 422);
  if (!SCHOOLS.includes(school)) return bad("school", 422);

  const event = await getFullEvent(id);
  if (!event) return bad("That event isn't here anymore.", 404);
  if (event.past) return bad("closed", 409);

  const sql = db();
  const [created] = await sql`INSERT INTO board_event_rsvps ${sql({
    chapter: event.chapter,
    event_id: id,
    name,
    email,
    school: SCHOOL_LABELS[school],
    question,
    opt_in: optIn,
  })} ON CONFLICT (event_id, lower(email)) DO NOTHING RETURNING id`;
  // A repeat RSVP keeps the first one and gets the confirmation again.
  const [rsvp] = created
    ? [{ name }]
    : await sql`SELECT name FROM board_event_rsvps WHERE event_id = ${id} AND lower(email) = ${email}`;

  let emailed = false;
  const problem = inviteSetupProblem(event.chapter);
  if (problem) console.error(`[events] RSVP confirmation not sent: ${problem}`);
  else emailed = (await sendEventEmails(event, "confirm", [{ name: rsvp.name as string, email }])).sent.length > 0;

  const first = (rsvp.name as string).split(/\s+/)[0];
  const count = event.count === null ? null : event.count + (created ? 1 : 0);
  return Response.json({ ok: true, repeat: !created, first, email, emailed, count }, { status: created ? 201 : 200 });
}
