"use client";

import { useId, useState } from "react";
import { isEmail } from "@/lib/board/submit-rules";
import { ADMIN_TABS, TABS, type Announcement, type Tab } from "@/lib/board/types";
import { EVERYONE, inAudience, type Audience } from "@/lib/board/audience";
import { useBoard } from "./BoardApp";
import { api, apiCall, listNames } from "./util";

type Kind = Audience["kind"];
const KINDS: [Kind, string][] = [
  ["everyone", "Everyone"],
  ["leads", "Leads only"],
  ["hubAdmins", "Hub admins"],
  ["teams", "A team"],
  ["people", "Pick people"],
];

// Post or edit an announcement (admins only). "Send to" picks who sees it
// on the hub and, if emailed, who gets it: one email per person.
export function AnnouncementForm({ existing, onClose }: { existing?: Announcement; onClose: () => void }) {
  const { data, today, refresh } = useBoard();
  const uid = useId();
  const [f, setF] = useState({
    title: existing?.title ?? "",
    body: existing?.body ?? "",
    postedOn: existing?.postedOn ?? today,
    linkTab: existing?.linkTab ?? "",
    linkLabel: existing?.linkLabel ?? "",
  });
  const start = existing?.audience ?? EVERYONE;
  const [kind, setKind] = useState<Kind>(start.kind);
  const [teams, setTeams] = useState<string[]>(start.kind === "teams" ? start.teams : []);
  const [ids, setIds] = useState<number[]>(start.kind === "people" ? start.ids : []);
  const [search, setSearch] = useState("");
  // On by default for a new announcement, off for an edit.
  const [email, setEmail] = useState(!existing);
  const [testTo, setTestTo] = useState(data.organizerEmail ?? "");
  const [confirming, setConfirming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setConfirming(false);
  };
  const touch = () => setConfirming(false);
  const target: Audience | null =
    kind === "teams" ? (teams.length ? { kind, teams } : null) : kind === "people" ? (ids.length ? { kind, ids } : null) : { kind };
  const audience = target ? data.members.filter((m) => inAudience(m, target)) : [];
  const reach = audience.filter((m) => isEmail(m.email.trim()));
  const missing = audience.filter((m) => !isEmail(m.email.trim()));
  const allTeams = ["Executive", ...data.settings.teams];
  const q = search.trim().toLowerCase();
  const found = data.members.filter((m) => !q || `${m.name} ${m.role} ${m.team}`.toLowerCase().includes(q));
  const toggle = <T,>(list: T[], v: T, on: boolean) => (on ? [...list, v] : list.filter((x) => x !== v));
  const id = (k: string) => `${uid}-${k}`;

  async function save() {
    setBusy(true);
    setMsg(null);
    const payload = { ...f, audience: target };
    const { error, data: r } = existing
      ? await apiCall(`/api/board/announcements/${existing.id}`, "PATCH", payload)
      : await apiCall("/api/board/announcements", "POST", payload);
    if (error) {
      setBusy(false);
      setConfirming(false);
      return setMsg({ kind: "err", text: error });
    }
    const annId = existing?.id ?? (r?.id as number);
    if (email) {
      const sent = await apiCall(`/api/board/announce-email/${annId}`, "POST", { kind: existing ? "update" : "post" });
      setBusy(false);
      setConfirming(false);
      refresh();
      if (sent.error) return setMsg({ kind: "err", text: `Saved, but the email didn't go out: ${sent.error}` });
      const failed = (sent.data?.failed as string[]) ?? [];
      setMsg({
        kind: failed.length ? "err" : "ok",
        text: `Saved and emailed to ${sent.data?.sent} ${sent.data?.sent === 1 ? "person" : "people"}.${failed.length ? ` It didn't reach ${failed.join(", ")}; use Retry on the announcement.` : ""}`,
      });
      if (!failed.length) setTimeout(onClose, 1200);
      return;
    }
    setBusy(false);
    refresh();
    onClose();
  }

  async function test() {
    setBusy(true);
    setMsg(null);
    const err = await api("/api/board/announce-test", "POST", { to: testTo, title: f.title, body: f.body, update: !!existing });
    setBusy(false);
    setMsg(err ? { kind: "err", text: err } : { kind: "ok", text: `Test sent to ${testTo}.` });
  }

  async function remove() {
    if (!existing) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    const err = await api(`/api/board/announcements/${existing.id}`, "DELETE");
    setBusy(false);
    if (err) return setMsg({ kind: "err", text: err });
    refresh();
    onClose();
  }

  return (
    <div className="card">
      <h3>{existing ? `Edit ${existing.title}` : "Post an announcement"}</h3>
      <form
        className="stack wide"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.title.trim()) return setMsg({ kind: "err", text: "Add a title." });
          if (!target) return setMsg({ kind: "err", text: kind === "teams" ? "Choose at least one team." : "Choose at least one person." });
          if (email && reach.length === 0) return setMsg({ kind: "err", text: "No one it would go to has an email on file." });
          if (email && !confirming) return setConfirming(true);
          save();
        }}
      >
        <label htmlFor={id("title")}>
          Title
          <input id={id("title")} value={f.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label htmlFor={id("body")}>
          Text
          <textarea id={id("body")} value={f.body} onChange={(e) => set("body", e.target.value)} />
        </label>
        <div className="pair">
          <label htmlFor={id("date")}>
            Date
            <input id={id("date")} type="date" value={f.postedOn} onChange={(e) => set("postedOn", e.target.value)} />
          </label>
          <label htmlFor={id("tab")}>
            Link to a tab
            <select id={id("tab")} value={f.linkTab} onChange={(e) => set("linkTab", e.target.value)}>
              <option value="">No link</option>
              {TABS.filter((t) => !ADMIN_TABS.includes(t)).map((t: Tab) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        {f.linkTab && (
          <label htmlFor={id("label")}>
            Link text
            <input id={id("label")} value={f.linkLabel} placeholder="Open" onChange={(e) => set("linkLabel", e.target.value)} />
          </label>
        )}
        <fieldset className="send-to">
          <legend>Send to</legend>
          <div className="admin-row">
            {KINDS.map(([k, label]) => (
              <label key={k} className="check" htmlFor={id(`to-${k}`)}>
                <input
                  id={id(`to-${k}`)}
                  type="radio"
                  name={id("to")}
                  checked={kind === k}
                  onChange={() => {
                    setKind(k);
                    touch();
                  }}
                />
                {label}
              </label>
            ))}
          </div>
          {kind === "leads" && <p>Everyone marked Lead on the Board tab, plus the top two rows of the chart.</p>}
          {kind === "hubAdmins" && <p>Members ticked Hub admin. On the hub, only admin sign-ins see it.</p>}
          {kind === "teams" && (
            <div className="admin-row">
              {allTeams.map((t) => (
                <label key={t} className="check" htmlFor={id(`team-${t}`)}>
                  <input
                    id={id(`team-${t}`)}
                    type="checkbox"
                    checked={teams.includes(t)}
                    onChange={(e) => {
                      setTeams(toggle(teams, t, e.target.checked));
                      touch();
                    }}
                  />
                  {t}
                </label>
              ))}
            </div>
          )}
          {kind === "people" && (
            <div className="pick-people">
              <input type="search" aria-label="Search members" placeholder="Search by name, role or team" value={search} onChange={(e) => setSearch(e.target.value)} />
              <ul>
                {found.map((m) => (
                  <li key={m.id}>
                    <label className="check" htmlFor={id(`p-${m.id}`)}>
                      <input
                        id={id(`p-${m.id}`)}
                        type="checkbox"
                        checked={ids.includes(m.id)}
                        onChange={(e) => {
                          setIds(toggle(ids, m.id, e.target.checked));
                          touch();
                        }}
                      />
                      {m.name} · {m.role}
                    </label>
                  </li>
                ))}
                {found.length === 0 && <li>No one matches.</li>}
              </ul>
            </div>
          )}
        </fieldset>
        <label className="check" htmlFor={id("email")}>
          <input
            id={id("email")}
            type="checkbox"
            checked={email}
            onChange={(e) => {
              setEmail(e.target.checked);
              setConfirming(false);
            }}
          />
          {existing ? "Email the update" : "Email it"}
        </label>
        {target && (
          <p className="reach" role="status">
            {email
              ? `Sending to ${reach.length} ${reach.length === 1 ? "person" : "people"}${reach.length ? `: ${listNames(reach.map((m) => m.name))}` : ""}. Each gets their own email.`
              : `For ${audience.length} ${audience.length === 1 ? "person" : "people"}${audience.length ? `: ${listNames(audience.map((m) => m.name))}` : ""}.`}
            {email && missing.length > 0 && ` No email on file for ${listNames(missing.map((m) => m.name))}, so they won't get it.`}
          </p>
        )}

        {confirming ? (
          <div className="admin-row confirm">
            <strong>
              Send to {reach.length} {reach.length === 1 ? "person" : "people"}?
            </strong>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Yes, save and send"}
            </button>
            <button className="btn btn-line" type="button" disabled={busy} onClick={() => setConfirming(false)}>
              Not yet
            </button>
          </div>
        ) : (
          <div className="admin-row">
            <button className="btn" type="submit" disabled={busy}>
              {email ? "Save and email" : existing ? "Save" : "Post"}
            </button>
            <button className="btn btn-line" type="button" onClick={onClose}>
              Cancel
            </button>
            {existing && (
              <button className="chip" type="button" disabled={busy} onClick={remove} style={{ marginLeft: "auto" }}>
                {confirmDelete ? "Click again to delete (no email is sent)" : "Delete"}
              </button>
            )}
          </div>
        )}

        <div className="pair test-invite">
          <label htmlFor={id("test")}>
            Send a test to
            <input id={id("test")} type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
          </label>
          <button className="btn btn-line" type="button" disabled={busy || !isEmail(testTo.trim()) || !f.title.trim()} onClick={test}>
            Send me a test
          </button>
        </div>
        {msg && (
          <p className={`msg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>
            {msg.text}
          </p>
        )}
      </form>
    </div>
  );
}
