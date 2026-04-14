import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents Decoded",
  description:
    "Interactive guides to understanding car buying documents — the pink slip, Carfax reports, financing contracts, and more. Know what you're signing before you sign it.",
  openGraph: {
    title: "Documents Decoded",
    description:
      "Interactive guides to understanding car buying documents — the pink slip, Carfax reports, financing contracts, and more. Know what you're signing before you sign it.",
    url: "/documents",
    type: "website",
    images: [{ url: "/logo-full.png", alt: "VINdicated — Documents Decoded" }],
  },
  twitter: {
    title: "Documents Decoded",
    description:
      "Interactive guides to understanding car buying documents — the pink slip, Carfax reports, financing contracts, and more. Know what you're signing before you sign it.",
  },
};

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
