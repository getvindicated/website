"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Assignment, Member } from "@/lib/board/types";
import { MAX_ATTACHMENT_BYTES, TOO_BIG, isEmail } from "@/lib/board/submit-rules";
import { useBoard } from "../BoardApp";
import { apiCall, listNames } from "../util";
import { useSimple } from "./shared";

// "Submit: {task}": a link, a note and/or a file. It goes through the same
// submission route as the classic hub, which stores it, emails the chapter's
// submission recipients and marks the task done.
export function SubmitSheet({ task, me, onClose }: { task: Assignment; me: Member; onClose: () => void }) {
  const { chapter, data, refresh } = useBoard();
  const { toast } = useSimple();
  const ref = useRef<HTMLDialogElement>(null);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const needsEmail = !isEmail(me.email.trim());
  const to = listNames(data.recipients.base) || chapter.contact;

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = [link.trim(), note.trim()].filter(Boolean).join("\n\n");
    if (!text && files.length === 0) return setError(chapter.submit.needProof);
    if (link.trim() && !/^https?:\/\/\S+$/.test(link.trim())) return setError("Links start with http:// or https://.");
    if (files.reduce((n, f) => n + f.size, 0) > MAX_ATTACHMENT_BYTES) return setError(TOO_BIG);
    if (needsEmail && !isEmail(email.trim())) return setError("Add your email so they can reply to you.");
    const form = new FormData();
    form.append("person", me.firstName);
    form.append("assignment", String(task.id));
    form.append("text", text);
    if (needsEmail) form.append("email", email.trim());
    for (const f of files) form.append("files", f);
    setBusy(true);
    setError("");
    const { error: err } = await apiCall("/api/board/submit", "POST", form, { ms: 90_000, error: "The submission didn't go through. Try again." });
    setBusy(false);
    if (err) return setError(err);
    ref.current?.close();
    toast(`Submitted! ${to} got an email.`);
    refresh();
  }

  return (
    <dialog ref={ref} className="sheet" onClose={onClose} aria-labelledby="submit-title">
      <form onSubmit={submit} noValidate>
        <h2 id="submit-title">Submit: {task.task}</h2>
        <p className="muted">{chapter.submit.note}</p>
        <label className="f" htmlFor="sub-link">
          Link (optional)
          <input id="sub-link" type="url" inputMode="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
        </label>
        <label className="f" htmlFor="sub-note">
          Note (optional)
          <textarea id="sub-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <label className="f" htmlFor="sub-file">
          File (optional)
          <input id="sub-file" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          <span className="hint">Up to 14 MB in total.</span>
        </label>
        {needsEmail && (
          <label className="f" htmlFor="sub-email">
            Your email
            <input id="sub-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <span className="hint">There&apos;s no email on file for you, so {to} can reply here.</span>
          </label>
        )}
        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
        <div className="row-btns">
          <button type="submit" className="b" disabled={busy}>
            {busy ? "Submitting…" : "Submit"}
          </button>
          <button type="button" className="b soft" disabled={busy} onClick={() => ref.current?.close()}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}
