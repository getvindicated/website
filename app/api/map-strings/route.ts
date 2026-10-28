import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/lib/i18n/config";

// The Dealer Risk Map (public/vindimap, a standalone page) reads its labels
// from here, in the visitor's language: mapPage.app in the dictionaries.
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("lang") ?? "en";
  const locale = (isValidLocale(raw) ? raw : "en") as Locale;
  const strings = (await getDictionary(locale)).mapPage.app;
  return Response.json(strings, { headers: { "cache-control": "public, max-age=3600" } });
}
