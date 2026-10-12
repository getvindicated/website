import { bad, guard, readJson } from "@/lib/board/api";
import { chapterConfig } from "@/lib/board/chapters";
import { db } from "@/lib/board/db";

const STATUSES = ["pending", "submitted", "missing", "excused"];

// Weekly deliverables (UCLA) have one status per person: setting it marks
// all of that person's tasks in the current week. Admins only.
export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  if (!chapterConfig(user.chapter).weekly) return bad("This chapter sets status per task.", 404);
  const body = await readJson(request);
  const person = typeof body?.person === "string" ? body.person.trim() : "";
  const status = typeof body?.status === "string" ? body.status : "";
  if (!person || !STATUSES.includes(status)) return bad("Choose a person and a status.");
  const sql = db();
  const rows = await sql`UPDATE board_assignments SET status = ${status}
    WHERE chapter = ${user.chapter} AND person = ${person}
      AND round = (SELECT round FROM board_rounds WHERE chapter = ${user.chapter} AND is_current)
    RETURNING id`;
  return rows.length ? Response.json({ ok: true, count: rows.length }) : bad("That person has no tasks this week.", 404);
}
