"use client";
import { useEffect, useRef } from "react";
import { Button, FadeUp } from "@/components/ui";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { HomeDict } from "@/lib/i18n/home-dict";
// Animation config per stat -- not translatable content, so it lives here
// rather than in the dict. Labels/cites always come from dict.hero.stats.
const statConfig = [
  { id: "stat1", target: 1100, prefix: "$", suffix: "", dur: 1800 },
  { id: "stat2", target: 48, prefix: "", suffix: "%", dur: 1600 },
  { id: "stat3", target: 62.5, prefix: "", suffix: "%", dur: 1400 },
  { id: "stat4", target: 13, prefix: "", suffix: "%", dur: 1500 },
];
function animateCount(
  el: HTMLElement,
  target: number,
  prefix: string,
  suffix: string,
  duration: number,
) {
  let startTime: number | null = null;
  const step = (now: number) => {
    if (!startTime) startTime = now;
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent =
      prefix + Math.round(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
export function HomeHero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: HomeDict;
}) {
  const triggered = useRef(false);
  const stats = statConfig.map((s, i) => ({
    ...s,
    label: dict.hero.stats[i].label,
    cite: dict.hero.stats[i].cite,
  }));
  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    // Freeze each number's box to its final rendered width up front, so the
    // label beside it can never shift as the digits change during count-up.
    stats.forEach(({ id }) => {
      const el = document.getElementById(id);
      const wrap = el?.parentElement;
      if (wrap) wrap.style.width = `${wrap.getBoundingClientRect().width}px`;
    });
    setTimeout(() => {
      stats.forEach(({ id, target, prefix, suffix, dur }) => {
        const el = document.getElementById(id);
        if (el) animateCount(el, target, prefix, suffix, dur);
      });
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="px-20 max-lg:px-6 relative">
    <div
      className="grid grid-cols-[1fr_1fr] relative max-lg:grid-cols-1 max-w-[1400px] mx-auto"
    >
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-20%",
          right: "-10%",
          width: "70%",
          height: "140%",
          background:
            "radial-gradient(ellipse, rgba(149,51,165,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Left — text */}
      <div className="flex flex-col justify-center pr-20 py-16 max-lg:pr-0 max-lg:pt-20 max-lg:pb-8">
        <FadeUp>
          <h1 className="text-[clamp(3rem,5.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.02em] mb-5">
            {dict.hero.titleLine1}
            <br />
            {dict.hero.titleLine2}
            <br />
            <em>{dict.hero.titleEm}</em>
          </h1>
        </FadeUp>
        <FadeUp style={{ transitionDelay: "120ms" }}>
          <p className="text-[1.05rem] leading-[1.7] text-white max-w-[420px] mb-8">
            {dict.hero.subtitle}
          </p>
        </FadeUp>
        <FadeUp style={{ transitionDelay: "240ms" }}>
          <div className="flex gap-4 flex-wrap">
            <Button href={localizeHref(locale, "/inspection")}>
              {dict.hero.ctaPrimary}
            </Button>
            <Button href={localizeHref(locale, "/about")} variant="outline">
              {dict.hero.ctaSecondary}
            </Button>
          </div>
        </FadeUp>
      </div>
      {/* Right — stats as stacked list */}
      <div
        className="flex items-center justify-center pl-8 py-16 relative max-lg:pl-0 max-lg:pb-12"
      >
        {/* Stats */}
        <div
  className="w-full max-w-[480px] relative"
>
          {stats.map((s, i) => {
            const finalText = `${s.prefix}${Math.round(s.target).toLocaleString()}${s.suffix}`;
            return (
            <FadeUp key={s.id} style={{ transitionDelay: `${i * 100}ms` }}>
            <div
              className="py-5 transition-transform duration-300 ease-out hover:translate-x-1"
              style={{ borderBottom: "2px solid #c9a3e0" }}
            >
              <div className="flex items-center gap-5 max-sm:flex-col max-sm:items-start max-sm:gap-1">
                <span
                  className="grid flex-shrink-0"
                  style={{
  fontFamily: "var(--font-heading), Georgia, serif",
  color: "var(--color-accent)",
}}
                >
                  <span
                    aria-hidden="true"
                    className="invisible col-start-1 row-start-1 text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-[1]"
                  >
                    {finalText}
                  </span>
                  <span
                    id={s.id}
                    className="col-start-1 row-start-1 text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-[1]"
                  >
                    {s.prefix}0{s.suffix}
                  </span>
                </span>
                <p className="text-[0.95rem] text-white leading-[1.55]">
                  {s.label} ({s.cite})
                </p>
              </div>
            </div>
            </FadeUp>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}
