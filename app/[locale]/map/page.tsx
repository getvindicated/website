import { PageHero } from "@/components/sections/shared/PageHero";
import { MapGate } from "@/components/sections/map/MapGate";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";

// The satellite map is a standalone Leaflet page in public/vindimap (from
// the redesign handoff). It's embedded here after the visitor accepts the
// short disclaimer, and can also be opened full screen.
const MAP_SRC = "/vindimap/index.html";

// Same order as mapPage.news.items.
const NEWS = [
  "https://www.thedrive.com/features/ai-car-dealer-scams-are-infesting-facebook-marketplace-and-theyre-working",
  "https://consumer.ftc.gov/consumer-alerts/2026/09/scammers-are-spoofing-car-dealership-websites-what-you-need-know",
  "https://www.hinshawlaw.com/en/insights/blogs/consumer-crossroads-where-financial-services-and-litigation-intersect/federal-and-state-regulators-continue-crackdown-on-junk-fees-with-dollar4-million-auto-dealer-settlement",
  "https://pirg.org/articles/car-dealerships-nationwide-warned-to-stop-junk-fees-other-deceptive-tactics/",
  "https://calmatters.org/politics/2025/12/california-new-law-buying-cars/",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "map", "/map");
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).mapPage;

  return (
    <div className="rd rd-page">
      <PageHero title={d.hero.title} body={d.hero.body} />
      <section className="pt0">
        <div className="wrap">
          <MapGate
            dict={d.gate}
            mapSrc={MAP_SRC}
            methodsHref={localizeHref(locale as Locale, "/map/methods")}
          />
        </div>
      </section>
      <section id="news">
        <div className="wrap prose">
          <h2 className="h2">{d.news.title}</h2>
          <p className="lede">{d.news.body}</p>
          <ul className="news-list">
            {d.news.items.map((n, i) => (
              <li key={n.title}>
                <h3>
                  <a href={NEWS[i]} target="_blank" rel="noopener noreferrer">
                    {n.title}
                  </a>
                </h3>
                <p className="news-by">{n.byline}</p>
                <p>{n.dek}</p>
                <p>
                  <b>{n.takeLabel}:</b> {n.take}
                </p>
              </li>
            ))}
          </ul>
          <p className="ai-src">{d.news.footnote}</p>
        </div>
      </section>
    </div>
  );
}
