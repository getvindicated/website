"use client";

import { useId, useState, type ReactNode } from "react";
import type { KeyDate, Photo, Projects, QuickLink } from "@/lib/board/settings";
import type { Para, TimelineWeek } from "@/lib/board/chapters";
import { TABS } from "@/lib/board/types";
import { useBoard } from "./BoardApp";
import { api, apiCall, photoSrc, saveSetting } from "./util";

// Admin editors for chapter content. Each saves through /api/board/settings
// (or /api/board/teams), which checks the admin session and logs the change.

function useSave(key: string, onDone: () => void) {
  const { refresh } = useBoard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (value: unknown) => {
    setBusy(true);
    setError("");
    const err = await saveSetting(key, value);
    setBusy(false);
    if (err) return setError(err);
    refresh();
    onDone();
  };
  return { save, busy, error };
}

function Shell({ title, children, busy, error, onSave, onCancel }: { title: string; children: ReactNode; busy: boolean; error: string; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="stack">{children}</div>
      <div className="bar" style={{ margin: "12px 0 0" }}>
        <button className="btn" type="button" disabled={busy} onClick={onSave}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button className="chip" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// "Edit" link shown to admins next to the thing it edits.
export function EditLink({ onClick, children = "Edit" }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button type="button" className="linkbtn edit-link" onClick={onClick}>
      {children}
    </button>
  );
}

const move = <T,>(list: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const n = [...list];
  [n[i], n[j]] = [n[j], n[i]];
  return n;
};

function RowTools({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (d: number) => void; onRemove: () => void }) {
  return (
    <span className="row-tools">
      <button type="button" className="chip" aria-label="Move up" disabled={i === 0} onClick={() => onMove(-1)}>
        ↑
      </button>
      <button type="button" className="chip" aria-label="Move down" disabled={i === n - 1} onClick={() => onMove(1)}>
        ↓
      </button>
      <button type="button" className="chip" onClick={onRemove}>
        Remove
      </button>
    </span>
  );
}

// ---- one line or paragraph of text ----

export function TextSetting({ k, label, value, multiline, onDone }: { k: "term" | "meetingTime" | "rule"; label: string; value: string; multiline?: boolean; onDone: () => void }) {
  const id = useId();
  const [v, setV] = useState(value);
  const { save, busy, error } = useSave(k, onDone);
  return (
    <Shell title={`Edit ${label.toLowerCase()}`} busy={busy} error={error} onSave={() => save(v)} onCancel={onDone}>
      <label htmlFor={id}>
        {label}
        {multiline ? <textarea id={id} value={v} onChange={(e) => setV(e.target.value)} /> : <input id={id} value={v} onChange={(e) => setV(e.target.value)} />}
      </label>
    </Shell>
  );
}

// ---- Home ----

export function QuickLinksEditor({ onDone }: { onDone: () => void }) {
  const { data } = useBoard();
  const [list, setList] = useState<QuickLink[]>(data.settings.quickLinks);
  const { save, busy, error } = useSave("quickLinks", onDone);
  const set = (i: number, p: Partial<QuickLink>) => setList(list.map((l, j) => (j === i ? { ...l, ...p } : l)));
  return (
    <Shell title="Edit quick links" busy={busy} error={error} onSave={() => save(list)} onCancel={onDone}>
      <p>Each link shows as &ldquo;Label: text&rdquo;. Leave the URL empty to show &ldquo;(link to add)&rdquo;, or link to a tab instead.</p>
      {list.map((l, i) => (
        <div className="edit-block" key={i}>
          <div className="pair">
            <label>
              Label (optional)
              <input value={l.label} onChange={(e) => set(i, { label: e.target.value })} />
            </label>
            <label>
              Text
              <input value={l.text} onChange={(e) => set(i, { text: e.target.value })} />
            </label>
          </div>
          <div className="pair">
            <label>
              URL
              <input type="url" value={l.href ?? ""} placeholder="https://…" onChange={(e) => set(i, { href: e.target.value || null })} />
            </label>
            <label>
              Or a tab
              <select value={l.tab} onChange={(e) => set(i, { tab: e.target.value as QuickLink["tab"] })}>
                <option value="">None</option>
                {TABS.filter((t) => t !== "changes").map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <RowTools i={i} n={list.length} onMove={(d) => setList(move(list, i, d))} onRemove={() => setList(list.filter((_, j) => j !== i))} />
        </div>
      ))}
      <p>
        <button type="button" className="chip" onClick={() => setList([...list, { label: "", text: "", href: null, tab: "" }])}>
          Add a link
        </button>
      </p>
    </Shell>
  );
}

export function KeyDatesEditor({ onDone }: { onDone: () => void }) {
  const { data } = useBoard();
  const [list, setList] = useState<KeyDate[]>(data.settings.keyDates);
  const { save, busy, error } = useSave("keyDates", onDone);
  const set = (i: number, p: Partial<KeyDate>) => setList(list.map((l, j) => (j === i ? { ...l, ...p } : l)));
  return (
    <Shell title="Edit key dates" busy={busy} error={error} onSave={() => save(list)} onCancel={onDone}>
      {list.map((d, i) => (
        <div className="edit-block" key={i}>
          <div className="pair">
            <label>
              Date
              <input type="date" value={d.date} onChange={(e) => set(i, { date: e.target.value })} />
            </label>
            <label>
              What happens
              <input value={d.text} onChange={(e) => set(i, { text: e.target.value })} />
            </label>
          </div>
          <RowTools i={i} n={list.length} onMove={(dd) => setList(move(list, i, dd))} onRemove={() => setList(list.filter((_, j) => j !== i))} />
        </div>
      ))}
      <p>
        <button type="button" className="chip" onClick={() => setList([...list, { date: "", text: "" }])}>
          Add a date
        </button>
      </p>
    </Shell>
  );
}

export function PhotosEditor({ onDone }: { onDone: () => void }) {
  const { data } = useBoard();
  const [list, setList] = useState<Photo[]>(data.settings.photos);
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState("");
  const { save, busy, error } = useSave("photos", onDone);

  async function upload(file: File | undefined, replace?: number) {
    if (!file) return;
    setUploading(true);
    setUpErr("");
    const form = new FormData();
    form.set("file", file);
    const { error: err, data: r } = await apiCall("/api/board/photos", "POST", form);
    setUploading(false);
    if (err || typeof r?.src !== "string") return setUpErr(err ?? "The upload didn't work.");
    const p = { src: r.src as string };
    setList(replace === undefined ? [...list, p] : list.map((x, j) => (j === replace ? p : x)));
  }

  return (
    <Shell title="Edit the photo row" busy={busy || uploading} error={error || upErr} onSave={() => save(list)} onCancel={onDone}>
      <p>JPG, PNG or WebP, up to 2 MB each. Cutouts with a transparent background look best. Changes show after you save.</p>
      {list.map((p, i) => (
        <div className="edit-block photo-row" key={p.src + i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoSrc(p.src)} alt={`Photo ${i + 1}`} />
          <label className="inline">
            Replace
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files?.[0], i)} />
          </label>
          <RowTools i={i} n={list.length} onMove={(d) => setList(move(list, i, d))} onRemove={() => setList(list.filter((_, j) => j !== i))} />
        </div>
      ))}
      <label>
        Add a photo
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
      </label>
      {uploading && <p className="msg">Uploading…</p>}
    </Shell>
  );
}

