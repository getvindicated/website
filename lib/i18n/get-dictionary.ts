// lib/i18n/get-dictionary.ts
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
