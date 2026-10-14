import { bad, guard, idFrom, isDate, notFound, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { inviteSetupProblem, sendInvites } from "@/lib/board/invites";
import { NOT_SENT, countSent, getScheduled, notReady, parseMeeting, resolveInvitees } from "@/lib/board/schedule-server";
import { occurrences } from "@/lib/board/schedule";

type Ctx = { params: Promise<{ id: string }> };

const NOT_CANCELLED = "The cancellations didn't go through. Try again.";

async function load(request: Request, ctx: Ctx) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  const meeting = id ? await getScheduled(user.chapter, id) : null;
  if (!meeting) return notFound();
  const problem = inviteSetupProblem(user.chapter);
  if (problem) return notReady(problem);
  return { user, meeting };
}

// Edits a scheduled meeting and resends it: the same UID with SEQUENCE+1,
// so calendars update the event they have. People taken off the invite
// get a cancellation; people added get the invite.
export async function PATCH(request: Request, ctx: Ctx) {
  const x = await load(request, ctx);
  if (x instanceof Response) return x;
  const { user, meeting: old } = x;
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const parsed = parseMeeting(body);
  if ("error" in parsed) return bad(parsed.error);
  const { invitees, skipped, audience } = await resolveInvitees(user.chapter, parsed.invite);
  if (invitees.length === 0) return bad("No one you picked has an email on file, so there's no one to invite.");

  const m = parsed.meeting;
  const sql = db();
  // Cancelled dates only make sense on the same weekday after an edit.
  const cancelled = old.cancelledDates.filter((d) => occurrences({ ...m, cancelledDates: [] }).includes(d));
  await sql`UPDATE board_scheduled SET ${sql({
    sequence: old.sequence + 1,
    title: m.title,
    date: m.date,
    start_time: m.startTime,
    end_time: m.endTime,
    location: m.location,
    notes: m.notes,
    weekly: m.weekly,
    until: m.until,
    invitees: sql.json(invitees),
    audience,
    cancelled_dates: cancelled,
  })} WHERE chapter = ${user.chapter} AND id = ${old.id}`;
  const updated = (await getScheduled(user.chapter, old.id))!;

  const had = new Set(old.invitees.map((i) => i.email.toLowerCase()));
  const has = new Set(invitees.map((i) => i.email.toLowerCase()));
  const kept = invitees.filter((i) => had.has(i.email.toLowerCase()));
  const added = invitees.filter((i) => !had.has(i.email.toLowerCase()));
  const removed = old.invitees.filter((i) => !has.has(i.email.toLowerCase()));

  // If no invite ever went through, everyone gets a first invite instead.
  const neverSent = old.invitesSent === 0;
  const a = await sendInvites({ chapter: user.chapter, meeting: updated, kind: "update", recipients: neverSent ? [] : kept, attendees: invitees });
  const b = await sendInvites({ chapter: user.chapter, meeting: updated, kind: "new", recipients: neverSent ? invitees : added, attendees: invitees });
  const c = await sendInvites({ chapter: user.chapter, meeting: updated, kind: "cancel", recipients: neverSent ? [] : removed });
  await countSent(user.chapter, old.id, a.sent.length + b.sent.length);
  if (a.sent.length + b.sent.length === 0) return bad(NOT_SENT, 502);
  return Response.json({
    ok: true,
    sent: a.sent.length + b.sent.length,
    cancelled: c.sent.length,
    failed: [...a.failed, ...b.failed, ...c.failed],
    skipped,
  });
}

// Resends the invite to everyone on it, unchanged (same UID and SEQUENCE).
// For a meeting whose invites never went through.
export async function POST(request: Request, ctx: Ctx) {
  const x = await load(request, ctx);
  if (x instanceof Response) return x;
  const { user, meeting: m } = x;
  const r = await sendInvites({ chapter: user.chapter, meeting: m, kind: "new", recipients: m.invitees });
  await countSent(user.chapter, m.id, r.sent.length);
  if (r.sent.length === 0) return bad(NOT_SENT, 502);
  return Response.json({ ok: true, sent: r.sent.length, failed: r.failed });
}

// Cancels a meeting. With ?date=YYYY-MM-DD, cancels just that date of a
// weekly series (METHOD:CANCEL with RECURRENCE-ID); otherwise the whole
// meeting, which is then deleted. Cancellations go out first, and nothing
// changes unless at least one gets through, so a failed cancel can be tried
// again. A meeting whose invites never went out is changed without email.
export async function DELETE(request: Request, ctx: Ctx) {
  const x = await load(request, ctx);
  if (x instanceof Response) return x;
  const { user, meeting: m } = x;
  const date = new URL(request.url).searchParams.get("date");
  const sql = db();
  const sequence = m.sequence + 1;

  if (date) {
    if (!isDate(date) || !occurrences(m).includes(date)) return bad("That date isn't part of this meeting.");
    const cancelledDates = [...m.cancelledDates, date].sort();
    if (!m.weekly || occurrences({ ...m, cancelledDates }).length === 0) {
      // Nothing would be left: cancel the whole meeting instead.
      return cancelAll();
    }
    const r = await sendInvites({
      chapter: user.chapter,
      meeting: { ...m, sequence, cancelledDates },
      kind: "cancel-one",
      recipients: m.invitesSent ? m.invitees : [],
      onlyDate: date,
    });
    if (m.invitesSent && m.invitees.length && r.sent.length === 0) return bad(NOT_CANCELLED, 502);
    await sql`UPDATE board_scheduled SET sequence = ${sequence}, cancelled_dates = ${cancelledDates}
      WHERE chapter = ${user.chapter} AND id = ${m.id}`;
    return Response.json({ ok: true, cancelled: r.sent.length, failed: r.failed });
  }
  return cancelAll();

  async function cancelAll() {
    const r = await sendInvites({ chapter: user.chapter, meeting: { ...m, sequence }, kind: "cancel", recipients: m.invitesSent ? m.invitees : [] });
    if (m.invitesSent && m.invitees.length && r.sent.length === 0) return bad(NOT_CANCELLED, 502);
    await sql`DELETE FROM board_scheduled WHERE chapter = ${user.chapter} AND id = ${m.id}`;
    return Response.json({ ok: true, cancelled: r.sent.length, failed: r.failed });
  }
}
