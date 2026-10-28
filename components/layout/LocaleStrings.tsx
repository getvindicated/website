"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { NotFoundDict } from "@/lib/i18n/dictionary";

// Strings the [locale] layout hands to client pieces that can't receive
// props, like not-found.tsx.
type Strings = { locale: Locale; notFound: NotFoundDict };

const Ctx = createContext<Strings | null>(null);

export function LocaleStrings({ value, children }: { value: Strings; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLocaleStrings = () => useContext(Ctx);
