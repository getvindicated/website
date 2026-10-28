import { idFrom } from "@/lib/board/api";
import { canSeeEvents, getFullEvent } from "@/lib/events/server";
import { buildEventIcs } from "@/lib/events/ics";
import { icsLabels } from "@/lib/events/email";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/lib/i18n/config";

// The "Download for Apple / Outlook" file. Anyone who can see the page can
// fetch it, so it never has the meeting link (that's in the confirmation
// email's copy).
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!canSeeEvents(request.headers)) return new Response("Not found", { status: 404 });
  const id = idFrom((await ctx.params).id);
  const raw = new URL(request.url).searchParams.get("locale") ?? "en";
  const locale = isValidLocale(raw) ? raw : "en";
  const event = id ? await getFullEvent(id, locale) : null;
  if (!event) return new Response("Not found", { status: 404 });
  const d = (await getDictionary(locale as Locale)).eventsPage;
  return new Response(buildEventIcs(event, null, icsLabels(d), locale), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="vindicated-event-${event.id}.ics"`,
      "cache-control": "no-store",
    },
  });
}
