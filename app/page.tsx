import type { Metadata } from "next";
import { RoadScene } from "@/components/sections/RoadScene";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeCards } from "@/components/sections/HomeCards";
import { HomeQuote } from "@/components/sections/HomeQuote";
import { HomeFounder } from "@/components/sections/HomeFounder";
import { Divider } from "@/components/ui";

export const metadata: Metadata = {
  title: "Educate. Empower. Vindicate.",
  openGraph: {
    title: "Educate. Empower. Vindicate.",
    description:
      "VINdicated is a free nonprofit helping car buyers navigate dealerships without being taken advantage of. Free guides, research, and know-your-rights resources.",
    url: "/",
    type: "website",
    images: [{ url: "/preview.webp", alt: "VINdicated" }],
  },
  twitter: {
    title: "Educate. Empower. Vindicate.",
    description:
      "VINdicated is a free nonprofit helping car buyers navigate dealerships without being taken advantage of. Free guides, research, and know-your-rights resources.",
  },
};

export default function HomePage() {
  return (
    <>
      <RoadScene />
      <HomeHero />
      <Divider />
      <HomeDashboard />
      <Divider />
      <HomeCards />
      <Divider />
      <HomeQuote />
      <Divider />
      <HomeFounder />
    </>
  );
}
