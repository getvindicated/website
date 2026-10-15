"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { AboutPageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

const PHOTOS = [
  { src: "/images/about/img_4424_2.webp", position: "center 70%" },
  { src: "/images/about/berkeley-tabling-1.webp", position: "center 45%" },
  { src: "/images/about/berkeley-tabling-2.webp", position: "center 40%" },
  { src: "/images/about/img_8120.webp", position: "center 55%" },
  { src: "/images/about/img_4422_2.webp", position: "center 72%" },
  { src: "/images/about/img_8112.webp", position: "center 50%" },
  { src: "/images/about/img_8126.webp", position: "center 50%" },
  { src: "/images/about/img_4423_2.webp", position: "center 70%" },
  { src: "/images/about/img_8103.webp", position: "center 45%" },
  { src: "/images/about/img_8130.webp", position: "center 50%" },
];

const INTERVAL_MS = 3200;
const pad = (n: number) => String(n).padStart(2, "0");

// A photo frame that grows to full-bleed as you scroll through it, while
// the photos cross-fade on a timer.
export function ZoomSlideshow({ dict }: { dict: AboutPageDict["zoom"] }) {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const paused = userPaused || reduce;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % PHOTOS.length),
      INTERVAL_MS,
    );
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;
    if (reduce) {
      frame.style.removeProperty("--p");
      return;
    }
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (total * 0.7)));
      frame.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [reduce]);

  return (
    <section className="zoom" ref={sectionRef} aria-label={dict.label}>
      <div className="zoom-sticky">
        <div className="zoom-frame" ref={frameRef}>
          <div className="zoom-imgs">
            {PHOTOS.map((p, i) => (
              <Image
                key={p.src}
                src={p.src}
                alt={dict.alts[i]}
                fill
                sizes="100vw"
                preload={i === 0}
                className={i === index ? "on" : undefined}
                style={{ objectPosition: p.position }}
              />
            ))}
          </div>
          <div className="zoom-shade" />
          <div className="zoom-copy">
            <h2>
              {dict.titleLine1}
              <br />
              {dict.titleLine2}
            </h2>
            <p>{dict.body}</p>
          </div>
          <div className="zoom-ctrl">
            <span className="zoom-count" aria-hidden="true">
              {pad(index + 1)} / {pad(PHOTOS.length)}
            </span>
            <button
              type="button"
              aria-label={paused ? dict.play : dict.pause}
              aria-pressed={paused}
              onClick={() => setUserPaused((v) => !v)}
            >
              {paused ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
