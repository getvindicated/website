"use client";

import { useId, useState, type FormEvent } from "react";
import type { ScheduledMeeting } from "@/lib/board/schedule";
import { isEmail } from "@/lib/board/submit-rules";
import { useBoard } from "./BoardApp";
import { INVITE_TIMEOUT, apiCall, listNames } from "./util";

type Kind = "all" | "team" | "people";

// Schedule a meeting with calendar invites, or edit one (admins only).
// Separate from logging a past meeting.
export function ScheduleForm({ existing, onClose }: { existing?: ScheduledMeeting; onClose: () => void }) {
  const { chapter, data, today, refresh } = useBoard();
  const uid = useId();
  const members = data.members;
  const teams = ["Executive", ...data.settings.teams];

  // Prefill who's invited from what was saved.
  const initialKind: Kind = !existing ? "all" : existing.audience === "Whole board" ? "all" : existing.audience.endsWith(" team") ? "team" : "people";
  const invitedEmails = new Set((existing?.invitees ?? []).map((i) => i.email.toLowerCase()));

  const [f, setF] = useState({
    title: existing?.title ?? `${chapter.id === "ucla" ? "UCLA" : "Berkeley"} board meeting`,
    date: existing?.date ?? today,
    startTime: existing?.startTime ?? "18:00",
    endTime: existing?.endTime ?? "18:30",
    location: existing?.location ?? "",
    notes: existing?.notes ?? "",
    weekly: existing?.weekly ?? false,
    until: existing?.until ?? "",
  });
  const [kind, setKind] = useState<Kind>(initialKind);
  const [team, setTeam] = useState(initialKind === "team" ? existing!.audience.replace(/ team$/, "") : teams[1] ?? teams[0]);
  const [people, setPeople] = useState<Set<number>>(
    () => new Set(initialKind === "people" ? members.filter((m) => invitedEmails.has(m.email.trim().toLowerCase())).map((m) => m.id) : []),
  );
  const [testTo, setTestTo] = useState(data.organizerEmail ?? "");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const set = (k: keyof typeof f, v: string | boolean) => {
    setF((x) => ({ ...x, [k]: v }));
    setConfirming(false);
  };
  const picked = members.filter((m) =>
    kind === "all" ? true : kind === "team" ? m.team === team || m.alsoTeam === team : people.has(m.id),
  );
  const reachable = picked.filter((m) => isEmail(m.email.trim()));
  const noEmail = picked.filter((m) => !isEmail(m.email.trim()));
  const invite = kind === "all" ? { kind } : kind === "team" ? { kind, team } : { kind, ids: [...people] };
  const body = { ...f, until: f.weekly ? f.until : null, invite };

  async function send(test: boolean) {
    setBusy(true);
    setMsg(null);
    const path = existing ? `/api/board/schedule/${existing.id}` : "/api/board/schedule";
    const { error, data: r } = await apiCall(
      test ? "/api/board/schedule" : path,
      test || !existing ? "POST" : "PATCH",
      test ? { ...body, test: testTo } : body,
      INVITE_TIMEOUT,
    );
    setBusy(false);
    setConfirming(false);
    if (error) {
      // A meeting can be saved even when its invites failed; show it so it
      // can be resent.
      if (!test) refresh();
      return setMsg({ kind: "err", text: error });
    }
    if (test) return setMsg({ kind: "ok", text: `Test invite sent to ${testTo}.` });
    const failed = (r?.failed as string[] | undefined) ?? [];
    const sent = Number(r?.sent ?? 0);
    const cancelled = Number(r?.cancelled ?? 0);
    setMsg({
      kind: failed.length ? "err" : "ok",
      text:
        `${existing ? "Updated invites" : "Invites"} sent to ${sent} ${sent === 1 ? "person" : "people"}` +
        (cancelled ? `; ${cancelled} taken off the invite got a cancellation` : "") +
        "." +
        (failed.length ? ` These didn't go through: ${failed.join(", ")}.` : ""),
    });
    refresh();
    if (!failed.length) setTimeout(onClose, 1500);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (reachable.length === 0) return setMsg({ kind: "err", text: "No one you picked has an email on file." });
    setConfirming(true);
  }

  const id = (k: string) => `${uid}-${k}`;
  return (
    <div className="card">
    <form className="stack wide" onSubmit={submit} noValidate>
      <h3>{existing ? `Edit ${existing.title}` : "Schedule a meeting"}</h3>
      <p>Everyone invited gets an email with Yes, Maybe and No buttons that add it to their calendar.</p>
      <label htmlFor={id("title")}>
        Title
        <input id={id("title")} value={f.title} onChange={(e) => set("title", e.target.value)} />
      </label>
      <div className="pair">
        <label htmlFor={id("date")}>
          Date
          <input id={id("date")} type="date" value={f.date} onChange={(e) => set("date", e.target.value)} />
        </label>
        <div className="pair">
          <label htmlFor={id("start")}>
            Starts
            <input id={id("start")} type="time" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} />
          </label>
          <label htmlFor={id("end")}>
            Ends
            <input id={id("end")} type="time" value={f.endTime} onChange={(e) => set("endTime", e.target.value)} />
          </label>
        </div>
      </div>
      <label htmlFor={id("where")}>
        Location or Zoom link
        <input id={id("where")} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Room, address or https://…" />
      </label>
      <label htmlFor={id("notes")}>
        Notes
        <textarea id={id("notes")} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="What to bring or prepare" />
      </label>
      <label className="check" htmlFor={id("weekly")}>
        <input id={id("weekly")} type="checkbox" checked={f.weekly} onChange={(e) => set("weekly", e.target.checked)} />
        Repeats weekly
      </label>
      {f.weekly && (
        <label htmlFor={id("until")}>
          Last date
          <input id={id("until")} type="date" value={f.until} min={f.date} onChange={(e) => set("until", e.target.value)} />
        </label>
      )}

      <fieldset className="stack">
        <legend>Who to invite</legend>
        <label className="check">
          <input type="radio" name={id("kind")} checked={kind === "all"} onChange={() => (setKind("all"), setConfirming(false))} />
          The whole board
        </label>
        <label className="check">
          <input type="radio" name={id("kind")} checked={kind === "team"} onChange={() => (setKind("team"), setConfirming(false))} />
          One team
        </label>
        {kind === "team" && (
          <select aria-label="Team" value={team} onChange={(e) => (setTeam(e.target.value), setConfirming(false))}>
            {teams.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        )}
        <label className="check">
          <input type="radio" name={id("kind")} checked={kind === "people"} onChange={() => (setKind("people"), setConfirming(false))} />
          Pick members
        </label>
        {kind === "people" && (
          <div className="pick-list">
            {members.map((m) => (
              <label key={m.id} className="check">
                <input
                  type="checkbox"
                  checked={people.has(m.id)}
                  onChange={(e) => {
                    const n = new Set(people);
                    if (e.target.checked) n.add(m.id);
                    else n.delete(m.id);
                    setPeople(n);
                    setConfirming(false);
                  }}
                />
                {m.name}
              </label>
            ))}
          </div>
        )}
        <p>
          {reachable.length} {reachable.length === 1 ? "person" : "people"} will get the invite.
          {noEmail.length > 0 && ` No email on file for ${listNames(noEmail.map((m) => m.name))}, so they won't get one.`}
        </p>
      </fieldset>

      {confirming ? (
        <div className="admin-row confirm">
          <strong>
            Send {existing ? "updated invites" : "invites"} to {reachable.length} {reachable.length === 1 ? "person" : "people"}?
          </strong>
          <button className="btn" type="button" disabled={busy} onClick={() => send(false)}>
            {busy ? "Sending…" : "Yes, send"}
          </button>
          <button className="btn btn-line" type="button" disabled={busy} onClick={() => setConfirming(false)}>
            Not yet
          </button>
        </div>
      ) : (
        <div className="admin-row">
          <button className="btn" type="submit" disabled={busy}>
            {existing ? "Save and send updates" : "Send invites"}
          </button>
          <button className="btn btn-line" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      )}

      <div className="pair test-invite">
        <label htmlFor={id("test")}>
          Send a test invite to
          <input id={id("test")} type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
        </label>
        <button className="btn btn-line" type="button" disabled={busy || !isEmail(testTo.trim())} onClick={() => send(true)}>
          Send me a test invite
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
