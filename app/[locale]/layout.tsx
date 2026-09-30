import "../globals.css";
import "../redesign.css";
import "../redesign-overrides.css";
import Script from "next/script";
import { Lora, Figtree, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Starfield } from "@/components/ui/Starfield";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { locales, isValidLocale, isRtl, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRootMetadata } from "@/lib/i18n/metadata";
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

// Redesign typeface (see app/redesign.css).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Pre-render all 10 locale routes at build time
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRootMetadata(locale);
}

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
      className={`${lora.variable} ${figtree.variable} ${jakarta.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Script
          src="https://u.ops.rizwaan.dev/ping.js"
          data-website-id="83e986f5-6c1d-4501-85cb-df41e10839ef"
          strategy="afterInteractive"
        />
        <Script
          src="https://u.ops.rizwaan.dev/recorder.js"
          data-website-id="83e986f5-6c1d-4501-85cb-df41e10839ef"
          strategy="afterInteractive"
        />
  {/* <Starfield /> */}
  {/* <CarCursor /> */}
  <SiteHeader locale={locale as Locale} dict={dict} />
  <main>{children}</main>
  <SiteFooter locale={locale as Locale} dict={dict} />
</body>
    </html>
  );
}
