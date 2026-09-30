import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { ResearchSources } from "@/components/sections/home/ResearchSources";
import { PublicKnowledge } from "@/components/sections/home/PublicKnowledge";
import { EqualFooting } from "@/components/sections/home/EqualFooting";
import { PriceIsRightPreview } from "@/components/sections/home/PriceIsRightPreview";
import { CampusChapters } from "@/components/sections/home/CampusChapters";
import { FollowLinks } from "@/components/sections/home/FollowLinks";
import { AiScams } from "@/components/sections/home/AiScams";
import { Pillars } from "@/components/sections/home/Pillars";
import { FounderStrikes } from "@/components/sections/home/FounderStrikes";
import { FreeResources } from "@/components/sections/home/FreeResources";
import { HomeCta } from "@/components/sections/home/HomeCta";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  localizedPathnames,
  localizeHref,
  type Locale,
} from "@/lib/i18n/config";

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
      images: [{ url: "/preview.webp", alt: "VINdicated" }],
    },
    twitter: {
      title,
      description,
      images: ["/preview.webp"],
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

  return (
    <div className="rd rd-page">
      <HomeHero dict={home.hero} ppiHref={ppi} storyHref={story} />
      <ResearchSources dict={home.sources} />
      <PublicKnowledge dict={home.publicKnowledge} ppiHref={ppi} fraudHref={fraud} />
      <EqualFooting dict={home.footing} />
      <PriceIsRightPreview
        dict={home.preview}
        locale={locale}
        gameHref={href("/research#pir")}
      />
      <CampusChapters dict={home.chapters} joinHref={href("/join")} />
      <FollowLinks dict={home.follow} />
      <AiScams dict={home.ai} rightsHref={href("/fraud#law")} />
      <Pillars dict={home.pillars} ppiHref={ppi} fraudHref={fraud} />
      <FounderStrikes dict={home.strikes} storyHref={story} />
      <FreeResources dict={home.free} />
      <HomeCta
        dict={home.cta}
        ppiHref={ppi}
        documentsHref={href("/documents")}
      />
    </div>
  );
}