// ---- Board: teams ----

export function TeamsEditor({ onDone }: { onDone: () => void }) {
  const { data, refresh } = useBoard();
  const teams = data.settings.teams;
  const [names, setNames] = useState<string[]>(teams);
  const [added, setAdded] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const countOn = (t: string) => data.members.filter((m) => m.team === t).length;

  async function run(body: Record<string, string>) {
    setBusy(true);
    setError("");
    const err = await api("/api/board/teams", "POST", body);
    setBusy(false);
    if (err) return setError(err);
    setRemoving(null);
    refresh();
  }

  return (
    <div className="card">
      <h3>Edit teams</h3>
      <p>Executive is always on the chart. Renaming a team moves its members with it.</p>
      {teams.map((t, i) => (
        <div className="edit-block" key={t}>
          <div className="bar" style={{ margin: 0 }}>
            <input aria-label={`Name for ${t}`} value={names[i] ?? t} onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))} style={{ flex: "1 1 200px" }} />
            <button type="button" className="chip" disabled={busy || !names[i]?.trim() || names[i] === t} onClick={() => run({ action: "rename", team: t, name: names[i] })}>
              Rename
            </button>
            <button type="button" className="chip" disabled={busy} onClick={() => (countOn(t) ? (setRemoving(t), setMoveTo("")) : run({ action: "remove", team: t }))}>
              Remove
            </button>
            <span>
              {countOn(t)} {countOn(t) === 1 ? "person" : "people"}
            </span>
          </div>
          {removing === t && (
            <div className="bar" style={{ margin: "8px 0 0" }}>
              <label className="inline">
                Move {countOn(t)} {countOn(t) === 1 ? "person" : "people"} to
                <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
                  <option value="">Choose a team</option>
                  {["Executive", ...teams.filter((x) => x !== t)].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn" disabled={busy || !moveTo} onClick={() => run({ action: "remove", team: t, moveTo })}>
                Move them and remove {t}
              </button>
              <button type="button" className="chip" onClick={() => setRemoving(null)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
      <div className="bar" style={{ margin: "8px 0 0" }}>
        <input aria-label="New team name" placeholder="New team name" value={added} onChange={(e) => setAdded(e.target.value)} style={{ flex: "1 1 200px" }} />
        <button
          type="button"
          className="chip"
          disabled={busy || !added.trim()}
          onClick={async () => {
            await run({ action: "add", name: added });
            setAdded("");
          }}
        >
          Add team
        </button>
        <button type="button" className="chip" onClick={onDone}>
          Done
        </button>
      </div>
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ---- Projects ----

function ParasEditor({ value, onChange }: { value: Para[]; onChange: (v: Para[]) => void }) {
  return (
    <>
      {value.map((p, i) => (
        <div className="edit-block" key={i}>
          <label>
            Bold start (optional)
            <input value={p.b ?? ""} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, b: e.target.value || undefined } : x)))} />
          </label>
          <label>
            Text
            <textarea value={p.t} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)))} />
          </label>
          <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      <p>
        <button type="button" className="chip" onClick={() => onChange([...value, { t: "" }])}>
          Add a paragraph
        </button>
      </p>
    </>
  );
}

