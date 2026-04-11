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
      "More Black male buyers are charged vs. white male buyers — same car, same script",
    cite: "(Ayres & Siegelman, 1995)",
  },
  {
    id: "stat2",
    target: 70,
    prefix: "",
    suffix: "%",
    dur: 1600,
    label:
      "Of Gen Z women feel discouraged from visiting a dealership due to gender discrimination",
    cite: "(Morning Consult / Caribou, 2022)",
  },
  {
    id: "stat3",
    target: 4,
    prefix: "",
    suffix: "%",
    dur: 1400,
    label:
      "Of dealership test visits included racist or sexist comments from staff",
    cite: "(Ayres & Siegelman, 1995)",
  },
  {
    id: "stat4",
    target: 13,
    prefix: "",
    suffix: "%",
    dur: 1500,
    label:
      "Longer negotiations faced by minority buyers — same car, same price",
    cite: "(Ayres & Siegelman, 1995)",
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
      className="grid min-h-[500px] relative grid-cols-2"
    >
      {/* Glow */}
      <div
        className="absolute pointer-events-none top-[-20%] right-[-10%] w-[70%] h-[140%] bg-[radial-gradient(ellipse,rgba(124,58,237,0.12)_0%,transparent_70%)]"
      />

      {/* Left — text */}
      <div className="flex flex-col justify-center px-20 py-16 pl-20 max-lg:px-6 max-lg:pt-20 max-lg:pb-8">
        <p
          className="text-[0.82rem] font-semibold mb-5 text-[var(--color-light)]"
        >
          A Nonprofit for Automotive Justice
        </p>
        <h1 className="text-[clamp(3rem,5.5vw,5.5rem)] font-black leading-[0.95] tracking-tight mb-7">
          You Deserve
          <br />
          to Buy a Car
          <br />
          <em>Without Fear.</em>
        </h1>
        <p className="text-[1.15rem] leading-[1.75] text-white/80 max-w-[420px] mb-10">
          VINdicated is built on the belief that car knowledge should be public
          knowledge. We break down the systems that allow consumer
          discrimination to thrive — through education, research, and community.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Button href="/inspection">Get the PPI Guide</Button>
          <Button href="/about" variant="outline">
            Our Story
          </Button>
        </div>
      </div>

      {/* Right — stat block */}
      <div
        className="flex items-center justify-center px-8 py-16 relative max-lg:px-6 max-lg:pb-12 pr-[5rem]"
      >
        {/* Background illustration */}
        <div
          className="absolute inset-0 pointer-events-none bg-[url('/illus-woman-dealership.png')] bg-cover bg-[center_top] opacity-[0.12]"
        />
        {/* Stats */}
        <div
          className="grid w-full max-w-[440px] relative grid-cols-2 gap-[1.5px] bg-[var(--color-border)]"
        >
          {stats.map((s) => (
            <div
              key={s.id}
              className="relative p-7 bg-[var(--color-bg-surface)]"
            >
              <div
                className="absolute top-0 left-0 w-[3px] h-full bg-[var(--color-vivid)]"
              />
              <div
                id={s.id}
                className="text-[2.2rem] font-black leading-[1] mb-1 text-[var(--color-light)]"
              >
                {s.prefix}0{s.suffix}
              </div>
              <p className="text-[0.88rem] text-white/80 leading-[1.5]">
                {s.label}{" "}
                <span className="text-[0.75em] opacity-60">{s.cite}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
