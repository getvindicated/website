import { eventsPublic, nextPublicEvent } from "@/lib/events/server";
import { isValidLocale } from "@/lib/i18n/config";

// The next event for the home page strip, once events are public.
export async function GET(request: Request) {
  if (!eventsPublic()) return new Response("Not found", { status: 404 });
  const raw = new URL(request.url).searchParams.get("locale") ?? "en";
  const event = await nextPublicEvent(isValidLocale(raw) ? raw : "en").catch(() => null);
  return Response.json({ event }, { headers: { "cache-control": "public, max-age=60" } });
}