export function ProjectGroupsEditor({ onDone }: { onDone: () => void }) {
  const { data } = useBoard();
  const p = data.settings.projects;
  // One line per project: "Name" or "Name | where".
  const [groups, setGroups] = useState(p.groups.map((g) => ({ group: g.group, lines: g.items.map(([n, w]) => (w ? `${n} | ${w}` : n)).join("\n") })));
  const { save, busy, error } = useSave("projects", onDone);
  const value = (): Projects => ({
    ...p,
    groups: groups.map((g) => ({
      group: g.group,
      items: g.lines
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [n, w] = l.split("|").map((x) => x.trim());
          return (w ? [n, w] : [n]) as [string, string?];
        }),
    })),
  });
  return (
    <Shell title="Edit all projects" busy={busy} error={error} onSave={() => save(value())} onCancel={onDone}>
      <p>One project per line. To add where it runs, write &ldquo;Project name | Berkeley&rdquo;.</p>
      {groups.map((g, i) => (
        <div className="edit-block" key={i}>
          <label>
            Group
            <input value={g.group} onChange={(e) => setGroups(groups.map((x, j) => (j === i ? { ...x, group: e.target.value } : x)))} />
          </label>
          <label>
            Projects
            <textarea value={g.lines} onChange={(e) => setGroups(groups.map((x, j) => (j === i ? { ...x, lines: e.target.value } : x)))} />
          </label>
          <RowTools i={i} n={groups.length} onMove={(d) => setGroups(move(groups, i, d))} onRemove={() => setGroups(groups.filter((_, j) => j !== i))} />
        </div>
      ))}
      <p>
        <button type="button" className="chip" onClick={() => setGroups([...groups, { group: "", lines: "" }])}>
          Add a group
        </button>
      </p>
    </Shell>
  );
}

