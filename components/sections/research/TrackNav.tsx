"use client";

import { useEffect, useRef, useState } from "react";
import type { TrackKey } from "./projects";

// Sticky pill nav that highlights the track currently under the header.
export function TrackNav({
  label,
  items,
}: {
  label: string;
  items: { key: TrackKey; title: string; count: number }[];
}) {
  const [current, setCurrent] = useState<TrackKey>(items[0].key);
  const rowRef = useRef<HTMLDivElement>(null);

  // On narrow screens the pills overflow sideways; keep the active one
  // visible without moving the page itself.
  useEffect(() => {
    const row = rowRef.current;
    const pill = row?.querySelector<HTMLElement>("a.on");
    if (!row || !pill) return;
    const left = pill.offsetLeft - row.clientWidth / 2 + pill.offsetWidth / 2;
    row.scrollTo({ left, behavior: "smooth" });
  }, [current]);

  useEffect(() => {
    let ticking = false;
    const spy = () => {
      ticking = false;
      let cur = items[0].key;
      for (const { key } of items) {
        const el = document.getElementById(key);
        if (el && el.getBoundingClientRect().top < 200) cur = key;
      }
      setCurrent(cur);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spy);
      }
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav className="track-nav" aria-label={label}>
      <div className="wrap" ref={rowRef}>
        {items.map((t) => (
          <a
            key={t.key}
            href={`#${t.key}`}
            className={current === t.key ? "on" : undefined}
            aria-current={current === t.key ? "true" : undefined}
          >
            {t.title} <b>{t.count}</b>
          </a>
        ))}
      </div>
    </nav>
  );
}
