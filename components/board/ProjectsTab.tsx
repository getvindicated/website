"use client";

import { useState } from "react";
import type { Para } from "@/lib/board/chapters";
import { useBoard } from "./BoardApp";
import { EditLink, ProjectGroupsEditor, ProjectSectionEditor, TimelineEditor } from "./Editors";
import { daysBetween } from "./util";

const P = ({ p }: { p: Para }) => (
  <p>
    {p.b && <strong>{p.b} </strong>}
    {p.t}
  </p>
);

export function ProjectsTab() {
  const { data, user, today } = useBoard();
  const admin = user.role === "admin";
  const { groups, sections, timeline } = data.settings.projects;
  const [track, setTrack] = useState("All");
  // What an admin is editing: "groups", "timeline", "new", or a description's index.
  const [editing, setEditing] = useState<string | number | null>(null);
  const close = () => setEditing(null);

  return (
    <section>
      <h2>All Projects</h2>
      {editing === "groups" && <ProjectGroupsEditor onDone={close} />}
      {admin && editing !== "groups" && (
        <p className="admin-row">
          <EditLink onClick={() => setEditing("groups")}>Edit all projects</EditLink>
        </p>
      )}
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

      {sections.map((s, si) => (
        <div key={s.title + si}>
          <h2>{s.title}</h2>
          {editing === si && <ProjectSectionEditor index={si} onDone={close} />}
          {admin && editing !== si && (
            <p className="admin-row">
              <EditLink onClick={() => setEditing(si)}>Edit this description</EditLink>
            </p>
          )}
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

      {editing === "new" && <ProjectSectionEditor index={-1} onDone={close} />}
      {admin && editing !== "new" && (
        <p className="admin-row">
          <EditLink onClick={() => setEditing("new")}>Add a project description</EditLink>
        </p>
      )}

      <h3 style={{ marginTop: 18 }}>{timeline.title}</h3>
      {editing === "timeline" && <TimelineEditor onDone={close} />}
      {admin && editing !== "timeline" && (
        <p className="admin-row">
          <EditLink onClick={() => setEditing("timeline")}>Edit the timeline</EditLink>
        </p>
      )}
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
