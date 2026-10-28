import { bad, guard, idFrom, notFound, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";
import { parseEvent } from "@/lib/events/admin";

type Ctx = { params: Promise<{ id: string }> };

// Edits one of this chapter's events (admins). Logged.
export async function PATCH(request: Request, ctx: Ctx) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const cols = await parseEvent(body, user.chapter);
  if ("error" in cols) return bad(cols.error);
  const done = await db().begin(async (tx) => {
    const before = await snapshot(tx, "board_events", user.chapter, id);
    if (!before) return false;
    await tx`UPDATE board_events SET ${tx({ ...cols, translations: tx.json(cols.translations as never) })} WHERE id = ${id} AND chapter = ${user.chapter}`;
    const after = await snapshot(tx, "board_events", user.chapter, id);
    await logEntry(tx, user, actorOf(request), "update", `Edited the event "${cols.title}"`, [{ table: "board_events", id, before, after }]);
    return true;
  });
  return done ? Response.json({ ok: true }) : notFound();
}

// Deletes an event (admins). Its RSVPs stay in the database, so restoring
// the event from the change log brings them back.
export async function DELETE(request: Request, ctx: Ctx) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const done = await db().begin(async (tx) => {
    const before = await snapshot(tx, "board_events", user.chapter, id);
    if (!before) return false;
    await tx`DELETE FROM board_events WHERE id = ${id} AND chapter = ${user.chapter}`;
    await logEntry(tx, user, actorOf(request), "delete", `Deleted the event "${before.title}"`, [
      { table: "board_events", id, before, after: null },
    ]);
    return true;
  });
  return done ? Response.json({ ok: true }) : notFound();
}
