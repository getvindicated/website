import { bad, guard, idFrom, notFound } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry } from "@/lib/board/changelog";
import { inviteSetupProblem } from "@/lib/board/invites";
import { getFullEvent } from "@/lib/events/server";
import { sendEventEmails } from "@/lib/events/email";

// "Send reminder to everyone" (admins): emails every RSVP the event details
// and meeting link again. Noted in the change log.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  const event = id ? await getFullEvent(id) : null;
  if (!event || event.chapter !== user.chapter) return notFound();
  const problem = inviteSetupProblem(user.chapter);
  if (problem) return bad(problem, 503);
  const rsvps = await db()`SELECT name, email FROM board_event_rsvps WHERE event_id = ${event.id} ORDER BY created_at, id`;
  if (rsvps.length === 0) return bad("No one has RSVPed yet, so there's no one to remind.");
  const r = await sendEventEmails(
    event,
    "reminder",
    rsvps.map((x) => ({ name: x.name as string, email: x.email as string })),
  );
  await logEntry(
    db(),
    user,
    actorOf(request),
    "note",
    `Sent a reminder for "${event.title}" to ${r.sent.length} of ${rsvps.length} ${rsvps.length === 1 ? "person" : "people"}`,
    [],
  );
  if (r.sent.length === 0) return bad("The reminders didn't go through. Try again.", 502);
  return Response.json({ ok: true, sent: r.sent.length, failed: r.failed });
}
