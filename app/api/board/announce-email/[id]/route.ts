import { bad, guard, idFrom, notFound, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry } from "@/lib/board/changelog";
import { announceSetupProblem, announcementRecipients, recordSends, sendAnnouncement, sendSummaries } from "@/lib/board/announce";

// Emails an announcement to the chapter (admins only). kind: "post" (new),
// "update" (edited, subject starts "Updated:"), or "retry" (only the people
// the last send didn't reach).
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const problem = announceSetupProblem();
  if (problem) {
    console.error(`[board] Announcement emails are off: ${problem}`);
    return bad("Announcement emails aren't set up yet. Rana: add BREVO_API_KEY and BOARD_INVITE_FROM in Railway (see BOARD_SETUP.md).", 503);
  }
  const body = await readJson(request);
  const kind = body?.kind;
  if (kind !== "post" && kind !== "update" && kind !== "retry") return bad("Check the form.");

  const [a] = await db()`SELECT id, title, body, admins_only FROM board_announcements WHERE id = ${id} AND chapter = ${user.chapter}`;
  if (!a) return notFound();
  const mail = { title: a.title, body: a.body, adminsOnly: a.admins_only };

  let people: { name: string; email: string }[];
  let update = kind === "update";
  if (kind === "retry") {
    const last = (await sendSummaries(user.chapter)).find((s) => s.announcementId === id);
    if (!last || !last.failed.length) return bad("Everyone already got this one.");
    people = last.failed;
    update = last.kind === "update";
  } else {
    people = (await announcementRecipients(user.chapter, mail.adminsOnly)).to;
    if (!people.length) return bad(mail.adminsOnly ? "No Hub admin has an email on file." : "No one has an email on file.");
  }
  const results = await sendAnnouncement(user.chapter, mail, people, update);
  await recordSends(user.chapter, id, kind, results);
  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).map((r) => r.email);
  await logEntry(db(), user, actorOf(request), "note", `Emailed "${a.title}" to ${sent} ${sent === 1 ? "person" : "people"}${failed.length ? ` (${failed.length} failed)` : ""}`, []);
  return Response.json({ ok: true, sent, failed });
}
