import { guard, idFrom, notFound } from "@/lib/board/api";
import { db } from "@/lib/board/db";

// An uploaded photo, for anyone signed in to its chapter.
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const [row] = await db()`SELECT content_type, data FROM board_photos WHERE id = ${id} AND chapter = ${user.chapter}`;
  if (!row) return notFound();
  return new Response(new Uint8Array(row.data as Buffer), {
    headers: { "content-type": row.content_type, "cache-control": "private, max-age=86400" },
  });
}
