"use client";

import { useEffect, useRef, useState } from "react";
import type { InspectionPageDict } from "@/lib/i18n/dictionary";
import { Rich } from "../shared/Rich";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

type Dict = InspectionPageDict["schedule"];

const ROAD =
  "M20 190 C 180 190, 220 70, 400 70 S 620 200, 800 190 S 1020 70, 1180 80";

// A car drives along a winding road as you scroll, stopping at each step.
export function PpiDrive({ dict }: { dict: Dict }) {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const [stopPoints, setStopPoints] = useState<{ x: number; y: number }[]>([]);
  const [step, setStep] = useState(-1);
  const [pop, setPop] = useState(false);
  const count = dict.stops.length;

  useEffect(() => {
    const path = pathRef.current;
    const section = sectionRef.current;
    const car = carRef.current;
    if (!path || !section || !car) return;
    const L = path.getTotalLength();
    const marks = dict.stops.map((_, i) => 0.08 + i * (0.84 / (count - 1)));
    setStopPoints(
      marks.map((m) => {
        const p = path.getPointAtLength(m * L);
        return { x: p.x, y: p.y };
      }),
    );

    let ticking = false;
    const update = () => {
      ticking = false;
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = reduce ? 1 : Math.min(1, Math.max(0, -r.top / total));
      const t = Math.min(0.999, p);
      const a = path.getPointAtLength(t * L);
      const b = path.getPointAtLength(Math.min(L, t * L + 2));
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      car.setAttribute("transform", `translate(${a.x},${a.y}) rotate(${ang})`);
      let i = -1;
      marks.forEach((m, k) => {
        if (t >= m - 0.02) i = k;
      });
      setStep(i);
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
  }, [reduce, count, dict.stops]);

  // Replay the pop-in each time the car reaches a new stop.
  useEffect(() => {
    if (step < 0) return;
    setPop(false);
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setPop(true)));
    return () => cancelAnimationFrame(r);
  }, [step]);

  const stop = step >= 0 ? dict.stops[step] : null;

  return (
    <section id="schedule" className="drive" ref={sectionRef} aria-label={dict.label}>
      <div className="drive-sticky">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{dict.title}</h2>
            <p className="lede">{dict.body}</p>
          </div>
          <div className="drive-stage">
            <svg className="drive-road" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
              <path ref={pathRef} d={ROAD} fill="none" stroke="#2a0f31" strokeWidth="44" strokeLinecap="round" />
              <path d={ROAD} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="18 16" strokeLinecap="round" opacity=".85" />
              <g>
                {stopPoints.map((p, i) => (
                  <g key={i} className={`dstop${i <= step ? " on" : ""}`} transform={`translate(${p.x},${p.y})`}>
                    <circle r="20" fill="#fff" stroke="#9533A5" strokeWidth="5" />
                    <text y="7" textAnchor="middle" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="20" fill="#9533A5">
                      {i + 1}
                    </text>
                  </g>
                ))}
              </g>
              <g ref={carRef}>
                <rect x="-26" y="-13" width="52" height="26" rx="10" fill="#9533A5" />
                <rect x="-4" y="-10" width="16" height="20" rx="4" fill="#ecd6f0" />
                <rect x="-22" y="-16" width="12" height="6" rx="3" fill="#2a0f31" />
                <rect x="10" y="-16" width="12" height="6" rx="3" fill="#2a0f31" />
                <rect x="-22" y="10" width="12" height="6" rx="3" fill="#2a0f31" />
                <rect x="10" y="10" width="12" height="6" rx="3" fill="#2a0f31" />
                <circle cx="26" cy="-7" r="3" fill="#ffe08a" />
                <circle cx="26" cy="7" r="3" fill="#ffe08a" />
              </g>
            </svg>
            <div className={`drive-card${stop ? ` pop${pop ? " in" : ""}` : ""}`} aria-hidden="true">
              {stop ? (
                <>
                  <span className="tag">
                    {dict.stop.replace("{n}", String(step + 1)).replace("{total}", String(count))}
                  </span>
                  <h3>{stop.title}</h3>
                  <p>{stop.body}</p>
                </>
              ) : (
                <>
                  <span className="tag">{dict.introTag}</span>
                  <h3>{dict.introTitle}</h3>
                  <p>{dict.introBody}</p>
                </>
              )}
            </div>
          </div>
          <div className="alert drive-alert">
            <b>{dict.alertTitle}</b>
            <Rich text={dict.alert} />
          </div>
        </div>
      </div>
      {/* The steps as a plain list for screen readers and no-JS readers. */}
      <ol className="sr-only">
        {dict.stops.map((s) => (
          <li key={s.title}>
            {s.title} {s.body}
          </li>
        ))}
      </ol>
    </section>
  );
}
