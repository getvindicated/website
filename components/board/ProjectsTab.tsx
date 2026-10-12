"use client";

import { useState } from "react";
import type { Para } from "@/lib/board/chapters";
import { useBoard } from "./BoardApp";
import { daysBetween } from "./util";

const P = ({ p }: { p: Para }) => (
  <p>
    {p.b && <strong>{p.b} </strong>}
    {p.t}
  </p>
);

export function ProjectsTab() {
  const { chapter, today } = useBoard();
  const { groups, sections, timeline } = chapter.projects;
  const [track, setTrack] = useState("All");

  return (
    <section>
      <h2>All Projects</h2>
      <div className="proj-grid">
        {groups.map((g) => (
          <div key={g.group}>
            <h3>{g.group}</h3>
            <ul>
              {g.items.map(([name, where]) => (
                <li key={name}>
                  {name}
                  {where && <span className="deep"> · {where}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {sections.map((s) => (
        <div key={s.title}>
          <h2>{s.title}</h2>
          <div className="cols">
            {s.cols.map((col, i) => (
              <div key={i}>
                {col.map((p, j) => (
                  <P key={j} p={p} />
                ))}
                {i === s.cols.length - 1 && s.credit && <p className="deep">{s.credit}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <h3 style={{ marginTop: 18 }}>{timeline.title}</h3>
      <div className="bar" role="group" aria-label="Filter calendar by track">
        {["All", ...timeline.tracks].map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={track === t} onClick={() => setTrack(t)}>
            {t}
          </button>
        ))}
      </div>
      <div>
        {timeline.weeks.map((w) => {
          // A week can stay "this week" through its weekend (Berkeley's end on Fridays).
          const now = daysBetween(w.start, today) >= 0 && daysBetween(today, w.end) >= -timeline.graceDays;
          const items = w.items.filter((i) => track === "All" || i[0] === track);
          return (
            <details key={w.n} className={`week${now ? " now" : ""}`} open={now || undefined}>
              <summary>
                <span className="wk">Week {w.n}</span>
                <span className="num">{w.label}</span>
                <span className="goal">
                  {w.goal}
                  {now && <span className="tag">This week</span>}
                </span>
              </summary>
              <ul className="items">
                {items.length ? (
                  items.map(([t, text], i) => (
                    <li key={i}>
                      <span className="track">{t}</span>
                      <span>{text}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <span />
                    <span>Nothing scheduled for {track} this week.</span>
                  </li>
                )}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
