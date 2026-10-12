import { bad, guard, notFound, readJson } from "@/lib/board/api";
import { derived, editable } from "@/lib/board/editable";
import { createRow } from "@/lib/board/tables";

export async function POST(request: Request, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  const user = await guard(request);
  if (user instanceof Response) return user;
  const t = editable(table, user.chapter);
  if (!t || !t.roles.includes(user.role)) return notFound();

  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const r = await createRow(t.def, body, { ...derived(t.name, body), chapter: user.chapter });
  return r.ok ? Response.json({ id: r.id }, { status: 201 }) : bad(r.error, r.status);
}
