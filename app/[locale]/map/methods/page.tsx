import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "mapMethods", "/map/methods");
}

// How the Dealer Risk Map was made: plain, text-first, no animation.
export default async function MapMethodsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).mapMethods;
  const s = d.sections;
  const mapHref = localizeHref(locale as Locale, "/map");

  return (
    <div className="rd rd-page">
      <article className="methods">
        <div className="wrap">
          <Link className="methods-back" href={mapHref}>
            {d.back}
          </Link>
          <h1>{d.title}</h1>
          <p className="methods-intro">{d.intro}</p>

          <section aria-labelledby="m-on-map">
            <h2 id="m-on-map">{s.onMap.title}</h2>
            {s.onMap.paras.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>

          <section aria-labelledby="m-sources">
            <h2 id="m-sources">{s.sources.title}</h2>
            {s.sources.paras.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>

          <section aria-labelledby="m-sorting">
            <h2 id="m-sorting">{s.sorting.title}</h2>
            {s.sorting.paras.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>{s.sorting.rulesIntro}</p>
            <ul>
              {s.sorting.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p>{s.sorting.rulesOutro}</p>
            <p>{s.sorting.catsIntro}</p>
            <ol className="methods-cats">
              {s.sorting.cats.map((c) => (
                <li key={c.title}>
                  <strong>{c.title}.</strong> {c.body}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="m-tiers">
            <h2 id="m-tiers">{s.tiers.title}</h2>
            <dl className="methods-tiers">
              {s.tiers.items.map((t) => (
                <div key={t.name}>
                  <dt>{t.name}</dt>
                  <dd>{t.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="m-shown">
            <h2 id="m-shown">{s.shown.title}</h2>
            <p>{s.shown.intro}</p>
            <ul>
              {s.shown.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="m-limits">
            <h2 id="m-limits">{s.limits.title}</h2>
            <ul>
              {s.limits.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="m-independence">
            <h2 id="m-independence">{s.independence.title}</h2>
            {s.independence.paras.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>

          <section aria-labelledby="m-advice">
            <h2 id="m-advice">{s.advice.title}</h2>
            {s.advice.paras.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>

          <section aria-labelledby="m-corrections">
            <h2 id="m-corrections">{s.corrections.title}</h2>
            <p>
              {s.corrections.before}
              <a href={`mailto:${s.corrections.email}`}>{s.corrections.email}</a>
              {s.corrections.after}
            </p>
          </section>

          <Link className="methods-back methods-back-end" href={mapHref}>
            {d.back}
          </Link>
        </div>
      </article>
    </div>
  );
}
