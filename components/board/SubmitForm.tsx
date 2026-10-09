"use client";

import { useRef, useState, type FormEvent } from "react";
import { CURRENT_ROUND } from "@/lib/board/static";
import { MAX_ATTACHMENT_BYTES, NEED_PROOF, OTHER_TASK, TOO_BIG, hasLink } from "@/lib/board/submit-rules";
import { useBoard } from "./BoardApp";
import { api } from "./util";

const short = (s: string) => (s.length > 90 ? `${s.slice(0, 88)}…` : s);

export function SubmitForm({ person, onPerson }: { person: string; onPerson: (p: string) => void }) {
  const { data, refresh } = useBoard();
  const formRef = useRef<HTMLFormElement>(null);
  const [assignment, setAssignment] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const tasks = data.assignments.filter((a) => a.round === CURRENT_ROUND.round && a.person === person);
  const value = tasks.some((t) => String(t.id) === assignment) || assignment === "other" ? assignment : tasks[0] ? String(tasks[0].id) : "other";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = String(form.get("text") ?? "").trim();
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!person) return setStatus({ kind: "err", text: "Choose your name before submitting." });
    if (!files.length && !hasLink(text)) return setStatus({ kind: "err", text: NEED_PROOF });
    if (files.reduce((n, f) => n + f.size, 0) > MAX_ATTACHMENT_BYTES) return setStatus({ kind: "err", text: TOO_BIG });

    form.set("person", person);
    form.set("assignment", value);
    setBusy(true);
    setStatus(null);
    const err = await api("/api/board/submit", "POST", form);
    setBusy(false);
    if (err) return setStatus({ kind: "err", text: err });
    setStatus({
      kind: "ok",
      text: `Sent to Rana${files.length ? ` with ${files.length} file${files.length > 1 ? "s" : ""}` : ""}. It now shows under your name.`,
    });
    formRef.current?.reset();
    refresh();
  }

  return (
    <form className="stack" ref={formRef} onSubmit={submit} noValidate>
      <label htmlFor="f-name">
        Your name
        <select
          id="f-name"
          value={person}
          onChange={(e) => {
            onPerson(e.target.value);
            setAssignment("");
          }}
        >
          <option value="">Choose your name</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.firstName}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="f-task">
        Which assignment
        <select id="f-task" value={person ? value : ""} disabled={!person} onChange={(e) => setAssignment(e.target.value)}>
          {!person && <option value="">Choose your name first</option>}
          {person &&
            tasks.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {short(t.task)}
              </option>
            ))}
          {person && <option value="other">{OTHER_TASK}</option>}
        </select>
      </label>
      <label htmlFor="f-text">
        Notes or written deliverable
        <textarea id="f-text" name="text" placeholder="Paste your write-up, call notes, links, or anything Rana should read." />
      </label>
      <label htmlFor="f-files">
        Proof (required unless you paste a link above): screenshots, docs, call logs. Up to 14 MB in total.
        <input id="f-files" name="files" type="file" multiple />
      </label>
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Submit"}
      </button>
      {status && (
        <p className={`msg ${status.kind}`} role={status.kind === "err" ? "alert" : "status"}>
          {status.text}
        </p>
      )}
    </form>
  );
}
