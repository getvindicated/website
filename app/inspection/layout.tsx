import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspection Guide",
  description:
    "A step-by-step guide to inspecting a used car before you buy. Know what to look for under the hood, on the lot, and in the paperwork.",
  openGraph: {
    title: "Inspection Guide",
    description:
      "A step-by-step guide to inspecting a used car before you buy. Know what to look for under the hood, on the lot, and in the paperwork.",
    url: "/inspection",
    type: "website",
    images: [{ url: "/illus-woman-dealership.png", alt: "VINdicated — Inspection Guide" }],
  },
  twitter: {
    title: "Inspection Guide",
    description:
      "A step-by-step guide to inspecting a used car before you buy. Know what to look for under the hood, on the lot, and in the paperwork.",
  },
};

export default function InspectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
