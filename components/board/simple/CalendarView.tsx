"use client";

import { useState, type FormEvent } from "react";
import { CALENDAR_KINDS, timeRange, upcomingDates, type CalendarKind, type ScheduledMeeting } from "@/lib/board/schedule";
import { useBoard } from "../BoardApp";
import { INVITE_TIMEOUT, apiCall, chapterUrl } from "../util";
import { DateBox, dayLabel, useSimple } from "./shared";

// Calendar: meetings, events and socials coming up, soonest first, each with
// "Add to calendar" (.ics). Admins add one (everyone on the board gets a
// calendar invite by email) or cancel one (everyone gets the cancellation).
// Both use the board's invite system.

const KIND_LABEL: Record<CalendarKind, string> = { meeting: "Meeting", event: "Event", social: "Social" };

export function CalendarView() {
  const { data, today } = useBoard();
  const { admin } = useSimple();
  const [adding, setAdding] = useState(false);
  const items = data.scheduled
    .flatMap((m) => upcomingDates(m, today).map((date) => ({ m, date })))
    .sort((a, b) => a.date.localeCompare(b.date) || a.m.startTime.localeCompare(b.m.startTime));

  return (
    <section aria-labelledby="h-cal">
      <h2 id="h-cal">Coming up</h2>
      {admin && !adding && (
        <div className="row-btns" style={{ marginTop: 0, marginBottom: 12 }}>
          <button type="button" className="b" onClick={() => setAdding(true)}>
            Add to calendar
          </button>
        </div>
      )}
      {adding && <AddForm onDone={() => setAdding(false)} />}
      {items.length === 0 && <p className="empty">Nothing on the calendar yet.</p>}
      {items.map(({ m, date }) => (
        <Item key={`${m.id}-${date}`} m={m} date={date} />
      ))}
    </section>
  );
}

function Item({ m, date }: { m: ScheduledMeeting; date: string }) {
  const { refresh } = useBoard();
  const { admin, toast } = useSimple();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const kind = m.kind ?? "meeting";

  async function cancel() {
    setBusy(true);
    const path = `/api/board/schedule/${m.id}${m.weekly ? `?date=${date}` : ""}`;
    const { error, data } = await apiCall(path, "DELETE", undefined, INVITE_TIMEOUT);
    setBusy(false);
    setConfirm(false);
    if (error) return toast(error);
    toast(`Cancelled. ${Number(data?.cancelled ?? 0)} ${Number(data?.cancelled) === 1 ? "person was" : "people were"} told.`);
    refresh();
  }

  return (
    <div className="card">
      <div className="when">
        <DateBox iso={date} />
        <div className="when-text">
          <div className="kind">{KIND_LABEL[kind].toUpperCase()}</div>
          <h3>{m.title}</h3>
          <p style={{ margin: "2px 0 0" }}>{[dayLabel(date), timeRange(m.startTime, m.endTime), m.location].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      {confirm ? (
        <div className="panel">
          <p>
            <b>Cancel {m.title}?</b> Everyone invited gets an email and it comes off their calendar.
          </p>
          <div className="row-btns">
            <button type="button" className="b danger" disabled={busy} onClick={cancel}>
              {busy ? "Cancelling…" : "Yes, cancel it"}
            </button>
            <button type="button" className="b soft" disabled={busy} onClick={() => setConfirm(false)}>
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="row-btns">
          <a className="b soft" href={chapterUrl(`/api/board/schedule/${m.id}/ics`)} download>
            Add to calendar
          </a>
          {admin && (
            <button type="button" className="b soft" onClick={() => setConfirm(true)}>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddForm({ onDone }: { onDone: () => void }) {
  const { today, refresh } = useBoard();
  const { toast } = useSimple();
  const [f, setF] = useState({ kind: "meeting" as CalendarKind, date: today, title: "", startTime: "18:00", endTime: "19:00", location: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) return setError("Say what it is.");
    setBusy(true);
    setError("");
    const { error: err, data } = await apiCall(
      "/api/board/schedule",
      "POST",
      { ...f, notes: "", weekly: false, until: null, invite: { kind: "all" } },
      INVITE_TIMEOUT,
    );
    setBusy(false);
    if (err) return setError(err);
    toast(`Added. Invites went to ${Number(data?.sent ?? 0)} people.`);
    onDone();
    refresh();
  }

  return (
    <form className="panel" onSubmit={add} noValidate>
      <div className="pair">
        <label className="f" htmlFor="cal-kind">
          Type
          <select id="cal-kind" value={f.kind} onChange={(e) => set("kind", e.target.value as CalendarKind)}>
            {CALENDAR_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="f" htmlFor="cal-date">
          Date
          <input id="cal-date" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} />
        </label>
      </div>
      <label className="f" htmlFor="cal-title">
        What
        <input id="cal-title" type="text" value={f.title} maxLength={200} placeholder="Board meeting" onChange={(e) => set("title", e.target.value)} />
      </label>
      <div className="pair">
        <label className="f" htmlFor="cal-start">
          Starts
          <input id="cal-start" type="time" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} />
        </label>
        <label className="f" htmlFor="cal-end">
          Ends
          <input id="cal-end" type="time" value={f.endTime} onChange={(e) => set("endTime", e.target.value)} />
        </label>
      </div>
      <label className="f" htmlFor="cal-where">
        Where
        <input id="cal-where" type="text" value={f.location} maxLength={500} onChange={(e) => set("location", e.target.value)} />
      </label>
      <p className="muted">Everyone on the board gets a calendar invite by email.</p>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <div className="row-btns">
        <button type="submit" className="b" disabled={busy}>
          {busy ? "Sending…" : "Add and send invites"}
        </button>
        <button type="button" className="b soft" disabled={busy} onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
