import "server-only";
import type { Metadata } from "next";
import {
  defaultLocale,
  isValidLocale,
  localizedPathnames,
  localizeHref,
  type Locale,
} from "./config";
import { getDictionary } from "./get-dictionary";
import type { RouteMetadataKey } from "./dictionary";

// The picture link previews show (iMessage, Slack, social posts) for every
// page: 1200x630, the standard Open Graph size.
export const SHARE_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Automotive Literacy with VINdicated",
};


function safeLocale(value: string): Locale {
  return isValidLocale(value) ? value : defaultLocale;
}

export async function getRootMetadata(localeParam: string): Promise<Metadata> {
  const locale = safeLocale(localeParam);
  const dict = await getDictionary(locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://getvindicated.org",
    ),
    title: {
      default: dict.meta.defaultTitle,
      template: "%s | VINdicated",
    },
    description: dict.meta.defaultDescription,
    alternates: {
      canonical: localizeHref(locale, "/"),
      languages: localizedPathnames("/"),
    },
    openGraph: {
      type: "website",
      siteName: "VINdicated",
      title: {
        default: dict.meta.defaultTitle,
        template: "%s | VINdicated",
      },
      description: dict.meta.defaultDescription,
      url: localizeHref(locale, "/"),
      locale,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: {
        default: dict.meta.defaultTitle,
        template: "%s | VINdicated",
      },
      description: dict.meta.defaultDescription,
      images: [SHARE_IMAGE.url],
    },
  };
}

export async function getRouteMetadata(
  localeParam: string,
  route: RouteMetadataKey,
  href: string,
): Promise<Metadata> {
  const locale = safeLocale(localeParam);
  const dict = await getDictionary(locale);
  const routeMeta = dict.meta.routes[route];
  const title = routeMeta.title;
  const description = routeMeta.description;

  return {
    title,
    description,
    alternates: {
      canonical: localizeHref(locale, href),
      languages: localizedPathnames(href),
    },
    openGraph: {
      title,
      description,
      url: localizeHref(locale, href),
      type: "website",
      locale,
      images: [SHARE_IMAGE],
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [SHARE_IMAGE.url],
    },
  };
}
