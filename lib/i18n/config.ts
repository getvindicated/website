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
