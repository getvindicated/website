import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fraud Prevention",
  description:
    "Learn to recognize and counter common dealer scams. Know the red flags, your legal rights under California and federal law, and what to do if you've been scammed.",
  openGraph: {
    title: "Fraud Prevention",
    description:
      "Learn to recognize and counter common dealer scams. Know the red flags, your legal rights under California and federal law, and what to do if you've been scammed.",
    url: "/fraud",
    type: "website",
    images: [{ url: "/illus-woman-dealership.png", alt: "VINdicated — Fraud Prevention" }],
  },
  twitter: {
    title: "Fraud Prevention",
    description:
      "Learn to recognize and counter common dealer scams. Know the red flags, your legal rights under California and federal law, and what to do if you've been scammed.",
  },
};

export default function FraudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
