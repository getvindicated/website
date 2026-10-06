import { PageHero } from "@/components/sections/shared/PageHero";
import { MapGate } from "@/components/sections/map/MapGate";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { bitter } from "@/lib/fonts";

// The satellite map is a standalone Leaflet page in public/vindimap (from
// the redesign handoff). It's embedded here after the visitor accepts the
// short disclaimer, and can also be opened full screen.
const MAP_SRC = "/vindimap/index.html";

// Same order as mapPage.news.items.
const NEWS = [
  { url: "https://www.thedrive.com/features/ai-car-dealer-scams-are-infesting-facebook-marketplace-and-theyre-working", img: "ai-dealer-scams" },
  { url: "https://consumer.ftc.gov/consumer-alerts/2026/09/scammers-are-spoofing-car-dealership-websites-what-you-need-know", img: "spoofed-dealer-sites" },
  { url: "https://www.hinshawlaw.com/en/insights/blogs/consumer-crossroads-where-financial-services-and-litigation-intersect/federal-and-state-regulators-continue-crackdown-on-junk-fees-with-dollar4-million-auto-dealer-settlement", img: "junk-fee-settlement" },
  { url: "https://pirg.org/articles/car-dealerships-nationwide-warned-to-stop-junk-fees-other-deceptive-tactics/", img: "dealer-warning-letters" },
  { url: "https://calmatters.org/politics/2025/12/california-new-law-buying-cars/", img: "california-sb-766" },
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
    <div className={`rd rd-page ${bitter.variable}`}>
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
      <section className="band" id="news">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.news.title}</h2>
            <p className="lede">{d.news.body}</p>
          </div>
          <div className="nw-grid">
            {d.news.items.map((n, i) => (
              <a key={n.title} className="nw" href={NEWS[i].url} target="_blank" rel="noopener noreferrer">
                <div className="nw-img">
                  {/* Decorative illustration; plain <img> keeps the SVG crisp. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/news/${NEWS[i].img}.svg`} alt="" loading="lazy" />
                  <span className="nw-credit">{d.news.credit}</span>
                </div>
                <div className="nw-body">
                  <span className="nw-kicker">{n.kicker}</span>
                  <h3>{n.title}</h3>
                  <p className="nw-by">{n.byline}</p>
                  <p className="nw-dek">{n.dek}</p>
                  <div className="nw-take">
                    <b>{n.takeLabel}</b>
                    {n.take}
                  </div>
                  <span className="nw-go">{n.cta}</span>
                </div>
              </a>
            ))}
          </div>
          <p className="ai-src news-note">{d.news.footnote}</p>
        </div>
      </section>
    </div>
  );
}
