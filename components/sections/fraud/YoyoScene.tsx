"use client";

import { useEffect, useRef, useState } from "react";
import type { FraudPageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

type Dict = FraudPageDict["yoyo"];

const X0 = 210;
const X1 = 880;
const Y = 324;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Scroll-driven: the car drives home, the phone rings, and the dealer
// reels it back in on a string.
export function YoyoScene({ dict }: { dict: Dict }) {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const stringRef = useRef<SVGPathElement>(null);
  const phoneRef = useRef<SVGGElement>(null);
  const [caption, setCaption] = useState(0);
  const [bad, setBad] = useState(false);
  const [day, setDay] = useState<number | null>(1);

  useEffect(() => {
    const sec = sectionRef.current;
    const car = carRef.current;
    const str = stringRef.current;
    const phone = phoneRef.current;
    if (!sec || !car || !str || !phone) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = sec.getBoundingClientRect();
      const p = reduce ? 1 : clamp(-r.top / (r.height - window.innerHeight), 0, 1);
      let x: number;
      if (p < 0.28) x = X0 + (X1 - X0) * ease(p / 0.28);
      else if (p < 0.5) x = X1;
      else if (p < 0.72) x = X1 - (X1 - X0) * ease((p - 0.5) / 0.22);
      else x = X0;
      const wob = p > 0.5 && p < 0.75 ? Math.sin((p - 0.5) * 60) * 3 : 0;
      car.setAttribute("transform", `translate(${x},${Y + wob})`);
      const ringing = p > 0.4 && p < 0.62;
      phone.setAttribute("opacity", ringing ? "1" : "0");
      phone.classList.toggle("ring", ringing);
      str.setAttribute("opacity", p > 0.45 && p < 0.8 ? "1" : "0");
      const sag = p < 0.5 ? 40 : 10;
      str.setAttribute("d", `M310 300 Q ${(310 + x - 88) / 2} ${300 + sag} ${x - 88} ${Y - 6}`);
      setDay(p < 0.72 ? (p < 0.28 ? 1 : p < 0.5 ? Math.round(1 + ((p - 0.28) / 0.22) * 8) : 9) : null);
      setBad(p >= 0.7);
      setCaption(p < 0.28 ? 0 : p < 0.42 ? 1 : p < 0.62 ? 2 : p < 0.82 ? 3 : 4);
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

  const contract = bad ? dict.badContract : dict.okContract;
  const cap = dict.captions[caption];
  const font = "Plus Jakarta Sans,sans-serif";

  return (
    <section id="yoyo" className="yoyo" ref={sectionRef} aria-label={dict.label}>
      <div className="yoyo-sticky">
        <div className="wrap">
          <div className="center">
            <h2 className="h2">{dict.title}</h2>
            <p className="lede">{dict.body}</p>
          </div>
          <div className="yoyo-stage">
            <svg viewBox="0 0 1200 380" className="yoyo-svg" role="img" aria-label={dict.svgLabel}>
              <ellipse cx="600" cy="352" rx="580" ry="12" fill="#ecd6f0" />
              <rect x="40" y="338" width="1120" height="14" rx="7" fill="#2a0f31" />
              <path d="M60 345H1140" stroke="#fff" strokeWidth="3" strokeDasharray="22 18" opacity=".7" />
              <g>
                <rect x="60" y="170" width="250" height="168" rx="10" fill="#fff" stroke="#2a0f31" strokeWidth="4" />
                <rect x="50" y="140" width="270" height="44" rx="10" fill="#9533A5" />
                <text x="185" y="170" textAnchor="middle" fontFamily={font} fontWeight="800" fontSize="22" fill="#fff" letterSpacing="2">
                  {dict.dealership}
                </text>
                <rect x="86" y="206" width="90" height="70" rx="6" fill="#ecd6f0" />
                <rect x="196" y="206" width="90" height="70" rx="6" fill="#ecd6f0" />
                <rect x="150" y="286" width="70" height="52" rx="4" fill="#2a0f31" />
                <circle cx="310" cy="300" r="7" fill="#2a0f31" />
              </g>
              <g>
                <path d="M900 220l110-80 110 80v118H900z" fill="#fff" stroke="#2a0f31" strokeWidth="4" strokeLinejoin="round" />
                <path d="M884 228l126-96 126 96" fill="none" stroke="#9533A5" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="990" y="270" width="40" height="68" rx="4" fill="#2a0f31" />
                <rect x="925" y="240" width="44" height="40" rx="4" fill="#ecd6f0" />
                <rect x="1050" y="240" width="44" height="40" rx="4" fill="#ecd6f0" />
                <text x="1010" y="372" textAnchor="middle" fontFamily={font} fontWeight="800" fontSize="18" fill="#2a0f31">
                  {dict.home}
                </text>
              </g>
              <path ref={stringRef} d="" fill="none" stroke="#b3261e" strokeWidth="4" strokeLinecap="round" opacity="0" />
              <g ref={carRef}>
                <path d="M-90 -6c0-12 6-19 17-21l28-6 22-22c5-5 11-7 19-7h48c8 0 14 2 19 7l19 21 25 4c10 2 15 9 15 18v8c0 3-3 6-6 6H-84c-3 0-6-3-6-6z" fill="#9533A5" />
                <path d="M-40 -33l18-18c3-3 7-4 12-4h16v22z" fill="#fff" />
                <path d="M12 -55h16c5 0 9 1 12 4l17 18H12z" fill="#fff" />
                <circle cx="-50" cy="12" r="15" fill="#2a0f31" />
                <circle cx="-50" cy="12" r="6" fill="#ecd6f0" />
                <circle cx="50" cy="12" r="15" fill="#2a0f31" />
                <circle cx="50" cy="12" r="6" fill="#ecd6f0" />
              </g>
              <g id="yyPhone" ref={phoneRef} opacity="0">
                <rect x="1080" y="60" width="64" height="112" rx="12" fill="#2a0f31" />
                <rect x="1086" y="72" width="52" height="86" rx="6" fill="#fbe1df" />
                <text x="1112" y="124" textAnchor="middle" fontFamily={font} fontWeight="800" fontSize="34" fill="#b3261e">
                  !
                </text>
                <path d="M1060 80c-8 10-8 30 0 40M1164 80c8 10 8 30 0 40" stroke="#b3261e" strokeWidth="4" fill="none" strokeLinecap="round" />
              </g>
            </svg>
            <div className="yy-day" aria-hidden="true">
              {day === null ? dict.back : dict.day.replace("{n}", String(day))}
            </div>
            <div className={`yy-contract ${bad ? "bad" : "ok"}`} aria-hidden="true">
              <span>{contract.label}</span>
              <b>{contract.rate}</b>
              <em>{contract.pay}</em>
            </div>
          </div>
          <Caption key={caption} tag={cap.tag} text={cap.text} />
        </div>
      </div>
      <ol className="sr-only">
        {dict.captions.map((c) => (
          <li key={c.tag}>
            {c.tag}: {c.text}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Caption({ tag, text }: { tag: string; text: string }) {
  return (
    <div className="yy-caption in" aria-hidden="true">
      <span className="tag">{tag}</span>
      <p>{text}</p>
    </div>
  );
}