// One project description, or a new one when index is -1.
export function ProjectSectionEditor({ index, onDone }: { index: number; onDone: () => void }) {
  const { data } = useBoard();
  const p = data.settings.projects;
  const start = index >= 0 ? p.sections[index] : { title: "", cols: [[{ t: "" }], []] as Para[][] };
  const [title, setTitle] = useState(start.title);
  const [credit, setCredit] = useState(start.credit ?? "");
  const [cols, setCols] = useState<Para[][]>(start.cols.length === 2 ? start.cols : [start.cols[0] ?? [], []]);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { save, busy, error } = useSave("projects", onDone);
  const section = { title, cols: cols.filter((c) => c.length), ...(credit.trim() ? { credit } : {}) };
  const sections = index >= 0 ? p.sections.map((s, i) => (i === index ? section : s)) : [...p.sections, section];
  return (
    <Shell title={index >= 0 ? `Edit ${start.title}` : "Add a project description"} busy={busy} error={error} onSave={() => save({ ...p, sections })} onCancel={onDone}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <h4>Left column</h4>
      <ParasEditor value={cols[0]} onChange={(v) => setCols([v, cols[1]])} />
      <h4>Right column</h4>
      <ParasEditor value={cols[1]} onChange={(v) => setCols([cols[0], v])} />
      <label>
        Credit line (optional)
        <input value={credit} onChange={(e) => setCredit(e.target.value)} />
      </label>
      {index >= 0 && (
        <p>
          <button
            type="button"
            className="chip"
            onClick={() => (confirmRemove ? save({ ...p, sections: p.sections.filter((_, i) => i !== index) }) : setConfirmRemove(true))}
          >
            {confirmRemove ? "Click again to remove this description" : "Remove this description"}
          </button>
        </p>
      )}
    </Shell>
  );
}

// The timeline: its title, tracks, and every week.
export function TimelineEditor({ onDone }: { onDone: () => void }) {
  const { data } = useBoard();
  const p = data.settings.projects;
  const [title, setTitle] = useState(p.timeline.title);
  const [tracks, setTracks] = useState(p.timeline.tracks.join(", "));
  const [weeks, setWeeks] = useState<TimelineWeek[]>(p.timeline.weeks);
  const { save, busy, error } = useSave("projects", onDone);
  const trackList = tracks
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const setWeek = (i: number, w: Partial<TimelineWeek>) => setWeeks(weeks.map((x, j) => (j === i ? { ...x, ...w } : x)));
  const itemOf = (w: TimelineWeek, track: string) => w.items.filter(([t]) => t === track).map(([, s]) => s).join("\n");
  const setItem = (i: number, track: string, text: string) => {
    const w = weeks[i];
    const others = w.items.filter(([t]) => t !== track);
    const mine = text.split("\n").map((s) => [track, s] as [string, string]);
    // Keep the track order.
    const items = trackList.flatMap((t) => (t === track ? mine : others.filter(([x]) => x === t)));
    setWeek(i, { items });
  };
  const value: Projects = { ...p, timeline: { ...p.timeline, title, tracks: trackList, weeks } };
  return (
    <Shell title="Edit the timeline" busy={busy} error={error} onSave={() => save(value)} onCancel={onDone}>
      <div className="pair">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Tracks (comma separated)
          <input value={tracks} onChange={(e) => setTracks(e.target.value)} />
        </label>
      </div>
      {weeks.map((w, i) => (
        <details className="edit-block" key={i}>
          <summary>
            <strong>Week {i + 1}</strong> · {w.label || "no dates yet"} · {w.goal}
          </summary>
          <div className="stack" style={{ marginTop: 10 }}>
            <div className="pair">
              <label>
                Starts
                <input type="date" value={w.start} onChange={(e) => setWeek(i, { start: e.target.value })} />
              </label>
              <label>
                Ends
                <input type="date" value={w.end} onChange={(e) => setWeek(i, { end: e.target.value })} />
              </label>
            </div>
            <div className="pair">
              <label>
                Label
                <input value={w.label} placeholder="Oct 11 – 17" onChange={(e) => setWeek(i, { label: e.target.value })} />
              </label>
              <label>
                Goal
                <input value={w.goal} onChange={(e) => setWeek(i, { goal: e.target.value })} />
              </label>
            </div>
            {trackList.map((t) => (
              <label key={t}>
                {t}
                <textarea rows={2} value={itemOf(w, t)} onChange={(e) => setItem(i, t, e.target.value)} />
              </label>
            ))}
            <RowTools i={i} n={weeks.length} onMove={(d) => setWeeks(move(weeks, i, d))} onRemove={() => setWeeks(weeks.filter((_, j) => j !== i))} />
          </div>
        </details>
      ))}
      <p>
        <button
          type="button"
          className="chip"
          onClick={() => setWeeks([...weeks, { n: weeks.length + 1, start: "", end: "", label: "", goal: "", items: [] }])}
        >
          Add a week
        </button>
      </p>
    </Shell>
  );
}
