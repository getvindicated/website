"use client";

import { useId, useState } from "react";
import { isEmail } from "@/lib/board/submit-rules";
import { TABS, type Announcement, type Tab } from "@/lib/board/types";
import { useBoard } from "./BoardApp";
import { api, apiCall, listNames } from "./util";

// Post or edit an announcement (admins only), optionally emailing it to the
// chapter: everyone with an email on file, or only the Hub admins for an
// admins-only one. One email per person.
export function AnnouncementForm({ existing, onClose }: { existing?: Announcement; onClose: () => void }) {
  const { data, today, refresh } = useBoard();
  const uid = useId();
  const [f, setF] = useState({
    title: existing?.title ?? "",
    body: existing?.body ?? "",
    postedOn: existing?.postedOn ?? today,
    linkTab: existing?.linkTab ?? "",
    linkLabel: existing?.linkLabel ?? "",
    adminsOnly: existing?.adminsOnly ?? false,
  });
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
  const audience = data.members.filter((m) => !f.adminsOnly || m.hubAdmin);
  const reach = audience.filter((m) => isEmail(m.email.trim()));
  const missing = audience.filter((m) => !isEmail(m.email.trim()));
  const id = (k: string) => `${uid}-${k}`;

  async function save() {
    setBusy(true);
    setMsg(null);
    const { error, data: r } = existing
      ? await apiCall(`/api/board/announcements/${existing.id}`, "PATCH", f)
      : await apiCall("/api/board/announcements", "POST", f);
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
              {TABS.filter((t) => t !== "changes").map((t: Tab) => (
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
        <label className="check" htmlFor={id("admins")}>
          <input id={id("admins")} type="checkbox" checked={f.adminsOnly} onChange={(e) => set("adminsOnly", e.target.checked)} />
          Board admins only
        </label>
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
          {existing ? "Email the update" : "Email this to everyone"}
          {f.adminsOnly ? " (Hub admins only)" : ""}
        </label>
        {email && (
          <p>
            {reach.length} {reach.length === 1 ? "person" : "people"} will get it, each in their own email.
            {missing.length > 0 && ` No email on file for ${listNames(missing.map((m) => m.name))}, so they won't get it.`}
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
