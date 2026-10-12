import { bad, guard, idFrom, notFound } from "@/lib/board/api";
import { actorOf, restoreEntry } from "@/lib/board/changelog";

// "Restore previous version" for one change log entry (admins only).
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const r = await restoreEntry(user, actorOf(request), id);
  return "error" in r ? bad(r.error) : Response.json({ ok: true, id: r.id });
}
