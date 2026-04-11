"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { FadeUp, SectionLabel, SectionTitle } from "@/components/ui";

const gauges = [
  { id: "gf1", label: "Gender pricing gap", w: 92, color: "#d63b3b" },
  { id: "gf2", label: "Race-based markup", w: 88, color: "#d63b3b" },
  { id: "gf3", label: "Documented incidents", w: 67, color: "#c9a84c" },
  {
    id: "gf4",
    label: "VINdicated coverage growing",
    w: 38,
    color: "#5a3069",
    valLabel: "↑",
  },
];

export function HomeDashboard() {
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    gauges.forEach((g, i) => {
      const el = document.getElementById(g.id);
      if (el)
        setTimeout(
          () => {
            el.style.width = g.w + "%";
          },
          200 + i * 200,
        );
    });
  }, []);

  return (
    <FadeUp>
      <section className="px-20 py-24 max-md:px-6 max-md:py-16">
        <SectionLabel>Impact at a Glance</SectionLabel>
        <SectionTitle
          className="mb-2"
          style={
            { fontSize: "clamp(2.4rem,5vw,4.2rem)" } as React.CSSProperties
          }
        >
          The discrimination is <em>measurable.</em>
          <br />
          The harm is real.
        </SectionTitle>
        <p className="text-[0.88rem] text-white mb-10 leading-[1.6] max-w-[700px]">
          Ayres, I. &amp; Siegelman, P. (1995). Race and gender discrimination
          in bargaining for a new car. <em>The American Economic Review, 85</em>
          (3), 304–321.
        </p>

        <div
          className="p-8 grid items-center gap-10 bg-[var(--color-bg-surface)] border border-[var(--color-border)] grid-cols-[170px_1fr]"
        >
          {/* Speedometer image */}
          <div className="flex items-center justify-center">
            <Image
              src="/illus-speedometer.png"
              alt="Discrimination gauge"
              width={0}
              height={0}
              sizes="180px"
              className="w-full max-w-[180px] block h-auto"
            />
          </div>

          {/* Gauges */}
          <div>
            <p
              className="text-[0.62rem] tracking-wide mb-5 text-[var(--color-light)]"
            >
              System Status
            </p>
            {gauges.map((g) => (
              <div key={g.id} className="flex items-center gap-3 mb-4">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[rgba(124,58,237,0.2)] border border-[var(--color-border)]"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill={g.color} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[0.88rem] text-white/80 mb-[3px]">
                    {g.label}
                  </p>
                  <div
                    className="h-1 rounded-sm overflow-hidden bg-[rgba(255,255,255,0.06)]"
                  >
                    <div
                      id={g.id}
                      className="h-full rounded-sm gauge-fill"
                      style={{ background: g.color }}
                    />
                  </div>
                </div>
                <span
                  className="text-[0.62rem] ml-1 flex-shrink-0"
                  style={{ color: g.color }}
                >
                  {g.valLabel ?? `${g.w}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeUp>
  );
}
