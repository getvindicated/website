"use client";

import { useRef, useState, type FormEvent } from "react";
import { MAX_ATTACHMENT_BYTES, OTHER_TASK, TOO_BIG, hasLink, isEmail } from "@/lib/board/submit-rules";
import { useBoard } from "./BoardApp";
import { apiCall, listNames } from "./util";

const short = (s: string) => (s.length > 90 ? `${s.slice(0, 88)}…` : s);

export function SubmitForm({ person, onPerson }: { person: string; onPerson: (p: string) => void }) {
  const { chapter, round, data, refresh } = useBoard();
  const formRef = useRef<HTMLFormElement>(null);
  const [assignment, setAssignment] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const tasks = data.assignments.filter((a) => a.round === round?.round && a.person === person);
  const value = tasks.some((t) => String(t.id) === assignment) || assignment === "other" ? assignment : tasks[0] ? String(tasks[0].id) : "other";
  const member = data.members.find((m) => m.firstName === person);
  // Reply-to is the email on file; without one, ask for it.
  const needsEmail = !!member && !isEmail(member.email);
  const { base, tech, techTeams } = data.recipients;
  const goesTo = listNames(member && techTeams.includes(member.team) ? [...base, ...tech] : base);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = String(form.get("text") ?? "").trim();
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!person) return setStatus({ kind: "err", text: "Choose your name before submitting." });
    if (needsEmail && !isEmail(String(form.get("email") ?? "").trim())) {
      return setStatus({ kind: "err", text: "Add your email so they can reply to you." });
    }
    const missing = chapter.proofRequired ? !files.length && !hasLink(text) : !files.length && !text;
    if (missing) return setStatus({ kind: "err", text: chapter.submit.needProof });
    if (files.reduce((n, f) => n + f.size, 0) > MAX_ATTACHMENT_BYTES) return setStatus({ kind: "err", text: TOO_BIG });

    form.set("person", person);
    form.set("assignment", value);
    setBusy(true);
    setStatus(null);
    const { error, data: reply } = await apiCall("/api/board/submit", "POST", form);
    setBusy(false);
    if (error) return setStatus({ kind: "err", text: error });
    const to = Array.isArray(reply?.to) ? listNames(reply.to as string[]) : goesTo;
    setStatus({
      kind: "ok",
      text: `Sent to ${to}${files.length ? ` with ${files.length} file${files.length > 1 ? "s" : ""}` : ""}. It now shows under your name.`,
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
            setStatus(null);
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
      {needsEmail && (
        <label htmlFor="f-email">
          Your email (we don&apos;t have one on file; replies go here)
          <input id="f-email" name="email" type="email" autoComplete="email" required />
        </label>
      )}
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
        <textarea id="f-text" name="text" placeholder={chapter.submit.placeholder} />
      </label>
      <label htmlFor="f-files">
        {chapter.submit.filesLabel}
        <input id="f-files" name="files" type="file" multiple />
      </label>
      {person && <p>This goes to {goesTo}.</p>}
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
