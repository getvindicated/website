import { bad, guard, idFrom, notFound, readJson } from "@/lib/board/api";
import { describe, derived, editable } from "@/lib/board/editable";
import { deleteRow, updateRow } from "@/lib/board/tables";
import { db } from "@/lib/board/db";
import { getTeams } from "@/lib/board/settings-server";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";

async function target(request: Request, ctx: { params: Promise<{ table: string; id: string }> }) {
  const { table, id: rawId } = await ctx.params;
  const id = idFrom(rawId);
  if (!id) return notFound();
  const user = await guard(request);
  if (user instanceof Response) return user;
  const t = editable(table, await getTeams(user.chapter));
  if (!t || !t.roles.includes(user.role)) return notFound();
  return { t, id, user };
}

// Edits a row of the signed-in chapter and logs it with the old values.
export async function PATCH(request: Request, ctx: { params: Promise<{ table: string; id: string }> }) {
  const x = await target(request, ctx);
  if (x instanceof Response) return x;
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const { t, id, user } = x;
  const r = await db().begin(async (tx) => {
    const before = await snapshot(tx, t.def.table, user.chapter, id);
    const res = await updateRow(t.def, user.chapter, id, body, derived(t.name, body), tx);
    if (res.ok) {
      const after = await snapshot(tx, t.def.table, user.chapter, id);
      await logEntry(tx, user, actorOf(request), "update", `Edited ${describe(t.name, after)}`, [{ table: t.def.table, id, before, after }]);
    }
    return res;
  });
  return r.ok ? Response.json({ id: r.id }) : bad(r.error, r.status);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ table: string; id: string }> }) {
  const x = await target(request, ctx);
  if (x instanceof Response) return x;
  const { t, id, user } = x;
  if (t.name === "rounds") return bad("Weeks can't be deleted.", 400);
  const r = await db().begin(async (tx) => {
    const before = await snapshot(tx, t.def.table, user.chapter, id);
    const res = await deleteRow(t.def, user.chapter, id, tx);
    if (res.ok) {
      await logEntry(tx, user, actorOf(request), "delete", `Removed ${describe(t.name, before)}`, [{ table: t.def.table, id, before, after: null }]);
    }
    return res;
  });
  return r.ok ? Response.json({ id: r.id }) : bad(r.error, r.status);
}
