"use client";

import { useState, type ChangeEvent } from "react";

type Status = { kind: "ok" | "err" | "busy"; text: string };

// Reads a chosen file as text. Uses FileReader when Blob.text isn't there
// (older Safari).
function readText(file: File): Promise<string> {
  if (typeof file.text === "function") return file.text();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

// Posts the list. Returns an error message, or null when it saved.
async function send(members: unknown[]): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch("/api/board/import-members", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ members }),
    });
  } catch {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (res.ok) return null;
  const j = await res.json().catch(() => null);
  if (j && typeof j.error === "string") return j.error;
  if (res.status === 404)
    return "Your sign-in has expired or isn't the admin one. Sign out, sign in again, and retry.";
  return `The server couldn't save the members (error ${res.status}). Try again; if it keeps happening, tell Claude.`;
}

// Admin-only: loads the member list from board-members.local.json. It isn't
// in the code because it has phone numbers. `onLoaded` runs after a
// successful import, so the Board tab can say so once this box is gone.
export function ImportMembers({
  onLoaded,
}: {
  onLoaded: (count: number) => void;
}) {
  const [status, setStatus] = useState<Status | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file)
      return setStatus({ kind: "err", text: "No file was chosen. Try again." });
    setStatus({ kind: "busy", text: `Reading ${file.name}…` });
    try {
      let members: unknown;
      try {
        const parsed = JSON.parse(
          (await readText(file)).replace(/^\uFEFF/, ""),
        );
        members = Array.isArray(parsed) ? parsed : parsed?.members;
      } catch {
        return setStatus({
          kind: "err",
          text: `${file.name} isn't the member list. Choose board-members.local.json.`,
        });
      }
      if (!Array.isArray(members) || members.length === 0) {
        return setStatus({
          kind: "err",
          text: `${file.name} doesn't have a member list in it. Choose board-members.local.json.`,
        });
      }
      setStatus({ kind: "busy", text: `Loading ${members.length} members…` });
      const err = await send(members);
      if (err) return setStatus({ kind: "err", text: err });
      const count = members.length;
      setStatus({ kind: "ok", text: `Loaded ${count} members.` });
      onLoaded(count);
    } catch {
      setStatus({
        kind: "err",
        text: "Something went wrong reading that file. Try again.",
      });
    } finally {
      input.value = "";
    }
  }

  const busy = status?.kind === "busy";
  return (
    <div className="note">
      <p>
        <strong>The member list isn&apos;t loaded yet.</strong> Choose the file
        that Claude sent you, <strong>board-members.local.json</strong>. It has
        everyone&apos;s names, roles, emails and phone numbers.
      </p>
      <label htmlFor="import-members" className="check">
        {/* No `accept` filter: phones often label .json files as plain data and grey them out. */}
        <input
          id="import-members"
          type="file"
          disabled={busy}
          onChange={onFile}
        />
      </label>
      {status && (
        <p
          className={`msg ${status.kind === "busy" ? "" : status.kind}`}
          role={status.kind === "err" ? "alert" : "status"}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
