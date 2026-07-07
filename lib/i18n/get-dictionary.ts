// lib/i18n/get-dictionary.ts
import "server-only";
import type { Locale } from "./config";
import type { SiteDictionary } from "./dictionary";

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

type DictionaryFile = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDictionary<T>(base: T, override: unknown): T {
  if (override === undefined) return base;

  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    return base.map((item, index) =>
      mergeDictionary(item, override[index]),
    ) as T;
  }

  if (isRecord(base) && isRecord(override)) {
    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      merged[key] = mergeDictionary(merged[key], value);
    }
    return merged as T;
  }

  return override as T;
}

export async function getDictionary(locale: Locale): Promise<SiteDictionary> {
  const base = (await dictionaries.en()) as SiteDictionary;
  if (locale === "en") return base;

  const loader = dictionaries[locale] ?? dictionaries.en;
  const override = (await loader()) as DictionaryFile;
  return mergeDictionary(base, override);
}
