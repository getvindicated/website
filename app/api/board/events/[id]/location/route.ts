import { bad, guard, idFrom, notFound } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry } from "@/lib/board/changelog";
import { inviteSetupProblem } from "@/lib/board/invites";
import { getFullEvent } from "@/lib/events/server";
import { sendEventEmails } from "@/lib/events/email";

// "Send the location to everyone" (admins): once an in-person event has its
// address, emails every RSVP the address with an updated calendar file. The
// calendar SEQUENCE goes up first, so calendars update the entry they
// already have (same UID) instead of adding a second one. Noted in the
// change log.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  const before = id ? await getFullEvent(id) : null;
  if (!before || before.chapter !== user.chapter) return notFound();
  if (before.online || !before.address) return bad("Add the address first (Edit), then send it.");
  if (before.past) return bad("This event is over.");
  const problem = inviteSetupProblem(user.chapter);
  if (problem) return bad(problem, 503);
  const sql = db();
  const rsvps = await sql`SELECT name, email, locale FROM board_event_rsvps WHERE event_id = ${before.id} ORDER BY created_at, id`;
  if (rsvps.length === 0) return bad("No one has RSVPed yet, so there's no one to send it to.");

  await sql`UPDATE board_events SET ics_sequence = ics_sequence + 1 WHERE id = ${before.id} AND chapter = ${user.chapter}`;
  // Each person gets it in the language they RSVPed in.
  const r = await sendEventEmails(
    before.id,
    "location",
    rsvps.map((x) => ({ name: x.name as string, email: x.email as string, locale: x.locale as string })),
  );
  if (r.sent.length) await sql`UPDATE board_events SET location_pending = false WHERE id = ${before.id} AND chapter = ${user.chapter}`;
  await logEntry(
    sql,
    user,
    actorOf(request),
    "note",
    `Sent the location of "${before.title}" (${before.address}) to ${r.sent.length} of ${rsvps.length} ${rsvps.length === 1 ? "person" : "people"}`,
    [],
  );
  if (r.sent.length === 0) return bad("The emails didn't go through. Try again.", 502);
  return Response.json({ ok: true, sent: r.sent.length, failed: r.failed });
}
