import { idFrom } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { canSeeEvents, eventsPublic } from "@/lib/events/server";

// An event's flyer, for the public page. Flyers are uploaded on the hub and
// stored with the hub photos; only a photo an event points at is served here.
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!canSeeEvents(request.headers) || !process.env.DATABASE_URL) return new Response("Not found", { status: 404 });
  const id = idFrom((await ctx.params).id);
  if (!id) return new Response("Not found", { status: 404 });
  const [row] = await db()`SELECT p.content_type, p.data FROM board_events e
    JOIN board_photos p ON p.id = e.flyer_id AND p.chapter = e.chapter WHERE e.id = ${id}`;
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data as Buffer), {
    headers: {
      "content-type": row.content_type,
      // Short, so a new flyer shows up soon after an admin changes it.
      "cache-control": eventsPublic() ? "public, max-age=300" : "private, max-age=300",
    },
  });
}
