import { eventsPublic, nextPublicEvent } from "@/lib/events/server";

// The next event for the home page strip, once events are public.
export async function GET() {
  if (!eventsPublic()) return new Response("Not found", { status: 404 });
  const event = await nextPublicEvent().catch(() => null);
  return Response.json({ event }, { headers: { "cache-control": "public, max-age=60" } });
}
