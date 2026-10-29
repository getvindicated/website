import { bad, guard, idFrom, notFound, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";
import { createRow } from "@/lib/board/tables";
import { derived, editable } from "@/lib/board/editable";
import { getTeams } from "@/lib/board/settings-server";

// "Add to board" (admins): makes a Board tab member from an application,
// with its name, email and phone, the chosen position as their role and
// the chosen team. An admin finishes the rest on the Board tab. Logged
// together, so restoring the entry removes the member again.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const body = await readJson(request);
  const role = typeof body?.role === "string" ? body.role.trim() : "";
  const team = typeof body?.team === "string" ? body.team : "";
  const t = editable("members", await getTeams(user.chapter))!;
  const r = await db().begin(async (tx) => {
    const before = await snapshot(tx, "board_applications", user.chapter, id);
    if (!before) return { status: 404 as const };
    if (before.member_id) {
      const [m] = await tx`SELECT 1 FROM board_members WHERE id = ${before.member_id as number} AND chapter = ${user.chapter}`;
      if (m) return { error: "They're already on the Board tab." };
    }
    if (!(before.positions as string[]).includes(role)) return { error: "Choose one of the positions they applied for." };
    const fields = { name: before.name, role, team, email: before.email, phone: before.phone };
    const made = await createRow(t.def, fields, { ...derived("members", fields), chapter: user.chapter }, tx);
    if (!made.ok) return { error: made.error };
    await tx`UPDATE board_applications SET member_id = ${made.id} WHERE id = ${id} AND chapter = ${user.chapter}`;
    const member = await snapshot(tx, "board_members", user.chapter, made.id);
    const after = await snapshot(tx, "board_applications", user.chapter, id);
    await logEntry(tx, user, actorOf(request), "create", `Added ${before.name} to the board from their application (${role}, ${team})`, [
      { table: "board_members", id: made.id, before: null, after: member },
      { table: "board_applications", id, before, after },
    ]);
    return { memberId: made.id };
  });
  if ("status" in r) return notFound();
  if ("error" in r) return bad(r.error as string);
  return Response.json({ ok: true, memberId: r.memberId }, { status: 201 });
}
