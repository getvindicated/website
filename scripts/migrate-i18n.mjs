// scripts/migrate-i18n.mjs
//
// One-time structural migration: moves every page route under a
// dynamic [locale] segment, and installs the i18n scaffold (config,
// middleware, dictionary loader, language switcher, dictionaries).
//
// Run once via the "i18n: migrate structure" GitHub Action. Safe to
// re-run — it checks before moving/creating anything.

import { existsSync, mkdirSync, renameSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const APP = path.join(ROOT, "app");
const LOCALE_DIR = path.join(APP, "[locale]");

// Route folders to move under [locale]. Everything else in app/
// (actions/, favicon.ico, globals.css, not-found.tsx, robots.ts,
// sitemap.ts) stays at the root on purpose — those are either
// special Next.js files or shared, non-page resources.
const ROUTE_FOLDERS = [
  "about",
  "contact",
  "documents",
  "fraud",
  "inspection",
  "research",
  "rights",
  "team",
  "volunteer",
];

const LOCALES = ["en", "es", "zh-Hans", "tl", "vi", "ko", "fa", "hy", "hi", "ar-EG"];

function log(msg) {
  console.log(`[i18n-migrate] ${msg}`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    log(`created directory ${path.relative(ROOT, dir)}`);
  }
}

// ── Step 1: create app/[locale] and move route folders + page.tsx ──
ensureDir(LOCALE_DIR);

for (const folder of ROUTE_FOLDERS) {
  const src = path.join(APP, folder);
  const dest = path.join(LOCALE_DIR, folder);
  if (existsSync(src) && !existsSync(dest)) {
    renameSync(src, dest);
    log(`moved app/${folder} -> app/[locale]/${folder}`);
  } else if (existsSync(dest)) {
    log(`skip app/${folder}: already moved`);
  } else {
    log(`skip app/${folder}: not found (may already be renamed)`);
  }
}

// Root page.tsx (the homepage) moves under [locale] too
{
  const src = path.join(APP, "page.tsx");
  const dest = path.join(LOCALE_DIR, "page.tsx");
  if (existsSync(src) && !existsSync(dest)) {
    renameSync(src, dest);
    log("moved app/page.tsx -> app/[locale]/page.tsx");
  }
}

// The existing layout.tsx becomes the locale-aware layout. We move
// it as-is; a human pass is still needed to add the lang/dir
// attributes and dictionary wiring, since we can't safely rewrite
// content we haven't reviewed.
{
  const src = path.join(APP, "layout.tsx");
  const dest = path.join(LOCALE_DIR, "layout.tsx");
  if (existsSync(src) && !existsSync(dest)) {
    renameSync(src, dest);
    log("moved app/layout.tsx -> app/[locale]/layout.tsx (needs manual lang/dir pass)");
  }
}

// Next.js requires *some* root layout to exist. Create a minimal
// passthrough one if it doesn't exist yet.
{
  const rootLayout = path.join(APP, "layout.tsx");
  if (!existsSync(rootLayout)) {
    writeFileSync(
      rootLayout,
      `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
`,
    );
    log("created minimal passthrough app/layout.tsx");
  }
}

// generateStaticParams so Next.js pre-renders all 10 locale routes
{
  const localeLayout = path.join(LOCALE_DIR, "layout.tsx");
  if (existsSync(localeLayout)) {
    log(
      "NOTE: app/[locale]/layout.tsx was moved but NOT auto-edited. " +
        "A human pass is required to add generateStaticParams(), the " +
        "lang/dir <html> attributes, and params.locale handling.",
    );
  }
}

// ── Step 2: scaffold lib/i18n/ ──
const I18N_DIR = path.join(ROOT, "lib", "i18n");
const DICT_DIR = path.join(I18N_DIR, "dictionaries");
ensureDir(DICT_DIR);

const configContent = `// lib/i18n/config.ts
export type Locale =
  | "en"
  | "es"
  | "zh-Hans"
  | "tl"
  | "vi"
  | "ko"
  | "fa"
  | "hy"
  | "hi"
  | "ar-EG";

export const locales: Locale[] = ${JSON.stringify(LOCALES, null, 2)};

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  "zh-Hans": "简体中文",
  tl: "Tagalog",
  vi: "Tiếng Việt",
  ko: "한국어",
  fa: "فارسی",
  hy: "Հայերեն",
  hi: "हिन्दी",
  "ar-EG": "العربية المصرية",
};

export const rtlLocales: Locale[] = ["fa", "ar-EG"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
`;

const configPath = path.join(I18N_DIR, "config.ts");
if (!existsSync(configPath)) {
  writeFileSync(configPath, configContent);
  log("created lib/i18n/config.ts");
}

const getDictContent = `// lib/i18n/get-dictionary.ts
import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  "zh-Hans": () => import("./dictionaries/zh-Hans.json").then((m) => m.default),
  tl: () => import("./dictionaries/tl.json").then((m) => m.default),
  vi: () => import("./dictionaries/vi.json").then((m) => m.default),
  ko: () => import("./dictionaries/ko.json").then((m) => m.default),
  fa: () => import("./dictionaries/fa.json").then((m) => m.default),
  hy: () => import("./dictionaries/hy.json").then((m) => m.default),
  hi: () => import("./dictionaries/hi.json").then((m) => m.default),
  "ar-EG": () => import("./dictionaries/ar-EG.json").then((m) => m.default),
} as const;

export async function getDictionary(locale: Locale) {
  const loader = dictionaries[locale] ?? dictionaries.en;
  return loader();
}
`;

const getDictPath = path.join(I18N_DIR, "get-dictionary.ts");
if (!existsSync(getDictPath)) {
  writeFileSync(getDictPath, getDictContent);
  log("created lib/i18n/get-dictionary.ts");
}

// Dictionaries: nav + footer strings, translated for real (carried
// over from earlier prep). Pages beyond nav/footer still need their
// own translation pass — this scaffold doesn't invent page copy.
const DICTIONARIES = {
  "en.json": {
    nav: { home: "Home", about: "About Us", inspection: "Inspection Guide", fraud: "Fraud Prevention", documents: "Documents Decoded", research: "Research", contact: "Contact" },
    footer: { tagline: "Educate. Empower. Vindicate.", subtagline: "Free automotive education for women, immigrants, and first-time buyers.", copyright: "© 2026 VINdicated. All rights reserved. Founded by Rana Darwich.", mission: "A nonprofit committed to gender equity in automotive commerce." },
  },
  "es.json": {
    nav: { home: "Inicio", about: "Sobre Nosotros", inspection: "Guía de Inspección", fraud: "Prevención de Fraude", documents: "Documentos Descifrados", research: "Investigación", contact: "Contacto" },
    footer: { tagline: "Educar. Empoderar. Reivindicar.", subtagline: "Educación automotriz gratuita para mujeres, inmigrantes y compradores primerizos.", copyright: "© 2026 VINdicated. Todos los derechos reservados. Fundado por Rana Darwich.", mission: "Una organización sin fines de lucro comprometida con la equidad de género en el comercio automotriz." },
  },
  "zh-Hans.json": {
    nav: { home: "首页", about: "关于我们", inspection: "检验指南", fraud: "防范欺诈", documents: "文件解读", research: "研究", contact: "联系我们" },
    footer: { tagline: "教育。赋能。维权。", subtagline: "为女性、移民和首次购车者提供免费的汽车知识教育。", copyright: "© 2026 VINdicated。保留所有权利。由 Rana Darwich 创立。", mission: "一家致力于促进汽车商务性别平等的非营利组织。" },
  },
  "tl.json": {
    nav: { home: "Home", about: "Tungkol Sa Amin", inspection: "Gabay sa Inspeksyon", fraud: "Pag-iwas sa Panloloko", documents: "Mga Dokumentong Ipinaliwanag", research: "Pananaliksik", contact: "Makipag-ugnayan" },
    footer: { tagline: "Turuan. Bigyang-kapangyarihan. Ipagtanggol.", subtagline: "Libreng edukasyon tungkol sa sasakyan para sa mga kababaihan, imigrante, at mga unang beses na bumibili.", copyright: "© 2026 VINdicated. Nakalaan ang lahat ng karapatan. Itinatag ni Rana Darwich.", mission: "Isang nonprofit na nakatuon sa pagkakapantay-pantay ng kasarian sa kalakalang pang-awto." },
  },
  "vi.json": {
    nav: { home: "Trang Chủ", about: "Về Chúng Tôi", inspection: "Hướng Dẫn Kiểm Tra", fraud: "Phòng Chống Gian Lận", documents: "Giải Mã Tài Liệu", research: "Nghiên Cứu", contact: "Liên Hệ" },
    footer: { tagline: "Giáo Dục. Trao Quyền. Minh Oan.", subtagline: "Giáo dục miễn phí về ô tô dành cho phụ nữ, người nhập cư và người mua xe lần đầu.", copyright: "© 2026 VINdicated. Bảo lưu mọi quyền. Sáng lập bởi Rana Darwich.", mission: "Một tổ chức phi lợi nhuận cam kết vì bình đẳng giới trong thương mại ô tô." },
  },
  "ko.json": {
    nav: { home: "홈", about: "소개", inspection: "검사 가이드", fraud: "사기 예방", documents: "문서 해설", research: "연구", contact: "문의하기" },
    footer: { tagline: "교육. 역량 강화. 정당한 권리 수호.", subtagline: "여성, 이민자, 그리고 첫 자동차 구매자를 위한 무료 자동차 교육입니다.", copyright: "© 2026 VINdicated. 모든 권리 보유. Rana Darwich 설립.", mission: "자동차 상거래의 성평등을 위해 힘쓰는 비영리 단체입니다." },
  },
  "fa.json": {
    dir: "rtl",
    nav: { home: "خانه", about: "درباره ما", inspection: "راهنمای بازرسی", fraud: "پیشگیری از کلاهبرداری", documents: "رمزگشایی اسناد", research: "پژوهش", contact: "تماس با ما" },
    footer: { tagline: "آموزش. توانمندسازی. احقاق حق.", subtagline: "آموزش رایگان خودرو برای زنان، مهاجران و خریداران بار اول.", copyright: "© ۲۰۲۶ VINdicated. تمامی حقوق محفوظ است. بنیان‌گذار: رعنا درویش.", mission: "یک سازمان غیرانتفاعی متعهد به برابری جنسیتی در تجارت خودرو." },
  },
  "hy.json": {
    nav: { home: "Գլխավոր", about: "Մեր Մասին", inspection: "Ստուգման Ուղեցույց", fraud: "Խարդախության Կանխարգելում", documents: "Փաստաթղթերի Վերծանում", research: "Հետազոտություն", contact: "Կապ" },
    footer: { tagline: "Կրթել. Հզորացնել. Պաշտպանել.", subtagline: "Անվճար ավտոմեքենայի կրթություն կանանց, միգրանտների և առաջին անգամ գնորդների համար։", copyright: "© 2026 VINdicated: Բոլոր իրավունքները պաշտպանված են: Հիմնադրվել է Ռանա Դարվիշի կողմից:", mission: "Ոչ առևտրային կազմակերպություն, նվիրված ավտոառևտրում գենդերային հավասարությանը:" },
  },
  "hi.json": {
    nav: { home: "होम", about: "हमारे बारे में", inspection: "निरीक्षण गाइड", fraud: "धोखाधड़ी से बचाव", documents: "दस्तावेज़ों की व्याख्या", research: "शोध", contact: "संपर्क करें" },
    footer: { tagline: "शिक्षित करें। सशक्त बनाएं। न्याय दिलाएं।", subtagline: "महिलाओं, प्रवासियों और पहली बार कार खरीदने वालों के लिए मुफ़्त ऑटोमोटिव शिक्षा।", copyright: "© 2026 VINdicated. सर्वाधिकार सुरक्षित। संस्थापक: राणा दरविश।", mission: "ऑटोमोटिव व्यापार में लैंगिक समानता के लिए प्रतिबद्ध एक गैर-लाभकारी संस्था।" },
  },
  "ar-EG.json": {
    dir: "rtl",
    nav: { home: "الرئيسية", about: "عننا", inspection: "دليل الفحص", fraud: "الوقاية من النصب", documents: "شرح المستندات", research: "أبحاث", contact: "تواصل معنا" },
    footer: { tagline: "نتعلّم. نتمكّن. ننصف حقنا.", subtagline: "تثقيف مجاني عن السيارات للستات والمهاجرين وأول مرة بيشتروا عربية.", copyright: "© 2026 VINdicated. جميع الحقوق محفوظة. أسستها رنا درويش.", mission: "منظمة غير هادفة للربح ملتزمة بالمساواة بين الجنسين في تجارة السيارات." },
  },
};

for (const [filename, content] of Object.entries(DICTIONARIES)) {
  const p = path.join(DICT_DIR, filename);
  if (!existsSync(p)) {
    writeFileSync(p, JSON.stringify(content, null, 2) + "\n");
    log(`created lib/i18n/dictionaries/${filename}`);
  }
}

// ── Step 3: middleware.ts at project root ──
const middlewareContent = `// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isValidLocale } from "@/lib/i18n/config";

function detectLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const preferred = acceptLanguage.split(",").map((part) => part.split(";")[0].trim());

  for (const lang of preferred) {
    if (isValidLocale(lang)) return lang;
    const base = lang.split("-")[0];
    const match = locales.find((l) => l.split("-")[0] === base);
    if (match) return match;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (isValidLocale(maybeLocale)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const newUrl = new URL(\`/\${locale}\${pathname}\`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\\\..*).*)"],
};
`;

const middlewarePath = path.join(ROOT, "middleware.ts");
if (!existsSync(middlewarePath)) {
  writeFileSync(middlewarePath, middlewareContent);
  log("created middleware.ts");
}

// ── Step 4: LanguageSwitcher component ──
const switcherDir = path.join(ROOT, "components", "layout");
ensureDir(switcherDir);
const switcherPath = path.join(switcherDir, "LanguageSwitcher.tsx");
const switcherContent = `"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchTo(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[0.85rem] font-semibold px-3 py-2 rounded-lg transition-colors duration-150"
        style={{
          color: "#fff",
          border: "1px solid var(--color-border)",
          background: open ? "rgba(149,51,165,0.14)" : "transparent",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {localeLabels[currentLocale]}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50 min-w-[160px]"
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
          role="listbox"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchTo(locale)}
              className="w-full text-left px-4 py-2.5 text-[0.9rem] transition-colors duration-150"
              style={{
                color: "#fff",
                background: locale === currentLocale ? "rgba(149,51,165,0.16)" : "transparent",
                fontWeight: locale === currentLocale ? 700 : 400,
              }}
              role="option"
              aria-selected={locale === currentLocale}
            >
              {localeLabels[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
`;

if (!existsSync(switcherPath)) {
  writeFileSync(switcherPath, switcherContent);
  log("created components/layout/LanguageSwitcher.tsx");
}

log("Migration complete.");
log("REMAINING MANUAL STEPS (a human/Claude pass, on purpose — content-sensitive):");
log("  1. Edit app/[locale]/layout.tsx: add generateStaticParams(), <html lang=/dir=>, params.locale");
log("  2. Wire Nav.tsx / Footer.tsx to read labels from the dictionary instead of lib/constants.ts");
log("  3. Add <LanguageSwitcher /> into Nav.tsx");
log("  4. Translate each page's actual body copy (inspection, fraud, documents, etc.) beyond nav/footer");
