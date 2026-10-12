import { bad, guard, notFound, readJson } from "@/lib/board/api";
import { describe, derived, editable } from "@/lib/board/editable";
import { createRow } from "@/lib/board/tables";
import { db } from "@/lib/board/db";
import { getTeams } from "@/lib/board/settings-server";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";

// Adds a row to an editable table, for the signed-in chapter, and logs it.
export async function POST(request: Request, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  const user = await guard(request);
  if (user instanceof Response) return user;
  const t = editable(table, await getTeams(user.chapter));
  if (!t || !t.roles.includes(user.role) || t.name === "rounds") return notFound();

  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const r = await db().begin(async (tx) => {
    const res = await createRow(t.def, body, { ...derived(t.name, body), chapter: user.chapter }, tx);
    if (res.ok) {
      const after = await snapshot(tx, t.def.table, user.chapter, res.id);
      await logEntry(tx, user, actorOf(request), "create", `Added ${describe(t.name, after)}`, [{ table: t.def.table, id: res.id, before: null, after }]);
    }
    return res;
  });
  return r.ok ? Response.json({ id: r.id }, { status: 201 }) : bad(r.error, r.status);
}
