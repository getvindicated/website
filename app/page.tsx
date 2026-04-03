import type { Metadata } from "next";
import { RoadScene } from "@/components/sections/RoadScene";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeDashboard } from "@/components/sections/HomeDashboard";
import { HomeCards } from "@/components/sections/HomeCards";
import { HomeQuote } from "@/components/sections/HomeQuote";
import { HomeFounder } from "@/components/sections/HomeFounder";
import { Divider } from "@/components/ui";

export const metadata: Metadata = {
  title: "Educate. Empower. Vindicate.",
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
