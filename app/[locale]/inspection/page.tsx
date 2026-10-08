import Link from "next/link";
import { PageHero } from "@/components/sections/shared/PageHero";
import { Rich } from "@/components/sections/shared/Rich";
import { QuoteBand } from "@/components/sections/about/QuoteBand";
import { EngineInspector } from "@/components/sections/inspection/EngineInspector";
import { PpiSteps } from "@/components/sections/inspection/PpiSteps";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const DEALERS = [
  ["Toyota", "https://www.toyota.com/dealers/"],
  ["Honda", "https://automobiles.honda.com/tools/dealer-locator"],
  ["Ford", "https://ford.com/dealerships"],
  ["Nissan", "https://nissanusa.com/dealer-locator.html"],
  ["Chevrolet", "https://chevrolet.com/dealer-locator"],
  ["Hyundai", "https://hyundaiusa.com/us/en/dealer-locator"],
  ["Mazda", "https://mazdausa.com/shopping-tools/dealer-locator"],
  ["Volkswagen", "https://vw.com/find-a-dealer"],
] as const;

export default async function InspectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).inspectionPage;

  return (
    <div className="rd rd-page">
      <PageHero title={d.hero.title} body={d.hero.body}>
        <div className="ctas">
          <Link className="btn btn-solid" href="#schedule">
            {d.hero.ctaPrimary}
          </Link>
          <Link className="btn btn-line" href="#where">
            {d.hero.ctaSecondary}
          </Link>
        </div>
      </PageHero>

      <section className="pt0">
        <div className="wrap">
          <h2 className="h2">{d.what.title}</h2>
          <p className="lede mt18">
            <Rich text={d.what.body} />
          </p>
          <h3 className="mt48 h3-sm">{d.what.notTitle}</h3>
          <div className="notlist">
            {d.what.nots.map((n) => (
              <div className="card" key={n.title}>
                <b>{n.title}</b>
                {n.body}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="engine">
        <div className="wrap">
          <div className="intro">
            <h2 className="h2">{d.engine.title}</h2>
            <p className="lede">{d.engine.body}</p>
          </div>
          <EngineInspector dict={d.engine} />
        </div>
      </section>

      <section id="where">
        <div className="wrap">
          <div className="intro">
            <h2 className="h2">{d.where.title}</h2>
          </div>
          <div className="grid2 where mt48">
            {d.where.cards.map((c, i) => (
              <div className="card" key={c.title}>
                {i === 1 && <p className="label">{d.where.recommended}</p>}
                <h3>{c.title}</h3>
                {c.paras.map((p, k) => (
                  <p key={k}>
                    <Rich text={p} />
                  </p>
                ))}
              </div>
            ))}
          </div>
          <h3 className="mt56 dealers-title">{d.where.dealersTitle}</h3>
          <p className="lede dealers-body">{d.where.dealersBody}</p>
          <div className="brands">
            {DEALERS.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2">{d.checks.title}</h2>
          <p className="lede mt18">{d.checks.body}</p>
          <div className="acc">
            {d.checks.items.map((item, i) => (
              <details key={item.title} open={i === 0}>
                <summary>{item.title}</summary>
                <div className="body">
                  {item.intro}
                  <ul>
                    {item.points.map((pt, k) => (
                      <li key={k}>
                        <Rich text={pt} />
                      </li>
                    ))}
                  </ul>
                  {item.outro.length > 0 && (
                    <p className="acc-outro">
                      <Rich text={item.outro} />
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <QuoteBand text={d.quote.text} cite={d.quote.cite} />

      <PpiSteps dict={d.schedule} />
    </div>
  );
}
