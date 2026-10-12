import type { Metadata } from "next";
import { ChapterPage } from "@/components/board/ChapterPage";

export const metadata: Metadata = { title: "VINdicated at UCLA" };

export default function UclaBoardPage() {
  return <ChapterPage chapter="ucla" />;
}
