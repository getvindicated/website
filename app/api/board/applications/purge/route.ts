import { guard } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry } from "@/lib/board/changelog";
import { deleteApplications, getConfig } from "@/lib/apply/server";

// "Delete all from past terms" (admins): deletes every application (and
// resume) not from the current term, for good. Logged without their content.
export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const { term } = await getConfig(user.chapter);
  const n = await db().begin(async (tx) => {
    const rows = await tx`SELECT id FROM board_applications WHERE chapter = ${user.chapter} AND term <> ${term}`;
    const deleted = await deleteApplications(tx, user.chapter, rows.map((r) => r.id as number));
    if (deleted) await logEntry(tx, user, actorOf(request), "note", `Deleted ${deleted} board application${deleted === 1 ? "" : "s"} from terms before ${term} (deleted for good, not restorable)`, []);
    return deleted;
  });
  return Response.json({ ok: true, deleted: n });
}
