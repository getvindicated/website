import type { Metadata } from "next";
import { ChapterPage } from "@/components/board/ChapterPage";

export const metadata: Metadata = { title: "VINdicated at Berkeley" };

export default function BerkeleyBoardPage() {
  return <ChapterPage chapter="berkeley" />;
}
