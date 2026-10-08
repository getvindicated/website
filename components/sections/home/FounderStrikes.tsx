"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";

export function FounderStrikes({
  dict,
  storyHref,
}: {
  dict: HomePageDict["strikes"];
  storyHref: string;
}) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = dict.items.length;

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % count;
    else if (e.key === "ArrowLeft") next = (i + count - 1) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className="band">
      <div className="wrap">
        <div className="intro">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="tabs mt48" role="tablist" aria-label={dict.tabsLabel}>
          {dict.items.map((s, i) => (
            <button
              key={s.n}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`strike-tab-${i}`}
              aria-controls={`strike-panel-${i}`}
              aria-selected={active === i}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {dict.tab.replace("{n}", s.n)}
            </button>
          ))}
        </div>
        {dict.items.map((s, i) => (
          <div
            key={s.n}
            role="tabpanel"
            id={`strike-panel-${i}`}
            aria-labelledby={`strike-tab-${i}`}
            className="story"
            hidden={active !== i}
          >
            <div className="story-meta">
              <div className="n" aria-hidden="true">
                {s.n}
              </div>
              <h3>{s.title}</h3>
              <p>{s.meta}</p>
            </div>
            <div className="story-body">
              {s.paras.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {i === count - 1 && (
                <Link className="btn btn-line" href={storyHref}>
                  {dict.readMore}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
