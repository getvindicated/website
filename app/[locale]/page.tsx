import type { Metadata } from "next";
import Link from "next/link";
import { Rich } from "@/components/sections/shared/Rich";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SHARE_IMAGE } from "@/lib/i18n/metadata";
import { SOCIAL_URLS } from "@/lib/social";
import {
  localizedPathnames,
  localizeHref,
  type Locale,
} from "@/lib/i18n/config";
import "../minimal.css";

const CHAPTERS = ["ucla", "berkeley", "ucsc"];
const FOLLOW = [
  SOCIAL_URLS.linkedin,
  SOCIAL_URLS.instagramUcla,
  SOCIAL_URLS.instagramBerkeley,
  SOCIAL_URLS.instagramUcsc,
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const title = dict.home.meta.title;
  const description = dict.home.meta.description;

  return {
    title,
    description,
    alternates: {
      canonical: localizeHref(locale as Locale, "/"),
      languages: localizedPathnames("/"),
    },
    openGraph: {
      title,
      description,
      url: localizeHref(locale as Locale, "/"),
      type: "website",
      locale,
      images: [SHARE_IMAGE],
    },
    twitter: {
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const home = dict.homePage;
  const href = (h: string) => localizeHref(locale as Locale, h);
  const { hero, ppi, publicKnowledge, footing, chapters, follow, pillars, free } = home;
  const [inspection, fraud] = pillars.items;

  return (
    <div className="rd rd-page mn">
      <div className="mn-col">
        <h1>
          {hero.titleLead} {hero.phrases[0]}
        </h1>
        <p className="mn-lead">{hero.body}</p>
        <div className="mn-links">
          <Link className="mn-btn" href={href("/inspection")}>
            {hero.ctaPrimary}
          </Link>
          <Link href={href("/about#story")}>{hero.ctaSecondary}</Link>
        </div>

        <h2 id="ppi">{ppi.title}</h2>
        <p>
          <Rich text={ppi.body} />
        </p>
        {ppi.items.map((item) => (
          <div key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
        <div className="mn-links">
          <Link href={href("/inspection")}>{ppi.primary}</Link>
          <Link href={href("/inspection#where")}>{ppi.secondary}</Link>
        </div>

        <h2>{publicKnowledge.title}</h2>
        <p>
          <Rich text={publicKnowledge.body} />
        </p>
        <p>
          <Link href={href("/fraud")}>{publicKnowledge.cta}</Link>
        </p>

        <h2>{footing.title}</h2>
        <p>{footing.body}</p>
        <blockquote>
          <p>{footing.quote}</p>
          <p className="mn-meta">{footing.quoteCite}</p>
        </blockquote>
        {footing.rows.map((row) => (
          <div key={row.stat}>
            <h3>
              {row.stat}: {row.title}
            </h3>
            <p>{row.body}</p>
            <p className="mn-meta">{row.cite}</p>
          </div>
        ))}

        <h2 id="chapters-home">{chapters.title}</h2>
        <p>{chapters.body}</p>
        {chapters.items.map((item, i) => (
          <div key={item.tag}>
            <h3>
              {item.tag}: {item.title}
            </h3>
            <p>{item.body}</p>
            <p>
              <Link href={`${href("/join")}?chapter=${CHAPTERS[i]}#apply`}>{item.cta}</Link>
            </p>
          </div>
        ))}

        <h2 id="social">{follow.title}</h2>
        <p>{follow.body}</p>
        <ul>
          {FOLLOW.map((url, i) => (
            <li key={url}>
              {follow.links[i].platform}:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {follow.links[i].handle}
              </a>
            </li>
          ))}
        </ul>

        <h2>{pillars.title}</h2>
        <p>{pillars.body}</p>
        <h3>
          <Link href={href("/inspection")}>{inspection.title}</Link>
        </h3>
        <p>{inspection.body}</p>
        <h3>
          <Link href={href("/fraud")}>{fraud.title}</Link>
        </h3>
        <p>{fraud.body}</p>

        <h2 id="free">{free.title}</h2>
        <p>{free.body}</p>
        <h3>
          {free.planTitle}: {free.price}
        </h3>
        <ul>
          {free.checks.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        {free.offers.map((o) => (
          <div key={o.title}>
            <h3>{o.title}</h3>
            <p>{o.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
