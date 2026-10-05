"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

const ROTATE_MS = 2600;
const FADE_MS = 350;

export function HomeHero({
  dict,
  ppiHref,
  storyHref,
}: {
  dict: HomePageDict["hero"];
  ppiHref: string;
  storyHref: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);
  const count = dict.phrases.length;

  useEffect(() => {
    if (reduce || count < 2) return;
    let fade: ReturnType<typeof setTimeout>;
    const tick = setInterval(() => {
      setOut(true);
      fade = setTimeout(() => {
        setIndex((i) => (i + 1) % count);
        setOut(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(fade);
    };
  }, [reduce, count]);

  const shown = reduce ? 0 : index;

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1>
            {dict.titleLead}{" "}
            {/* Screen readers get one stable heading; the rotating words are visual only. */}
            <span className="sr-only">{dict.phrases[0]}</span>
            <span className="rotator" aria-hidden="true">
              <span className={out ? "out" : undefined}>
                {dict.phrases[shown]}
              </span>
            </span>
          </h1>
          <p>{dict.body}</p>
          <div className="ctas">
            <Link className="btn btn-solid" href={ppiHref}>
              {dict.ctaPrimary}
            </Link>
            <Link className="btn btn-line" href={storyHref}>
              {dict.ctaSecondary}
            </Link>
          </div>
        </div>
        <figure className="hero-photo">
          <Image
            src="/images/home/hero-berkeley-team.webp"
            alt={dict.photoAlt}
            width={1600}
            height={1287}
            sizes="(max-width: 960px) calc(100vw - 40px), 600px"
            preload
          />
          <figcaption>{dict.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
