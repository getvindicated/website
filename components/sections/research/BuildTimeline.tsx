"use client";

import { useEffect, useState } from "react";
import type { ResearchPageDict } from "@/lib/i18n/dictionary";

// Week 1 starts Monday, September 28, 2026.
const START = new Date(2026, 8, 28);
const WEEK_MS = 7 * 864e5;

export function BuildTimeline({ dict }: { dict: ResearchPageDict["timeline"] }) {
  // Computed after mount: the page is prerendered, so the server doesn't
  // know today's date.
  const [week, setWeek] = useState<number | null>(null);
  useEffect(() => {
    setWeek(Math.floor((Date.now() - START.getTime()) / WEEK_MS));
  }, []);

  return (
    <div className="plan-tl">
      <h3>{dict.title}</h3>
      <p>{dict.body}</p>
      <ol className="tl6">
        {dict.weeks.map(([date, text], i) => {
          const state =
            week === null ? undefined : i < week ? "past" : i === week ? "now" : undefined;
          return (
            <li key={date} className={state} aria-current={state === "now" ? "step" : undefined}>
              <span className="tl-w">{dict.week.replace("{n}", String(i + 1))}</span>
              <span className="tl-d">{date}</span>
              <p>{text}</p>
              {state === "now" && <span className="tl-now">{dict.now}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
