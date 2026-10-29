import { bad, guard, idFrom, notFound, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry } from "@/lib/board/changelog";
import { getApplication } from "@/lib/apply/server";
import { sendApplicantEmail } from "@/lib/apply/email";

// "Email applicant" (admins): sends the message an admin wrote, from the
// chapter's sender. The change log notes that it went, and its subject.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const body = await readJson(request);
  const subject = typeof body?.subject === "string" ? body.subject.replace(/[\r\n]+/g, " ").trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!subject || subject.length > 200) return bad("Add a subject (up to 200 characters).");
  if (!text || text.length > 10000) return bad("Write the message (up to 10,000 characters).");
  const a = await getApplication(user.chapter, id);
  if (!a) return notFound();
  const sent = await sendApplicantEmail(user.chapter, { name: a.name, email: a.email }, subject, text, id);
  if (!sent.ok) return bad(sent.error ?? "The email didn't go through. Try again.", 502);
  await logEntry(db(), user, actorOf(request), "note", `Emailed ${a.name} about their board application: "${subject}"`, []);
  return Response.json({ ok: true });
}
