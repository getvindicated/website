"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

// Typewriter timings (ms).
const TYPE_MS = 70;
const ERASE_MS = 35;
const HOLD_MS = 1600;
const GAP_MS = 300;

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
  const phrases = dict.phrases;
  // Start with the first phrase fully shown so the heading is never blank.
  const [text, setText] = useState(phrases[0] ?? "");
  const [busy, setBusy] = useState(false);

  // Hold the phrase, erase it, then type the next one.
  useEffect(() => {
    if (reduce || phrases.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    let n = phrases[0].length;
    let erasing = true;
    const tick = () => {
      const phrase = phrases[i];
      if (!erasing) {
        n += 1;
        setText(phrase.slice(0, n));
        if (n < phrase.length) {
          setBusy(true);
          timer = setTimeout(tick, TYPE_MS);
        } else {
          setBusy(false);
          erasing = true;
          timer = setTimeout(tick, HOLD_MS);
        }
      } else {
        n -= 1;
        setBusy(true);
        setText(phrase.slice(0, n));
        if (n > 0) {
          timer = setTimeout(tick, ERASE_MS);
        } else {
          erasing = false;
          i = (i + 1) % phrases.length;
          setBusy(false);
          timer = setTimeout(tick, GAP_MS);
        }
      }
    };
    timer = setTimeout(tick, HOLD_MS);
    return () => clearTimeout(timer);
  }, [reduce, phrases]);

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1>
            {dict.titleLead}{" "}
            {/* Screen readers get one stable heading; the rotating words are visual only. */}
            <span className="sr-only">{dict.phrases[0]}</span>
            <span className="rotator" aria-hidden="true">
              {/* Every phrase, invisible and stacked, so the box is always as
                  tall as the longest one and the page never jumps. */}
              <span className="rot-sizer">
                {phrases.map((p) => (
                  <span key={p}>{p}</span>
                ))}
              </span>
              {reduce ? (
                <span className="rot-text">{phrases[0]}</span>
              ) : (
                <span className="rot-text">
                  {text}
                  <i className={`rot-caret${busy ? " busy" : ""}`} />
                </span>
              )}
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
          <HeroCard className="hp-c1" tone="ok" card={dict.cards[0]} />
          <HeroCard className="hp-c2" tone="bad" card={dict.cards[1]} />
          <HeroCard className="hp-c3" tone="pur" card={dict.cards[2]} />
        </figure>
      </div>
    </section>
  );
}

function HeroCard({
  className,
  tone,
  card,
}: {
  className: string;
  tone: "ok" | "bad" | "pur";
  card: { title: string; body: string };
}) {
  return (
    <div className={`hp-card ${className}`}>
      <span className={`hp-ic ${tone}`} aria-hidden="true">
        {tone === "bad" ? (
          "!"
        ) : (
          <svg
            width={tone === "ok" ? 16 : 14}
            height={tone === "ok" ? 16 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5 9-10" />
          </svg>
        )}
      </span>
      <span>
        <b>{card.title}</b>
        <em>{card.body}</em>
      </span>
    </div>
  );
}
