import { guard, idFrom, notFound } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { toRsvp } from "@/lib/events/server";
import { rsvpCsv } from "@/lib/events/admin";

// "Download CSV" of an event's RSVPs (admins).
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const sql = db();
  const [event] = await sql`SELECT title, date FROM board_events WHERE id = ${id} AND chapter = ${user.chapter}`;
  if (!event) return notFound();
  const rows = await sql`SELECT * FROM board_event_rsvps WHERE event_id = ${id} AND chapter = ${user.chapter} ORDER BY created_at, id`;
  const slug = String(event.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "event";
  return new Response(rsvpCsv(rows.map(toRsvp)), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="rsvps-${event.date}-${slug}.csv"`,
      "cache-control": "no-store",
    },
  });
}
