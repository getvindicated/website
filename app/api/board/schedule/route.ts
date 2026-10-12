import { randomUUID } from "node:crypto";
import { bad, guard, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { inviteSetupProblem, sendInvites } from "@/lib/board/invites";
import { getScheduled, notReady, parseMeeting, resolveInvitees } from "@/lib/board/schedule-server";
import { isEmail } from "@/lib/board/submit-rules";

// Schedules a meeting and emails the invites (admins only). With `test`
// set to an address, sends one invite there and saves nothing.
export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const problem = inviteSetupProblem(user.chapter);
  if (problem) return notReady(problem);
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const parsed = parseMeeting(body);
  if ("error" in parsed) return bad(parsed.error);
  const { meeting, invite } = parsed;

  if (body.test !== undefined) {
    const to = typeof body.test === "string" ? body.test.trim() : "";
    if (!isEmail(to)) return bad("Add the email to send the test to.");
    const test = { ...meeting, id: 0, uid: `test-${randomUUID()}@getvindicated.org`, sequence: 0, invitees: [], audience: "", cancelledDates: [] };
    const r = await sendInvites({ chapter: user.chapter, meeting: test, kind: "new", recipients: [{ name: to, email: to }] });
    return r.sent.length ? Response.json({ ok: true, test: to }) : bad("The test invite didn't go through. Check the address and try again.", 502);
  }

  const { invitees, skipped, audience } = await resolveInvitees(user.chapter, invite);
  if (invitees.length === 0) return bad("No one you picked has an email on file, so there's no one to invite.");
  const uid = `${user.chapter}-${randomUUID()}@getvindicated.org`;
  const sql = db();
  const [row] = await sql`INSERT INTO board_scheduled ${sql({
    chapter: user.chapter,
    uid,
    title: meeting.title,
    date: meeting.date,
    start_time: meeting.startTime,
    end_time: meeting.endTime,
    location: meeting.location,
    notes: meeting.notes,
    weekly: meeting.weekly,
    until: meeting.until,
    invitees: sql.json(invitees),
    audience,
  })} RETURNING id`;
  const saved = (await getScheduled(user.chapter, row.id))!;
  const r = await sendInvites({ chapter: user.chapter, meeting: saved, kind: "new", recipients: invitees });
  return Response.json({ ok: true, id: row.id, sent: r.sent.length, failed: r.failed, skipped }, { status: 201 });
}
