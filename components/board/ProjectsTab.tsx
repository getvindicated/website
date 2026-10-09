"use client";

import { useState } from "react";
import { PIR, PROJECTS, WEEKS, type Track } from "@/lib/board/static";
import { useBoard } from "./BoardApp";
import { daysBetween } from "./util";

const TRACKS: ("All" | Track)[] = ["All", "Data", "Backend", "App"];

export function ProjectsTab() {
  const { today } = useBoard();
  const [track, setTrack] = useState<"All" | Track>("All");

  return (
    <section>
      <h2>All Projects</h2>
      <div className="proj-grid">
        {PROJECTS.map((g) => (
          <div key={g.group}>
            <h3>{g.group}</h3>
            <ul>
              {g.items.map(([name, chapter]) => (
                <li key={name}>
                  {name}
                  {chapter && <span className="deep"> · {chapter}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>Project Price Is Right</h2>
      <div className="cols">
        <div>
          <p>{PIR.intro}</p>
          <p>
            <strong>Modes:</strong> {PIR.modes}
          </p>
          <p>
            <strong>Screens:</strong> {PIR.screens}
          </p>
        </div>
        <div>
          <p>
            <strong>How it fits together:</strong> {PIR.howItFits}
          </p>
          <p className="deep">{PIR.credit}</p>
        </div>
      </div>

      <h3 style={{ marginTop: 18 }}>6-week calendar</h3>
      <div className="bar" role="group" aria-label="Filter calendar by track">
        {TRACKS.map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={track === t} onClick={() => setTrack(t)}>
            {t}
          </button>
        ))}
      </div>
      <div>
        {WEEKS.map((w) => {
          // A week stays "this week" through its weekend.
          const now = daysBetween(w.start, today) >= 0 && daysBetween(today, w.end) >= -2;
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
