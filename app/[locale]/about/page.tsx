import { PageHero } from "@/components/sections/shared/PageHero";
import { CtaBand } from "@/components/sections/shared/CtaBand";
import { ZoomSlideshow } from "@/components/sections/about/ZoomSlideshow";
import { PhotoGrid } from "@/components/sections/about/PhotoGrid";
import { MissionPillars } from "@/components/sections/about/MissionPillars";
import { FounderStory } from "@/components/sections/about/FounderStory";
import { FounderVideo } from "@/components/sections/about/FounderVideo";
import { QuoteBand } from "@/components/sections/about/QuoteBand";
import { WhatWeProvide } from "@/components/sections/about/WhatWeProvide";
import { AiScams } from "@/components/sections/about/AiScams";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "about", "/about");
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = (await getDictionary(locale as Locale)).aboutPage;
  const href = (h: string) => localizeHref(locale as Locale, h);

  return (
    <div className="rd rd-page">
      <PageHero
        className="a-hero"
        centered
        title={dict.hero.title}
        body={dict.hero.body}
      >
        <div className="scroll-cue" aria-hidden="true">
          <span />
        </div>
      </PageHero>
      <ZoomSlideshow dict={dict.zoom} />
      <PhotoGrid dict={dict.photos} />
      <MissionPillars dict={dict.mission} />
      <FounderStory dict={dict.story} />
      <FounderVideo dict={dict.video} />
      <AiScams dict={dict.ai} rightsHref={href("/fraud#law")} />
      <QuoteBand text={dict.quote.text} cite={dict.quote.cite} />
      <WhatWeProvide dict={dict.provide} projectsHref={href("/research")} />
      <CtaBand
        title={dict.cta.title}
        body={dict.cta.body}
        primary={{ label: dict.cta.primary, href: href("/join") }}
        secondary={{ label: dict.cta.secondary, href: href("/team") }}
      />
    </div>
  );
}
