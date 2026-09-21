// lib/i18n/config.ts
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

export const locales: Locale[] = [
  "en",
  "es",
  "zh-Hans",
  "tl",
  "vi",
  "ko",
  "fa",
  "hy",
  "hi",
  "ar-EG"
];

export const defaultLocale: Locale = "en";

// When true, the default locale (English) always renders the hardcoded
// copy baked into pages/components and ignores dictionaries/en.json
// entirely -- only non-English locales read from the dict. Flip to false
// to have English read from the dict like every other locale.
export const ENGLISH_BYPASSES_DICT = true;

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

// Gates a dict slice behind ENGLISH_BYPASSES_DICT: for English it returns
// undefined (so callers' `dict?.foo ?? "hardcoded"` fallbacks kick in),
// for every other locale it passes the dict slice through unchanged.
export function localeDict<T>(
  locale: string,
  dict: T | undefined,
): T | undefined {
  if (ENGLISH_BYPASSES_DICT && locale === defaultLocale) return undefined;
  return dict;
}

// Prefixes an internal href with the current locale (e.g. "/about" ->
// "/en/about", "/" -> "/en"). External links (http/https/mailto) pass
// through unchanged.
export function localizeHref(locale: Locale, href: string): string {
  if (/^(https?:)?\/\//.test(href) || href.startsWith("mailto:")) return href;
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

export function localizedPathnames(href: string): Record<string, string> {
  const entries = locales.map((locale) => [locale, localizeHref(locale, href)]);
  return Object.fromEntries([
    ...entries,
    ["x-default", localizeHref(defaultLocale, href)],
  ]);
}
