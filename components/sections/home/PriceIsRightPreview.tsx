"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";

// Illustrative numbers until the real pricing pipeline is live.
const OPTIONS = [12400, 15900, 19800];
const FAIR = 15900;

export function PriceIsRightPreview({
  dict,
  locale,
  gameHref,
}: {
  dict: HomePageDict["preview"];
  locale: string;
  gameHref: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const verdict =
    picked === null
      ? null
      : picked === FAIR
        ? dict.right
        : picked > FAIR
          ? dict.over.replace("{amount}", money(picked - FAIR))
          : dict.low;

  return (
    <section id="pir-preview">
      <div className="wrap pv">
        <div>
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
          <Link className="btn btn-line" href={gameHref}>
            {dict.cta}
          </Link>
        </div>
        <div className="pv-card">
          <div className="pv-photo">
            <Image
              src="/images/cars/2018-honda-civic.webp"
              alt={dict.carAlt}
              width={618}
              height={462}
              sizes="(max-width: 900px) 80vw, 400px"
            />
          </div>
          <h3>{dict.carName}</h3>
          <ul className="pir-tags">
            {dict.carTags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="pv-q" id="pv-q">
            {dict.question}
          </p>
          <div className="pv-opts" role="group" aria-labelledby="pv-q">
            {OPTIONS.map((v) => {
              const state =
                picked === null
                  ? undefined
                  : v === FAIR
                    ? "right"
                    : v === picked
                      ? "wrong"
                      : undefined;
              return (
                <button
                  key={v}
                  type="button"
                  className={state}
                  disabled={picked !== null}
                  aria-pressed={picked === v}
                  onClick={() => setPicked(v)}
                >
                  {money(v)}
                </button>
              );
            })}
          </div>
          <div className={`pv-out${verdict ? " in" : ""}`} aria-live="polite">
            {verdict && (
              <>
                <b>{verdict}</b> {dict.breakdown}{" "}
                <Link href={gameHref}>{dict.playAll}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
