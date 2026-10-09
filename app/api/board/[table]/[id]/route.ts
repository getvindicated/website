import { bad, guard, idFrom, notFound, readJson } from "@/lib/board/api";
import { derived, editable } from "@/lib/board/editable";
import { deleteRow, updateRow } from "@/lib/board/tables";

async function target(request: Request, ctx: { params: Promise<{ table: string; id: string }> }) {
  const { table, id: rawId } = await ctx.params;
  const t = editable(table);
  const id = idFrom(rawId);
  if (!t || !id) return notFound();
  const user = await guard(request, t.roles);
  if (user instanceof Response) return user;
  return { t, id };
}

export async function PATCH(request: Request, ctx: { params: Promise<{ table: string; id: string }> }) {
  const x = await target(request, ctx);
  if (x instanceof Response) return x;
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const r = await updateRow(x.t.def, x.id, body, derived(x.t.name, body));
  return r.ok ? Response.json({ id: r.id }) : bad(r.error, r.status);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ table: string; id: string }> }) {
  const x = await target(request, ctx);
  if (x instanceof Response) return x;
  const r = await deleteRow(x.t.def, x.id);
  return r.ok ? Response.json({ id: r.id }) : bad(r.error, r.status);
}
