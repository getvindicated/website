import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale, locales } from "@/lib/i18n/config";

function detectLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim());

  for (const lang of preferred) {
    if (isValidLocale(lang)) return lang;
    const base = lang.split("-")[0];
    const match = locales.find((locale) => locale.split("-")[0] === base);
    if (match) return match;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (isValidLocale(maybeLocale)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const targetPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const newUrl = new URL(targetPath, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
