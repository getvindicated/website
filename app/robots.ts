import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getvindicated.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The private board hub (behind Cloudflare Access).
      disallow: ["/board", "/api/board/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
