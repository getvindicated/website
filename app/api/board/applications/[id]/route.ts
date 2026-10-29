import { bad, guard, idFrom, notFound, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/apply/rules";
import { deleteApplications } from "@/lib/apply/server";

type Ctx = { params: Promise<{ id: string }> };

// Changes an application's status or private notes (admins). Logged, and
// can be restored from the Changes tab.
export async function PATCH(request: Request, ctx: Ctx) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const set: Record<string, unknown> = {};
  if ("status" in body) {
    if (!(STATUSES as readonly unknown[]).includes(body.status)) return bad("Choose a status.");
    set.status = body.status;
  }
  if ("notes" in body) {
    if (typeof body.notes !== "string" || body.notes.length > 10000) return bad("The notes are too long.");
    set.notes = body.notes.trim();
  }
  if (!Object.keys(set).length) return bad("Nothing to change.");
  const done = await db().begin(async (tx) => {
    const before = await snapshot(tx, "board_applications", user.chapter, id);
    if (!before) return false;
    await tx`UPDATE board_applications SET ${tx(set)} WHERE id = ${id} AND chapter = ${user.chapter}`;
    const after = await snapshot(tx, "board_applications", user.chapter, id);
    const what = set.status && set.status !== before.status ? `marked ${STATUS_LABELS[set.status as Status]}` : "edited the notes";
    await logEntry(tx, user, actorOf(request), "update", `Board application from ${before.name}: ${what}`, [{ table: "board_applications", id, before, after }]);
    return true;
  });
  return done ? Response.json({ ok: true }) : notFound();
}

// Deletes an application and its resume for good (admins). The change log
// records that it was deleted, not what it said, so it can't be restored.
export async function DELETE(request: Request, ctx: Ctx) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const done = await db().begin(async (tx) => {
    const [row] = await tx`SELECT name, term FROM board_applications WHERE id = ${id} AND chapter = ${user.chapter}`;
    if (!row) return false;
    await deleteApplications(tx, user.chapter, [id]);
    await logEntry(tx, user, actorOf(request), "note", `Deleted the ${row.term} board application from ${row.name} (deleted for good, not restorable)`, []);
    return true;
  });
  return done ? Response.json({ ok: true }) : notFound();
}
