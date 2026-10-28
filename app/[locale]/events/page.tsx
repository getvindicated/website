import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/shared/PageHero";
import { EventsList, type ShownEvent } from "@/components/sections/events/EventsList";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { eventsAdmin, eventsPublic, listPublicEvents } from "@/lib/events/server";
import { eventLabels } from "@/lib/events/format";

// Reads the board session cookie (admins can preview before launch), so it
// renders on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = await getRouteMetadata(locale, "events", "/events");
  // Kept out of search engines until launch (see BOARD_SETUP.md).
  return eventsPublic() ? meta : { ...meta, robots: { index: false, follow: false } };
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const isPublic = eventsPublic();
  if (!isPublic && !eventsAdmin(await headers())) notFound();

  const d = (await getDictionary(locale as Locale)).eventsPage;
  const events: ShownEvent[] = (await listPublicEvents(locale).catch((e) => {
    console.error("[events] Couldn't load events:", e instanceof Error ? e.message : e);
    return [];
  })).map((e) => ({ ...e, ...eventLabels(e, locale) }));

  return (
    <div className="rd rd-page">
      {!isPublic && (
        <div className="ev-preview" role="status">
          {d.preview}
        </div>
      )}
      <PageHero title={d.hero.title} body={d.hero.body} />
      <section className="pt0">
        <div className="wrap">
          <EventsList dict={d} events={events} />
        </div>
      </section>
    </div>
  );
}
