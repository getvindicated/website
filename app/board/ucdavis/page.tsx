import type { Metadata } from "next";
import { ChapterPage } from "@/components/board/ChapterPage";

export const metadata: Metadata = { title: "VINdicated at UC Davis" };

export default function UcDavisBoardPage() {
  return <ChapterPage chapter="ucdavis" />;
}
