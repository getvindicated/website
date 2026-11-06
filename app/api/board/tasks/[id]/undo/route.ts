import { bad, guard, idFrom, notFound } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";

// "Undo" on a done task (simple layout): puts it back to To do. Anyone
// signed in can, like submitting, since everyone shares the password. The
// submission email already went out; this only changes the status. Logged.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const r = await db().begin(async (tx) => {
    const before = await snapshot(tx, "board_assignments", user.chapter, id);
    if (!before) return "missing";
    if (before.status !== "submitted" && before.status !== "done") return "not-done";
    await tx`UPDATE board_assignments SET status = 'pending' WHERE id = ${id} AND chapter = ${user.chapter}`;
    const after = await snapshot(tx, "board_assignments", user.chapter, id);
    await logEntry(tx, user, actorOf(request), "update", `${before.person} undid "${String(before.task).slice(0, 80)}"`, [
      { table: "board_assignments", id, before, after },
    ]);
    return "ok";
  });
  if (r === "missing") return notFound();
  if (r === "not-done") return bad("That task isn't done.");
  return Response.json({ ok: true });
}
