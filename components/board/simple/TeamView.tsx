"use client";

import { useState, type FormEvent } from "react";
import type { Member } from "@/lib/board/types";
import { isEmail } from "@/lib/board/submit-rules";
import { useBoard } from "../BoardApp";
import { ImportMembers } from "../ImportMembers";
import { apiCall } from "../util";
import { useSimple } from "./shared";

// Team: everyone on the board under their team, with Email and Call
// buttons. Admins edit people and can replace the whole list from the
// member file (no contact info lives in the code).
export function TeamView() {
  const { data, chapter, refresh } = useBoard();
  const { admin, toast } = useSimple();
  const [replacing, setReplacing] = useState(false);
  const order = chapter.simple?.teamOrder ?? ["Executive", ...data.settings.teams];
  const groups = [...order, ...new Set(data.members.map((m) => m.team).filter((t) => !order.includes(t)))];
  const emails = data.members.map((m) => m.email.trim()).filter((e) => isEmail(e));

  async function copy() {
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      toast(`Copied ${emails.length} ${emails.length === 1 ? "email" : "emails"}.`);
    } catch {
      toast("Your browser didn't allow copying.");
    }
  }

  return (
    <section aria-labelledby="h-team">
      <h2 id="h-team">The board</h2>
      <div className="row-btns" style={{ marginTop: 0 }}>
        <button type="button" className="b soft" disabled={emails.length === 0} onClick={copy}>
          Copy everyone&apos;s emails
        </button>
        {admin && !replacing && (
          <button type="button" className="b soft" onClick={() => setReplacing(true)}>
            Replace the member list
          </button>
        )}
      </div>
      {admin && replacing && (
        <div className="panel">
          <ImportMembers
            replacing={{ count: data.members.length, onCancel: () => setReplacing(false) }}
            onLoaded={(n) => {
              setReplacing(false);
              toast(`Loaded ${n} members.`);
              refresh();
            }}
          />
        </div>
      )}
      {data.members.length === 0 && <p className="empty">No one is on the list yet.</p>}
      {groups.map((g) => {
        const people = data.members.filter((m) => m.team === g);
        if (!people.length) return null;
        return (
          <div key={g}>
            <h3 className="team-head">{g}</h3>
            {people.map((m) => (
              <Person key={m.id} m={m} />
            ))}
          </div>
        );
      })}
    </section>
  );
}

function Person({ m }: { m: Member }) {
  const { admin } = useSimple();
  const [editing, setEditing] = useState(false);
  if (editing) return <PersonForm m={m} onDone={() => setEditing(false)} />;
  const phone = m.phone.replace(/[^\d+]/g, "");
  return (
    <div className="card person-card">
      <h3>{m.name}</h3>
      <p className="role" style={{ margin: 0 }}>
        {m.role}
      </p>
      {(isEmail(m.email.trim()) || phone || admin) && (
        <div className="row-btns">
          {isEmail(m.email.trim()) && (
            <a className="b soft" href={`mailto:${m.email.trim()}`}>
              Email
            </a>
          )}
          {phone && (
            <a className="b soft" href={`tel:${phone}`}>
              Call
            </a>
          )}
          {admin && (
            <button type="button" className="b soft" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PersonForm({ m, onDone }: { m: Member; onDone: () => void }) {
  const { data, refresh } = useBoard();
  const { toast } = useSimple();
  const teams = ["Executive", ...data.settings.teams];
  const [f, setF] = useState({ name: m.name, role: m.role, team: m.team, email: m.email, phone: m.phone, hubAdmin: m.hubAdmin });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const id = (k: string) => `p${m.id}-${k}`;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return setError("Add their name.");
    if (f.email.trim() && !isEmail(f.email.trim())) return setError("Check the email.");
    setBusy(true);
    setError("");
    const { error: err } = await apiCall(`/api/board/members/${m.id}`, "PATCH", f);
    setBusy(false);
    if (err) return setError(err);
    toast("Saved.");
    onDone();
    refresh();
  }

  return (
    <form className="panel" onSubmit={save} noValidate>
      <label className="f" htmlFor={id("name")}>
        Name
        <input id={id("name")} type="text" value={f.name} onChange={(e) => set("name", e.target.value)} />
      </label>
      <div className="pair">
        <label className="f" htmlFor={id("role")}>
          Role
          <input id={id("role")} type="text" value={f.role} onChange={(e) => set("role", e.target.value)} />
        </label>
        <label className="f" htmlFor={id("team")}>
          Team
          <select id={id("team")} value={f.team} onChange={(e) => set("team", e.target.value)}>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="pair">
        <label className="f" htmlFor={id("email")}>
          Email
          <input id={id("email")} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </label>
        <label className="f" htmlFor={id("phone")}>
          Phone
          <input id={id("phone")} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={f.hubAdmin} onChange={(e) => set("hubAdmin", e.target.checked)} />
        Hub admin (gets admins-only announcements)
      </label>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <div className="row-btns">
        <button type="submit" className="b" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button type="button" className="b soft" disabled={busy} onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
