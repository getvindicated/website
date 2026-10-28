import "../globals.css";
import "../redesign.css";
import "../redesign-overrides.css";
import Script from "next/script";
import {
  Lora,
  Figtree,
  Plus_Jakarta_Sans,
  Noto_Sans_SC,
  Noto_Sans_KR,
  Noto_Sans_Devanagari,
  Noto_Sans_Armenian,
  Vazirmatn,
  Noto_Sans_Arabic,
} from "next/font/google";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Starfield } from "@/components/ui/Starfield";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LocaleStrings } from "@/components/layout/LocaleStrings";
import { locales, isValidLocale, isRtl, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRootMetadata } from "@/lib/i18n/metadata";
import { eventsPublic } from "@/lib/events/flag";
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

// Fonts for scripts the Latin fonts don't cover. Each sets --font-script,
// which the CSS font stacks fall back to; only the current language's
// font is attached, and none are preloaded, so other pages don't pay for
// them. (Font loader options must be literals, so each repeats them.)
const notoSC = Noto_Sans_SC({
  variable: "--font-script",
  display: "swap",
  preload: false,
  weight: ["400", "500", "700", "800"],
});
const notoKR = Noto_Sans_KR({
  variable: "--font-script",
  display: "swap",
  preload: false,
  weight: ["400", "500", "700", "800"],
});
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-script",
  display: "swap",
  preload: false,
  subsets: ["devanagari"],
});
const notoArmenian = Noto_Sans_Armenian({
  variable: "--font-script",
  display: "swap",
  preload: false,
  subsets: ["armenian"],
});
const vazirmatn = Vazirmatn({
  variable: "--font-script",
  display: "swap",
  preload: false,
  subsets: ["arabic"],
});
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-script",
  display: "swap",
  preload: false,
  subsets: ["arabic"],
});

const SCRIPT_FONTS: Partial<Record<Locale, string>> = {
  "zh-Hans": notoSC.variable,
  ko: notoKR.variable,
  hi: notoDevanagari.variable,
  hy: notoArmenian.variable,
  fa: vazirmatn.variable,
  "ar-EG": notoArabic.variable,
};

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
      className={`${lora.variable} ${figtree.variable} ${jakarta.variable} ${SCRIPT_FONTS[locale as Locale] ?? ""}`}
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
        <SiteHeader
          locale={locale as Locale}
          dict={{ nav: dict.nav, ui: dict.ui }}
          showEvents={eventsPublic()}
        />
        <main>
          <LocaleStrings
            value={{ locale: locale as Locale, notFound: dict.notFound }}
          >
            {children}
          </LocaleStrings>
        </main>
        <SiteFooter locale={locale as Locale} dict={dict} />
      </body>
    </html>
  );
}
