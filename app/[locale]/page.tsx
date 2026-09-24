import type { Metadata } from "next";
import { RoadScene } from "@/components/sections/RoadScene";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeCards } from "@/components/sections/HomeCards";
import { HomeQuote } from "@/components/sections/HomeQuote";
import { HomeFounder } from "@/components/sections/HomeFounder";
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
  const home = dict.home;

  return (
    <>
      <RoadScene />
      <HomeHero locale={locale as Locale} dict={home} />
      <HomeCards locale={locale as Locale} dict={home} />
      <HomeQuote dict={home} />
      {/* <HomeFounder locale={locale as Locale} dict={home} /> */}
    </>
  );
}
