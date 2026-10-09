"use client";

import { useState } from "react";
import type { Social } from "@/lib/board/types";
import { SOCIAL_KINDS, SOCIAL_MONTHS, SOCIAL_STATUSES } from "@/lib/board/static";
import { canEditSocials } from "@/lib/board/roles";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { D, fmt, isoDate } from "./util";

const FILTERS = [{ key: "All", label: "All" }, ...SOCIAL_KINDS.map((k) => ({ key: k.key as string, label: k.label }))];
const TAG: Record<string, string> = { b: "Berkeley", x: "UCSC × UCB", o: "Online", org: "Org date" };

const SOCIAL_FIELDS: FieldDef[] = [
  { key: "title", label: "Name" },
  { key: "date", label: "Date", type: "date", pair: "d" },
  { key: "time", label: "Time", placeholder: "2:00–4:00pm", pair: "d" },
  { key: "location", label: "Location", placeholder: "Place name and address" },
  { key: "kind", label: "Type", type: "select", options: SOCIAL_KINDS.map((k) => ({ value: k.key, label: k.label })), pair: "k" },
  { key: "status", label: "Status", type: "select", options: SOCIAL_STATUSES.map((s) => ({ value: s, label: s })), pair: "k" },
  { key: "lead", label: "Lead" },
  { key: "cost", label: "Cost" },
  { key: "note", label: "Notes", type: "textarea" },
];

export function SocialsTab() {
  const { data, user, today } = useBoard();
  const editor = canEditSocials(user.role);
  const socials = data.socials;
  const [filter, setFilter] = useState("All");
  const [openId, setOpenId] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [month, setMonth] = useState(() => {
    const t = D(today);
    const inRange = t.getFullYear() === SOCIAL_MONTHS.year && t.getMonth() >= SOCIAL_MONTHS.first && t.getMonth() <= SOCIAL_MONTHS.last;
    return inRange ? new Date(t.getFullYear(), t.getMonth(), 1) : new Date(SOCIAL_MONTHS.year, SOCIAL_MONTHS.first, 1);
  });

  const show = (s: Social) => s.kind === "org" || filter === "All" || s.kind === filter;
  const real = socials.filter((s) => s.kind !== "org");
  const y = month.getFullYear();
  const m = month.getMonth();
  const start = new Date(y, m, 1 - new Date(y, m, 1).getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (i >= 35 && d.getMonth() !== m) break;
    cells.push(d);
  }
  const open = openId !== null ? socials.find((s) => s.id === openId) ?? null : null;
  const editingRow = typeof editing === "number" ? socials.find((s) => s.id === editing) : null;

  const page = (delta: number) => {
    setMonth(new Date(y, m + delta, 1));
    setOpenId(null);
  };
  const jumpTo = (date: unknown) => {
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const d = D(date);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  return (
    <section>
      <h2>Fall 2026 Socials</h2>
      <div className="bar" role="group" aria-label="Filter socials">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className="chip"
            aria-pressed={filter === f.key}
            onClick={() => {
              setFilter(f.key);
              setOpenId(null);
            }}
          >
            {f.label}
            <span className="ct">{f.key === "All" ? real.length : real.filter((s) => s.kind === f.key).length}</span>
          </button>
        ))}
      </div>
      {editor && (
        <p>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setEditing("new");
              setOpenId(null);
            }}
          >
            Add a social
          </button>
        </p>
      )}
      <div className="calhead">
        <button type="button" className="chip" aria-label="Previous month" disabled={m <= SOCIAL_MONTHS.first && y <= SOCIAL_MONTHS.year} onClick={() => page(-1)}>
          ←
        </button>
        <h3 aria-live="polite">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
        <button type="button" className="chip" aria-label="Next month" disabled={m >= SOCIAL_MONTHS.last && y >= SOCIAL_MONTHS.year} onClick={() => page(1)}>
          →
        </button>
      </div>
      <div className="month" role="grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="dow" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((d) => {
          const key = isoDate(d);
          const evs = socials.filter((s) => s.date === key && show(s));
          return (
            <div key={key} className={`day${d.getMonth() !== m ? " other" : ""}${key === today ? " today" : ""}`} role="gridcell">
              <span className="dn">{d.getDate()}</span>
              {evs.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`ev ${s.kind}`}
                  aria-pressed={openId === s.id}
                  title={s.title}
                  onClick={() => {
                    if (s.kind === "org" && !editor) return;
                    setEditing(null);
                    setOpenId(openId === s.id ? null : s.id);
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {editing === "new" && (
        <RowEditor
          title="Add a social"
          table="socials"
          fields={SOCIAL_FIELDS}
          initial={{ title: "", date: "", time: "", location: "", kind: "b", status: "Idea", lead: "Pierce", cost: "", note: "" }}
          onClose={() => setEditing(null)}
          onSaved={(v) => jumpTo(v.date)}
        />
      )}
      {editingRow && (
        <RowEditor
          key={editingRow.id}
          title={`Edit ${editingRow.title}`}
          table="socials"
          id={editingRow.id}
          fields={editingRow.kind === "org" ? SOCIAL_FIELDS.filter((f) => f.key !== "kind" && f.key !== "status") : SOCIAL_FIELDS}
          initial={{
            title: editingRow.title,
            date: editingRow.date,
            time: editingRow.time,
            location: editingRow.location,
            ...(editingRow.kind === "org" ? {} : { kind: editingRow.kind, status: editingRow.status || "Idea" }),
            lead: editingRow.lead,
            cost: editingRow.cost,
            note: editingRow.note,
          }}
          onClose={() => setEditing(null)}
          onSaved={(v) => jumpTo(v.date)}
        />
      )}
      {open && !editingRow && (
        <div className="card">
          <h3>{open.title}</h3>
          <div className="row">
            <span>When</span>
            <span>
              {fmt(open.date, { weekday: "long", month: "long", day: "numeric" })}
              {open.time && ` · ${open.time}`}
            </span>
          </div>
          {open.location && (
            <div className="row">
              <span>Where</span>
              <span>{open.location}</span>
            </div>
          )}
          {open.lead && (
            <div className="row">
              <span>Lead</span>
              <span>{open.lead}</span>
            </div>
          )}
          {open.cost && (
            <div className="row">
              <span>Cost</span>
              <span>{open.cost}</span>
            </div>
          )}
          {open.status && (
            <div className="row">
              <span>Status</span>
              <span className={`st-${open.status}`}>{open.status}</span>
            </div>
          )}
          {open.note && <p style={{ margin: "4px 0 0" }}>{open.note}</p>}
          {editor && (
            <div>
              <button type="button" className="linkbtn" onClick={() => setEditing(open.id)}>
                Edit details or location
              </button>
            </div>
          )}
        </div>
      )}

      <h3 style={{ marginTop: 28 }}>All socials</h3>
      <ul className="agenda">
        {socials.filter(show).map((s) => {
          const past = s.date < today;
          return (
            <li key={s.id}>
              <span className="when">{fmt(s.date, { weekday: "short", month: "short", day: "numeric" })}</span>
              <span>
                <strong>{s.title}</strong>
                {s.location && <span className="deep"> · {s.location}</span>}
                {past && <span className="deep"> (past)</span>}
                <br />
                <span className="tag">{TAG[s.kind]}</span>
                {s.lead && <span className="deep"> · {s.lead}</span>}
              </span>
              <span className={s.status ? `st-${s.status}` : undefined}>{s.status}</span>
            </li>
          );
        })}
      </ul>
      <p style={{ marginTop: 12 }}>Status runs Idea → Planning → Confirmed → Completed. Pierce leads socials unless noted.</p>
    </section>
  );
}
