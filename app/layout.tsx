import type { Metadata } from "next";
import "./globals.css";
import { Lora, Figtree } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
// import { CarCursor } from "@/components/ui/CarCursor";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://getvindicated.org"
  ),
  title: {
    default: "VINdicated | Educate. Empower. Vindicate.",
    template: "%s | VINdicated",
  },
  description:
    "VINdicated is a nonprofit built on the belief that car knowledge should be public knowledge. We break down the systems that allow consumer discrimination to thrive.",
  openGraph: {
    type: "website",
    siteName: "VINdicated",
    title: {
      default: "VINdicated — Educate. Empower. Vindicate.",
      template: "%s | VINdicated",
    },
    description:
      "VINdicated is a nonprofit built on the belief that car knowledge should be public knowledge. We break down the systems that allow consumer discrimination to thrive.",
    url: "/",
    images: [
      {
        url: "/illus-woman-dealership.png",
        alt: "VINdicated",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "VINdicated — Educate. Empower. Vindicate.",
      template: "%s | VINdicated",
    },
    description:
      "VINdicated is a nonprofit built on the belief that car knowledge should be public knowledge. We break down the systems that allow consumer discrimination to thrive.",
    images: ["/illus-woman-dealership.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${figtree.variable}`}>
      <body className="min-h-screen antialiased">
        {/* <CarCursor /> */}
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
