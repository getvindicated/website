import type { Metadata } from "next";
import { RoadScene } from "@/components/sections/RoadScene";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeCards } from "@/components/sections/HomeCards";
import { HomeQuote } from "@/components/sections/HomeQuote";
import { HomeFounder } from "@/components/sections/HomeFounder";
import { Divider } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { HomeDict } from "@/lib/i18n/home-dict";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = (await getDictionary(locale as Locale)) as { home?: HomeDict };
  const title = dict.home?.meta?.title ?? "Educate. Empower. Vindicate.";
  const description =
    dict.home?.meta?.description ??
    "VINdicated is a free nonprofit helping car buyers navigate dealerships without being taken advantage of. Free guides, research, and know-your-rights resources.";

  return {
    title,
    openGraph: {
      title,
      description,
      url: "/",
      type: "website",
      images: [{ url: "/preview.webp", alt: "VINdicated" }],
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = (await getDictionary(locale as Locale)) as { home?: HomeDict };

  return (
    <>
      <RoadScene />
      <HomeHero locale={locale as Locale} dict={dict.home} />
      <Divider />
      <HomeCards locale={locale as Locale} dict={dict.home} />
      <Divider />
      <HomeQuote dict={dict.home} />
      <Divider />
      <HomeFounder locale={locale as Locale} dict={dict.home} />
    </>
  );
}
