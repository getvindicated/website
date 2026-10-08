import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/sections/shared/PageHero";
import { ScrollTour, type TourRect } from "@/components/sections/shared/ScrollTour";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { DocumentsPageDict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

type Severity = "easy" | "watch" | "red" | "know";

// Spotlight rects on the Carfax screenshots (fractions of the image) and
// each stop's severity. Same order as documentsPage.page1/page2.items.
const PAGE1: (TourRect & { s: Severity })[] = [
  { x: 0.01, y: 0.2, w: 0.97, h: 0.07, s: "know" },
  { x: 0.19, y: 0.3, w: 0.4, h: 0.13, s: "easy" },
  { x: 0.19, y: 0.43, w: 0.4, h: 0.11, s: "know" },
  { x: 0.62, y: 0.26, w: 0.36, h: 0.32, s: "know" },
  { x: 0.01, y: 0.54, w: 0.97, h: 0.04, s: "red" },
  { x: 0.01, y: 0.63, w: 0.97, h: 0.17, s: "easy" },
];
const PAGE2: (TourRect & { s: Severity })[] = [
  { x: 0.01, y: 0.13, w: 0.97, h: 0.39, s: "easy" },
  { x: 0.01, y: 0.515, w: 0.97, h: 0.175, s: "know" },
  { x: 0.01, y: 0.7, w: 0.97, h: 0.13, s: "know" },
  { x: 0.01, y: 0.785, w: 0.97, h: 0.025, s: "watch" },
  { x: 0.01, y: 0.81, w: 0.97, h: 0.025, s: "watch" },
];
const GUIDE_TAGS: Severity[] = ["red", "watch", "know", "watch", "easy", "know"];

function CarfaxTour({
  d,
  page,
  src,
  rects,
}: {
  d: DocumentsPageDict;
  page: DocumentsPageDict["page1"];
  src: string;
  rects: (TourRect & { s: Severity })[];
}) {
  return (
    <ScrollTour
      className="tour-doc"
      zoom={2}
      image={{ src, alt: page.imageAlt, width: 1275, height: 1650 }}
      rects={rects}
      intro={page.intro}
      countIntro={d.tour.countIntro}
      countStep={d.tour.countStep}
      cards={page.items.map((it, i) => (
        <Fragment key={it.title}>
          <span className={`tag sev-${rects[i].s}`}>
            {i + 1} · {d.severity[rects[i].s]}
          </span>
          <h3>{it.title}</h3>
          <p>{it.body}</p>
          {it.say && <div className="say">{it.say}</div>}
        </Fragment>
      ))}
    />
  );
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).documentsPage;

  return (
    <div className="rd rd-page">
      <PageHero title={d.hero.title} body={d.hero.body}>
        <div className="ctas">
          <Link className="btn btn-solid" href="#report">
            {d.hero.ctaPrimary}
          </Link>
          <Link className="btn btn-line" href="#buyers-guide">
            {d.hero.ctaSecondary}
          </Link>
        </div>
      </PageHero>

      <section className="pt0" id="report">
        <div className="wrap">
          <div className="intro">
            <h2 className="h2">{d.page1.title}</h2>
            <p className="lede">{d.page1.body}</p>
          </div>
          <CarfaxTour d={d} page={d.page1} src="/carfax-p1.png" rects={PAGE1} />
        </div>
      </section>

      <section className="band" id="report2">
        <div className="wrap">
          <div className="intro">
            <h2 className="h2">{d.page2.title}</h2>
            <p className="lede">{d.page2.body}</p>
          </div>
          <CarfaxTour d={d} page={d.page2} src="/carfax-p2.png" rects={PAGE2} />
        </div>
      </section>

      <section id="buyers-guide">
        <div className="wrap">
          <div className="intro">
            <h2 className="h2">{d.guide.title}</h2>
            <p className="lede">{d.guide.body}</p>
          </div>
          <div className="explorer guide-explorer">
            <Image
              className="bg-img"
              src="/buyers-guide-p1.png"
              alt={d.guide.imageAlt}
              width={1530}
              height={1980}
              sizes="(max-width: 960px) 100vw, 450px"
            />
            <div className="acc">
              {d.guide.items.map((it, i) => (
                <details key={it.title}>
                  <summary>
                    <span>
                      <span className={`tag sev-${GUIDE_TAGS[i]}`}>{it.tag}</span>
                      {it.title}
                    </span>
                  </summary>
                  <div className="body">
                    {it.body}
                    <div className="say">{it.say}</div>
                  </div>
                </details>
              ))}
            </div>
          </div>
          <div className="grid3 key3 mt48">
            {d.guide.keys.map((k) => (
              <div className="card" key={k.title}>
                <h4>{k.kicker}</h4>
                <h3>{k.title}</h3>
                <p>{k.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
