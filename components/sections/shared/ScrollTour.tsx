"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

// Area of the document to spotlight, as fractions of the image.
export type TourRect = { x: number; y: number; w: number; h: number };

type TourImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// A sticky visual beside a column of step cards. As each card scrolls
// past the middle of the screen it becomes the active step, and (with an
// image) the visual zooms to spotlight that step's rect.
export function ScrollTour({
  className,
  image,
  rects,
  zoom: maxZoom = 1.8,
  visual,
  cards,
  intro,
  countIntro,
  countStep,
  onStep,
}: {
  className?: string;
  image?: TourImage;
  rects?: TourRect[];
  zoom?: number;
  // A custom sticky visual used instead of an image (e.g. the chat phone).
  visual?: ReactNode;
  cards: ReactNode[];
  intro: string;
  // "{total} stops" and "{n} / {total}".
  countIntro?: string;
  countStep?: string;
  onStep?: (i: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(-1);
  const total = cards.length;
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  // Zoom the image onto the current rect.
  useEffect(() => {
    onStepRef.current?.(current);
    const place = () => {
      const frame = frameRef.current;
      const zoom = zoomRef.current;
      const spot = spotRef.current;
      if (!frame || !zoom || !spot || !rects) return;
      if (current < 0) {
        zoom.style.transform = "translate(0,0) scale(1)";
        spot.classList.remove("show");
        return;
      }
      const W = zoom.offsetWidth;
      const H = zoom.offsetHeight;
      const FW = frame.clientWidth;
      const FH = frame.clientHeight;
      const r = rects[current];
      const pad = 0.012;
      const z = Math.min(maxZoom, (0.8 * FW) / (r.w * W), (0.8 * FH) / (r.h * H));
      const cx = (r.x + r.w / 2) * W;
      const cy = (r.y + r.h / 2) * H;
      const tx = Math.min(0, Math.max(FW - W * z, FW / 2 - cx * z));
      const ty = Math.min(0, Math.max(FH - H * z, FH / 2 - cy * z));
      zoom.style.transform = `translate(${tx}px,${ty}px) scale(${z})`;
      Object.assign(spot.style, {
        left: `${(r.x - pad) * W}px`,
        top: `${(r.y - pad) * H}px`,
        width: `${(r.w + 2 * pad) * W}px`,
        height: `${(r.h + 2 * pad) * H}px`,
        borderRadius: "10px",
      });
      spot.classList.add("show");
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [current, rects, maxZoom]);

  // Pick the step whose card is nearest the reading line.
  useEffect(() => {
    let ticking = false;
    const pick = () => {
      ticking = false;
      const root = rootRef.current;
      const steps = stepsRef.current;
      const vis = visualRef.current;
      if (!root || !steps || !vis) return;
      const rr = root.getBoundingClientRect();
      if (rr.bottom < 0 || rr.top > window.innerHeight) return;
      const vb = window.matchMedia("(max-width: 900px)").matches
        ? vis.getBoundingClientRect().bottom
        : 0;
      const line = vb + (window.innerHeight - vb) * 0.5;
      let best = -1;
      let bestD = Infinity;
      steps.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => {
        const c = el.querySelector(".tour-card, .tour-intro p") ?? el;
        const r = c.getBoundingClientRect();
        const d = line < r.top ? r.top - line : line > r.bottom ? line - r.bottom : 0;
        if (d <= bestD) {
          bestD = d;
          best = Number(el.dataset.i);
        }
      });
      setCurrent(best);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(pick);
      }
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const count =
    current < 0
      ? countIntro?.replace("{total}", String(total))
      : countStep?.replace("{n}", String(current + 1)).replace("{total}", String(total));

  return (
    <div className={`tour${className ? ` ${className}` : ""}`} ref={rootRef}>
      <div className="tour-visual" ref={visualRef}>
        {image ? (
          <div
            className="tour-frame"
            ref={frameRef}
            style={{ aspectRatio: `${image.width}/${image.height}` }}
          >
            <div className="tour-zoom" ref={zoomRef}>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 900px) 90vw, 600px"
                draggable={false}
              />
              <div className="spot" ref={spotRef} />
            </div>
            <div className="tour-hud" aria-hidden="true">
              <span className="tour-count">{count}</span>
              <div className="tour-dots">
                {cards.map((_, i) => (
                  <i key={i} className={i === current ? "on" : undefined} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          visual
        )}
      </div>
      <div className="tour-steps" ref={stepsRef}>
        <div className="tour-step tour-intro" data-i={-1}>
          <p>{intro}</p>
          <span className="tour-arrow" aria-hidden="true">
            ↓
          </span>
        </div>
        {cards.map((card, i) => (
          <article key={i} className={`tour-step${i === current ? " on" : ""}`} data-i={i}>
            <div className="tour-card">{card}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
