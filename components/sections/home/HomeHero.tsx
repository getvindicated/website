"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

// Typewriter timing for the purple phrase, in milliseconds.
const TYPE_MS = 70;
const HOLD_MS = 1600;
const ERASE_MS = 35;
const PAUSE_MS = 300;

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
  // Start with the first phrase fully typed, so the server render and the
  // first paint already show a complete heading.
  const [text, setText] = useState(phrases[0] ?? "");
  // True while letters are being typed or erased; the caret stops blinking.
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (reduce || phrases.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    let length = phrases[0].length;
    let mode: "type" | "hold" | "erase" = "hold";

    const tick = () => {
      const phrase = phrases[index];
      if (mode === "hold") {
        mode = "erase";
        setBusy(true);
        timer = setTimeout(tick, ERASE_MS);
      } else if (mode === "erase") {
        length -= 1;
        setText(phrase.slice(0, length));
        if (length > 0) {
          timer = setTimeout(tick, ERASE_MS);
        } else {
          setBusy(false);
          index = (index + 1) % phrases.length;
          mode = "type";
          timer = setTimeout(tick, PAUSE_MS);
        }
      } else {
        setBusy(true);
        length += 1;
        setText(phrase.slice(0, length));
        if (length < phrase.length) {
          timer = setTimeout(tick, TYPE_MS);
        } else {
          setBusy(false);
          mode = "hold";
          timer = setTimeout(tick, HOLD_MS);
        }
      }
    };

    setText(phrases[0]);
    setBusy(false);
    timer = setTimeout(tick, HOLD_MS);
    return () => clearTimeout(timer);
  }, [reduce, phrases]);

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1>
            {dict.titleLead}{" "}
            {/* Screen readers get one stable heading; the typed words are visual only. */}
            <span className="sr-only">{dict.phrases[0]}</span>
            <span className="rotator" aria-hidden="true">
              {/* Invisible copies of every phrase share the same grid cell,
                  so the line keeps the height of the tallest one and the
                  page never jumps while typing. */}
              {phrases.map((p) => (
                <span key={p} className="rotator-ghost">
                  {p}
                  <span className="caret" />
                </span>
              ))}
              {reduce ? (
                <span>{phrases[0]}</span>
              ) : (
                <span>
                  {text}
                  <span className={`caret${busy ? " solid" : ""}`} />
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
        </figure>
      </div>
    </section>
  );
}
