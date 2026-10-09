import { bad, guard, notFound, readJson } from "@/lib/board/api";
import { derived, editable } from "@/lib/board/editable";
import { createRow } from "@/lib/board/tables";

export async function POST(request: Request, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  const t = editable(table);
  if (!t) return notFound();
  const user = await guard(request, t.roles);
  if (user instanceof Response) return user;

  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const r = await createRow(t.def, body, derived(t.name, body));
  return r.ok ? Response.json({ id: r.id }, { status: 201 }) : bad(r.error, r.status);
}
