"use client";

import { useEffect, useState } from "react";
import type { LogEntry } from "@/lib/board/types";
import { useBoard } from "./BoardApp";
import { api, getActor, setActor } from "./util";

const FIELD: Record<string, string> = {
  value: "content",
  is_lead: "team lead",
  is_hub_admin: "Hub admin",
  also_team: "also leads",
  first_name: "first name",
  proof_required: "proof",
  due_date: "due date",
  status_note: "status note",
  person_role: "role shown",
  recording_url: "recording",
  posted_on: "date",
  link_tab: "link tab",
  link_label: "link text",
  admins_only: "admins only",
  is_current: "current week",
  show_status: "show status",
};
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });

// Admins only: every change made on this chapter's hub, newest first, with
// "Restore previous version".
export function ChangesTab() {
  const { chapter, data, user } = useBoard();

  if (user.role !== "admin") return null;
  const place = chapter.id === "ucla" ? "UCLA" : "Berkeley";
  const who = (role: string) => `${place} ${chapter.roleLabels[role] ?? role}`;

  return (
    <section>
      <h2>Changes</h2>
      <p>Every change made on the {place} hub, newest first. Only admins see this tab.</p>
      <ActorName />

      {data.changelog.length === 0 && <p>No changes yet.</p>}
      <ul className="log">
        {data.changelog.map((e, i) => (
          <Entry key={e.id} e={e} who={who(e.role)} later={data.changelog.slice(0, i)} />
        ))}
      </ul>
    </section>
  );
}

// "Your name for the log": optional, saved in this browser, sent with each
// change. Everyone with a password shares it, so the log calls it self-reported.
export function ActorName() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => setName(getActor()), []);
  return (
      <div className="note">
        <label htmlFor="actor" className="inline">
          Your name for the log
          <input
            id="actor"
            value={name}
            placeholder="First name"
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            style={{ width: 200 }}
          />
        </label>{" "}
        <button
          type="button"
          className="chip"
          onClick={() => {
            setActor(name);
            setSaved(true);
          }}
        >
          Save
        </button>
        {saved && <span className="msg ok"> Saved in this browser.</span>}
        <p style={{ margin: "8px 0 0" }}>Optional. Everyone shares the password, so this name is self-reported; the change log marks it that way.</p>
      </div>
  );
}

function Entry({ e, who, later }: { e: LogEntry; who: string; later: LogEntry[] }) {
  const { refresh } = useBoard();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Newer changes to the same rows, which restoring would also undo.
  const overlaps = later.filter((l) => l.touches.some((t) => e.touches.includes(t)));

  async function restore() {
    if (!confirm) return setConfirm(true);
    setBusy(true);
    setError("");
    const err = await api(`/api/board/changes/${e.id}`, "POST");
    setBusy(false);
    setConfirm(false);
    if (err) setError(err);
    else refresh();
  }

  return (
    <li className="item">
      <h3>{e.summary}</h3>
      <p>
        {when(e.at)} · {who}
        {e.actor && ` (${e.actor}, self-reported)`}
      </p>
      {e.diffs.length > 0 && (
        <button type="button" className="linkbtn" onClick={() => setOpen(!open)}>
          {open ? "Hide details" : "What changed"}
        </button>
      )}
      {open && (
        <ul className="diffs">
          {e.diffs.map((d, i) => (
            <li key={i}>
              {d.kind === "added" ? "Added" : d.kind === "removed" ? "Removed" : "Changed"} {d.table.replace("board_", "").replace(/s$/, "")} #{d.id}
              {d.fields.map((f) => (
                <div key={f.name} className="diff">
                  <strong>{FIELD[f.name] ?? f.name.replace(/_/g, " ")}:</strong> <span className="was">{f.before || "(empty)"}</span> → {f.after || "(empty)"}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
      {e.restorable && (
        <div className="admin-row">
          <button type="button" className="linkbtn" disabled={busy} onClick={restore}>
            {confirm ? "Click again to restore" : "Restore previous version"}
          </button>
          {confirm && overlaps.length > 0 && (
            <span className="msg err">
              {overlaps.length === 1 ? "A later change" : `${overlaps.length} later changes`} touched the same item; restoring also undoes {overlaps.length === 1 ? "it" : "them"}.
            </span>
          )}
        </div>
      )}
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
