"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";

const stats = [
  {
    id: "stat1",
    target: 1100,
    prefix: "$",
    suffix: "",
    dur: 1800,
    label:
      "more Black male buyers are charged vs. white male buyers, even with the same car and same script",
    cite: "Ayres & Siegelman, 1995",
  },
  {
    id: "stat2",
    target: 70,
    prefix: "",
    suffix: "%",
    dur: 1600,
    label:
      "of Gen Z women feel discouraged from visiting a dealership due to gender discrimination",
    cite: "Morning Consult / Caribou, 2022",
  },
  {
    id: "stat3",
    target: 4,
    prefix: "",
    suffix: "%",
    dur: 1400,
    label:
      "of dealership test visits included racist or sexist comments from staff",
    cite: "Ayres & Siegelman, 1995",
  },
  {
    id: "stat4",
    target: 13,
    prefix: "",
    suffix: "%",
    dur: 1500,
    label:
      "longer negotiations faced by minority buyers, even with the same car and same price",
    cite: "Ayres & Siegelman, 1995",
  },
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

export function HomeHero() {
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    setTimeout(() => {
      stats.forEach(({ id, target, prefix, suffix, dur }) => {
        const el = document.getElementById(id);
        if (el) animateCount(el, target, prefix, suffix, dur);
      });
    }, 600);
  }, []);

  return (
    <div
      className="grid min-h-[500px] relative max-lg:grid-cols-1"
      style={{ gridTemplateColumns: "1fr 1fr" }}
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
            "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Left — text */}
      <div className="flex flex-col justify-center px-20 py-10 pl-20 max-lg:px-6 max-lg:pt-20 max-lg:pb-8">
        <p
          className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] mb-5"
          style={{ color: "var(--color-light)" }}
        >
          A Nonprofit for Automotive Justice
        </p>
        <h1 className="text-[clamp(3rem,5.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.02em] mb-5">
          You Deserve
          <br />
          to Buy a Car
          <br />
          <em>Without Fear.</em>
        </h1>
        <p className="text-[1.05rem] leading-[1.7] text-white/80 max-w-[420px] mb-8">
          VINdicated is built on the belief that car knowledge should be public
          knowledge. We break down the systems that allow consumer
          discrimination to thrive through education, research, and community.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Button href="/inspection">Get the PPI Guide</Button>
          <Button href="/about" variant="outline">
            Our Story
          </Button>
        </div>
      </div>

      {/* Right — stats as stacked list */}
      <div
        className="flex items-center justify-center px-8 py-10 relative max-lg:px-6 max-lg:pb-12"
        style={{ paddingRight: "5rem" }}
      >
        {/* Background illustration */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/illus-woman-dealership.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            opacity: 0.12,
          }}
        />
        {/* Stats */}
        <div
          className="w-full max-w-[480px] relative"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {stats.map((s) => (
            <div
              key={s.id}
              className="py-5"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  id={s.id}
                  className="text-[clamp(2.4rem,4vw,3.2rem)] font-bold leading-[1] flex-shrink-0"
                  style={{
                    fontFamily: "var(--font-heading), Georgia, serif",
                    color: "var(--color-accent)",
                    minWidth: "90px",
                  }}
                >
                  {s.prefix}0{s.suffix}
                </span>
                <p className="text-[0.92rem] text-white/75 leading-[1.55]">
                  {s.label}
                </p>
              </div>
              <p
                className="text-[0.7rem] mt-2 ml-[calc(90px+1rem)]"
                style={{ color: "var(--color-light)", opacity: 0.6 }}
              >
                {s.cite}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
