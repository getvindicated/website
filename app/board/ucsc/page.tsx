import type { Metadata } from "next";
import { ChapterPage } from "@/components/board/ChapterPage";

export const metadata: Metadata = { title: "VINdicated at UCSC" };

export default function UcscBoardPage() {
  return <ChapterPage chapter="ucsc" />;
}
