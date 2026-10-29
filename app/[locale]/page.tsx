import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { PpiExplainer } from "@/components/sections/home/PpiExplainer";
import { EqualFooting } from "@/components/sections/home/EqualFooting";
import { CampusChapters } from "@/components/sections/home/CampusChapters";
import { FollowLinks } from "@/components/sections/home/FollowLinks";
import { Pillars } from "@/components/sections/home/Pillars";
import { FreeResources } from "@/components/sections/home/FreeResources";
import { WorkshopFeature } from "@/components/sections/home/WorkshopFeature";
import { eventsPublic, nextPublicEvent } from "@/lib/events/server";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SHARE_IMAGE } from "@/lib/i18n/metadata";
import {
  localizedPathnames,
  localizeHref,
  type Locale,
} from "@/lib/i18n/config";

// The workshop section reads the next event from the database: the page is
// rebuilt at most once a minute, so it picks up changes from the Events tab.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const title = dict.home.meta.title;
  const description = dict.home.meta.description;

  return {
    title,
    description,
    alternates: {
      canonical: localizeHref(locale as Locale, "/"),
      languages: localizedPathnames("/"),
    },
    openGraph: {
      title,
      description,
      url: localizeHref(locale as Locale, "/"),
      type: "website",
      locale,
      images: [{ ...SHARE_IMAGE, alt: dict.meta.routes.home.imageAlt }],
    },
    twitter: {
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const home = dict.homePage;
  const href = (h: string) => localizeHref(locale as Locale, h);

  const ppi = href("/inspection");
  const fraud = href("/fraud");
  const story = href("/about#story");
  // Not while building: the database may not be reachable then, and the
  // page refreshes with the event within a minute of going live.
  const workshop = eventsPublic() && process.env.NEXT_PHASE !== "phase-production-build"
    ? await nextPublicEvent(locale).catch((e) => {
        console.error("[events] Couldn't load the next event:", e instanceof Error ? e.message : e);
        return null;
      })
    : null;

  return (
    <div className="rd rd-page">
      <HomeHero dict={home.hero} ppiHref={ppi} storyHref={story} />
      {workshop && <WorkshopFeature dict={dict.eventsPage} event={workshop} locale={locale} eventsHref={href("/events")} />}
      <PpiExplainer
        dict={home.ppi}
        knowledge={home.publicKnowledge}
        ppiHref={ppi}
        whereHref={href("/inspection#where")}
        fraudHref={fraud}
      />
      <EqualFooting dict={home.footing} />
      <CampusChapters dict={home.chapters} joinHref={href("/join")} />
      <FollowLinks dict={home.follow} />
      <Pillars dict={home.pillars} ppiHref={ppi} fraudHref={fraud} />
      <FreeResources dict={home.free} />
    </div>
  );
}
