import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/sections/shared/PageHero";
import { CtaBand } from "@/components/sections/shared/CtaBand";
import { ScrollTour, type TourRect } from "@/components/sections/shared/ScrollTour";
import { FlagsChatTour } from "@/components/sections/fraud/FlagsChatTour";
import { YoyoScene } from "@/components/sections/fraud/YoyoScene";
import { FourSquare } from "@/components/sections/fraud/FourSquare";
import { FeeReceipt } from "@/components/sections/fraud/FeeReceipt";
import { AprCalculator } from "@/components/sections/fraud/AprCalculator";
import { FlipCards } from "@/components/sections/fraud/FlipCards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { caveat } from "@/lib/fonts";

// Pink slip boxes, as fractions of public/pink-slip.png. `danger` boxes
// get a red tag. Same order as fraudPage.pinkSlip.items.
const SLIP: (TourRect & { danger: boolean })[] = [
  { x: 0.27, y: 0.04, w: 0.44, h: 0.05, danger: false },
  { x: 0.08, y: 0.25, w: 0.48, h: 0.13, danger: false },
  { x: 0.61, y: 0.065, w: 0.34, h: 0.05, danger: true },
  { x: 0.08, y: 0.125, w: 0.47, h: 0.05, danger: false },
  { x: 0.08, y: 0.47, w: 0.88, h: 0.07, danger: true },
  { x: 0.08, y: 0.56, w: 0.88, h: 0.1, danger: true },
];

type LawCard = { tag: string; title: string; body: string; say: string };
function Law({ card, className }: { card: LawCard; className?: string }) {
  return (
    <div className={`card${className ? ` ${className}` : ""}`}>
      <span className="tag">{card.tag}</span>
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      <div className="say">{card.say}</div>
    </div>
  );
}

export default async function FraudPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).fraudPage;
  const href = (h: string) => localizeHref(locale as Locale, h);

  return (
    <div className={`rd rd-page ${caveat.variable}`}>
      <PageHero title={d.hero.title} body={d.hero.body}>
        <div className="ctas">
          <Link className="btn btn-solid" href="#flags">
            {d.hero.ctaPrimary}
          </Link>
          <Link className="btn btn-line" href="#law">
            {d.hero.ctaSecondary}
          </Link>
        </div>
      </PageHero>

      <section className="pt0" id="pinkslip">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.pinkSlip.title}</h2>
            <p className="lede">{d.pinkSlip.body}</p>
          </div>
          <ScrollTour
            className="tour-doc"
            zoom={1.9}
            image={{ src: "/pink-slip.png", alt: d.pinkSlip.imageAlt, width: 1040, height: 1212 }}
            rects={SLIP}
            intro={d.pinkSlip.intro}
            countIntro={d.tour.countIntro}
            countStep={d.tour.countStep}
            cards={d.pinkSlip.items.map((h, i) => (
              <Fragment key={h.label}>
                <span className={`tag ${SLIP[i].danger ? "sev-red" : "sev-know"}`}>{h.label}</span>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
                <div className="say">{h.say}</div>
              </Fragment>
            ))}
          />
        </div>
      </section>

      <section className="band" id="flags">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.flags.title}</h2>
            <p className="lede">{d.flags.body}</p>
          </div>
          <FlagsChatTour dict={d.flags} />
        </div>
      </section>

      <YoyoScene dict={d.yoyo} />

      <section className="band" id="foursquare">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.fourSquare.title}</h2>
            <p className="lede">{d.fourSquare.body}</p>
          </div>
          <FourSquare dict={d.fourSquare} locale={locale} />
        </div>
      </section>

      <section id="receipt">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.receipt.title}</h2>
            <p className="lede">{d.receipt.body}</p>
          </div>
          <FeeReceipt dict={d.receipt} locale={locale} />
        </div>
      </section>

      <section className="band" id="apr">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.apr.title}</h2>
            <p className="lede">{d.apr.body}</p>
          </div>
          <AprCalculator dict={d.apr} locale={locale} />
        </div>
      </section>

      <section id="law">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.law.title}</h2>
            <p className="lede">{d.law.body}</p>
          </div>
          <h3 className="law-h">{d.law.federalTitle}</h3>
          <div className="grid2 law">
            {d.law.federal.map((c) => (
              <Law key={c.tag} card={c} />
            ))}
          </div>
          <div className="law">
            <Law card={d.law.holder} className="mt24" />
          </div>
          <h3 className="law-h">{d.law.californiaTitle}</h3>
          <div className="alert law-notice" role="note">
            <b>{d.law.californiaNotice.title}</b>
            {d.law.californiaNotice.body}{" "}
            <a
              className="inline-link"
              href="https://calmatters.org/politics/2025/12/california-new-law-buying-cars/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {d.law.californiaNotice.link}
            </a>
          </div>
          <div className="grid2 law">
            {d.law.california.map((c) => (
              <Law key={c.tag} card={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{d.after.title}</h2>
            <p className="lede">{d.after.body}</p>
          </div>
          <FlipCards items={d.after.items} />
        </div>
      </section>

      <section className="pt0 brochure-section" id="brochure">
        <div className="wrap">
          <div className="bro">
            <div className="bro-cover">
              <Image
                src="/images/brochure/cover.webp"
                alt={d.brochure.coverAlt}
                width={600}
                height={1405}
                sizes="(max-width: 760px) 80vw, 300px"
              />
            </div>
            <div>
              <span className="tag">{d.brochure.tag}</span>
              <h2 className="h2">{d.brochure.title}</h2>
              <p className="lede">{d.brochure.body}</p>
              <div className="bro-soon">
                <span className="dot-live" aria-hidden="true" />
                {d.brochure.soon}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title={d.cta.title}
        body={d.cta.body}
        primary={{ label: d.cta.primary, href: href("/documents") }}
        secondary={{ label: d.cta.secondary, href: href("/inspection") }}
        art={
          <svg viewBox="0 0 260 260" aria-hidden="true">
            <circle cx="130" cy="130" r="120" fill="rgba(255,255,255,.12)" />
            <path d="M130 50l70 30v50c0 45-30 75-70 90-40-15-70-45-70-90V80z" fill="#fff" />
            <path d="M100 135l22 22 40-44" fill="none" stroke="#9533A5" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
    </div>
  );
}
