import type { Metadata } from "next";
import "../globals.css";
import { Lora, Figtree } from "next/font/google";
import { notFound } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { locales, isValidLocale, isRtl, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
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

// Pre-render all 10 locale routes at build time
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
      default: "VINdicated | Educate. Empower. Vindicate.",
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
      default: "VINdicated | Educate. Empower. Vindicate.",
      template: "%s | VINdicated",
    },
    description:
      "VINdicated is a nonprofit built on the belief that car knowledge should be public knowledge. We break down the systems that allow consumer discrimination to thrive.",
    images: ["/illus-woman-dealership.png"],
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <html
      lang={locale}
      dir={isRtl(locale as Locale) ? "rtl" : "ltr"}
      className={`${lora.variable} ${figtree.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* <CarCursor /> */}
        <Nav locale={locale as Locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale as Locale} dict={dict} />
      </body>
    </html>
  );
}
