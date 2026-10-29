import { guard, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry } from "@/lib/board/changelog";

// Removes "email me when they open" signups (admins): one by id, or the
// whole list once they've been emailed. Logged without the addresses.
export async function DELETE(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  const id = typeof body?.id === "number" && Number.isInteger(body.id) ? body.id : null;
  const sql = db();
  const rows = id
    ? await sql`DELETE FROM board_application_notify WHERE chapter = ${user.chapter} AND id = ${id} RETURNING id`
    : await sql`DELETE FROM board_application_notify WHERE chapter = ${user.chapter} RETURNING id`;
  if (rows.length) {
    await logEntry(sql, user, actorOf(request), "note", id ? "Removed an email from the board applications notify list" : `Cleared the board applications notify list (${rows.length})`, []);
  }
  return Response.json({ ok: true, removed: rows.length });
}
