import type { MetadataRoute } from "next";
import { locales, localizedPathnames, localizeHref } from "@/lib/i18n/config";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://getvindicated.org";

const routes = [
  { href: "/", changeFrequency: "monthly", priority: 1 },
  { href: "/about", changeFrequency: "monthly", priority: 0.8 },
  { href: "/inspection", changeFrequency: "monthly", priority: 0.8 },
  { href: "/fraud", changeFrequency: "monthly", priority: 0.8 },
  { href: "/documents", changeFrequency: "monthly", priority: 0.8 },
  { href: "/rights", changeFrequency: "monthly", priority: 0.7 },
  { href: "/team", changeFrequency: "monthly", priority: 0.6 },
  { href: "/volunteer", changeFrequency: "monthly", priority: 0.6 },
  { href: "/contact", changeFrequency: "yearly", priority: 0.5 },
] as const;

function absolute(pathname: string) {
  return new URL(pathname, BASE_URL).toString();
}

function absoluteAlternates(href: string) {
  return Object.fromEntries(
    Object.entries(localizedPathnames(href)).map(([locale, pathname]) => [
      locale,
      absolute(pathname),
    ]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: absolute(localizeHref(locale, route.href)),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: absoluteAlternates(route.href),
      },
    })),
  );
}
