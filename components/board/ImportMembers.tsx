"use client";

import { useState, type ChangeEvent } from "react";
import { useBoard } from "./BoardApp";
import { api } from "./util";

// Admin-only: loads the member list from board-members.local.json. It isn't
// in the code because it has phone numbers.
export function ImportMembers() {
  const { refresh } = useBoard();
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setStatus(null);
    let members: unknown;
    try {
      const parsed = JSON.parse(await file.text());
      members = Array.isArray(parsed) ? parsed : parsed?.members;
    } catch {
      return setStatus({ kind: "err", text: "That file isn't the member list. Choose board-members.local.json." });
    }
    setBusy(true);
    const err = await api("/api/board/import-members", "POST", { members });
    setBusy(false);
    if (err) return setStatus({ kind: "err", text: err });
    setStatus({ kind: "ok", text: "Members loaded." });
    refresh();
  }

  return (
    <div className="note">
      <p>
        <strong>The member list isn&apos;t loaded yet.</strong> Choose the file that Claude sent you,{" "}
        <strong>board-members.local.json</strong>. It has everyone&apos;s names, roles, emails and phone numbers.
      </p>
      <label htmlFor="import-members" className="check">
        <input id="import-members" type="file" accept=".json,application/json" disabled={busy} onChange={onFile} />
      </label>
      {busy && <p className="msg">Loading…</p>}
      {status && (
        <p className={`msg ${status.kind}`} role={status.kind === "err" ? "alert" : "status"}>
          {status.text}
        </p>
      )}
    </div>
  );
}
