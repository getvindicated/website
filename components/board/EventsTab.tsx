"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import type { AdminEvent } from "@/lib/events/types";
import { longDate, timeRange } from "@/lib/board/schedule";
import { useBoard } from "./BoardApp";
import { INVITE_TIMEOUT, apiCall, chapterUrl, photoSrc } from "./util";

// Admins only: the chapter's public events (the /events page) with their
// RSVPs. RSVP names and emails are shown here and nowhere public.

type Form = {
  title: string;
  tag: string;
  date: string;
  startTime: string;
  endTime: string;
  online: boolean;
  meetingLink: string;
  address: string;
  hostName: string;
  hostTitle: string;
  description: string;
  flyerId: number | null;
  showCount: boolean;
};

const blank = (tag: string): Form => ({
  title: "",
  tag,
  date: "",
  startTime: "18:00",
  endTime: "19:00",
  online: true,
  meetingLink: "",
  address: "",
  hostName: "",
  hostTitle: "",
  description: "",
  flyerId: null,
  showCount: false,
});

const toForm = (e: AdminEvent): Form => ({
  title: e.title,
  tag: e.tag,
  date: e.date,
  startTime: e.startTime,
  endTime: e.endTime,
  online: e.online,
  meetingLink: e.meetingLink,
  address: e.address,
  hostName: e.hostName,
  hostTitle: e.hostTitle,
  description: e.description,
  flyerId: e.flyerId,
  showCount: e.showCount,
});

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

export function EventsTab() {
  const { chapter } = useBoard();
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<number | "new" | null>(null);

  const load = useCallback(async () => {
    const { error, data } = await apiCall("/api/board/events", "GET");
    if (error) return setLoadError(error);
    setLoadError("");
    setEvents((data?.events as AdminEvent[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upcoming = events?.filter((e) => !e.past).reverse() ?? [];
  const past = events?.filter((e) => e.past) ?? [];

  return (
    <section>
      <h2>Events</h2>
      <p>
        Public workshops and meetups on the <a href="/en/events">Events page</a>. Only admins see this tab. RSVP names and
        emails stay here; the page only shows a count, and only for events with &ldquo;Show RSVP count&rdquo; on. Meeting
        links are private: they only go out in RSVP confirmations and reminders.
      </p>
      {editing === "new" ? (
        <EventForm chapterTitle={chapter.title} initial={blank(chapter.id === "ucla" ? "Workshop · UCLA" : "Workshop · UC Berkeley")} onDone={(saved) => (setEditing(null), saved && load())} />
      ) : (
        <div className="admin-row">
          <button type="button" className="btn" onClick={() => setEditing("new")}>
            Add an event
          </button>
        </div>
      )}
      {loadError && (
        <p className="msg err" role="alert">
          {loadError}
        </p>
      )}
      {events === null && !loadError && <p>Loading…</p>}
      {events && (
        <>
          <h3>Upcoming</h3>
          {upcoming.length === 0 && <p>No upcoming events.</p>}
          {upcoming.map((e) =>
            editing === e.id ? (
              <EventForm key={e.id} id={e.id} chapterTitle={chapter.title} initial={toForm(e)} onDone={(saved) => (setEditing(null), saved && load())} />
            ) : (
              <EventItem key={e.id} event={e} onEdit={() => setEditing(e.id)} onChanged={load} />
            ),
          )}
          {past.length > 0 && <h3>Past</h3>}
          {past.map((e) =>
            editing === e.id ? (
              <EventForm key={e.id} id={e.id} chapterTitle={chapter.title} initial={toForm(e)} onDone={(saved) => (setEditing(null), saved && load())} />
            ) : (
              <EventItem key={e.id} event={e} onEdit={() => setEditing(e.id)} onChanged={load} />
            ),
          )}
        </>
      )}
    </section>
  );
}

function EventItem({ event: e, onEdit, onChanged }: { event: AdminEvent; onEdit: () => void; onChanged: () => void }) {
  const [showRsvps, setShowRsvps] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "remind" | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const n = e.rsvps.length;

  async function remove() {
    setBusy(true);
    const { error } = await apiCall(`/api/board/events/${e.id}`, "DELETE");
    setBusy(false);
    setConfirm(null);
    if (error) return setMsg({ kind: "err", text: error });
    onChanged();
  }

  async function remind() {
    setBusy(true);
    setMsg(null);
    const { error, data } = await apiCall(`/api/board/events/${e.id}/remind`, "POST", {}, INVITE_TIMEOUT);
    setBusy(false);
    setConfirm(null);
    if (error) return setMsg({ kind: "err", text: error });
    const failed = (data?.failed as string[]) ?? [];
    setMsg({
      kind: failed.length ? "err" : "ok",
      text: `Reminder sent to ${people(Number(data?.sent ?? 0))}.${failed.length ? ` It didn't reach ${failed.join(", ")}.` : ""}`,
    });
  }

  async function copyEmails() {
    const list = e.rsvps.map((r) => r.email).join(", ");
    try {
      await navigator.clipboard.writeText(list);
      setMsg({ kind: "ok", text: `Copied ${n === 1 ? "1 email" : `${n} emails`}.` });
    } catch {
      setMsg({ kind: "err", text: "Your browser didn't allow copying. Use Download CSV instead." });
    }
  }

  return (
    <div className="item event-item">
      <strong>{e.title}</strong>
      <div className="deep">
        {longDate(e.date)} · {timeRange(e.startTime, e.endTime)} (Pacific) · {e.online ? "Online" : e.address}
        {e.tag && ` · ${e.tag}`}
      </div>
      <div className="deep">
        {people(n)} RSVPed{e.showCount ? " · count shown on the page" : ""}
        {e.online && !e.meetingLink && !e.past && " · meeting link to add"}
        {!e.flyerId && " · no flyer yet"}
      </div>
      <div className="admin-row">
        <button type="button" className="linkbtn" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="linkbtn" aria-expanded={showRsvps} onClick={() => setShowRsvps(!showRsvps)}>
          {showRsvps ? "Hide RSVPs" : `RSVPs (${n})`}
        </button>
        <button type="button" className="linkbtn" onClick={() => setConfirm("delete")}>
          Delete
        </button>
      </div>
      {confirm === "delete" && (
        <div className="admin-row confirm">
          <strong>Delete &ldquo;{e.title}&rdquo;?</strong> It comes off the Events page. You can restore it from the Changes tab.
          <button type="button" className="btn" disabled={busy} onClick={remove}>
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
          <button type="button" className="btn btn-line" disabled={busy} onClick={() => setConfirm(null)}>
            Keep it
          </button>
        </div>
      )}
      {showRsvps && (
        <div className="rsvps">
          {n === 0 ? (
            <p>No RSVPs yet.</p>
          ) : (
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>School</th>
                    <th>Question</th>
                    <th>Updates</th>
                    <th>RSVPed</th>
                  </tr>
                </thead>
                <tbody>
                  {e.rsvps.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.school}</td>
                      <td>{r.question}</td>
                      <td>{r.optIn ? "Yes" : "No"}</td>
                      <td>
                        {new Date(r.at).toLocaleString("en-US", {
                          timeZone: "America/Los_Angeles",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {n > 0 && (
            <div className="admin-row">
              <button type="button" className="btn btn-line" onClick={copyEmails}>
                Copy emails
              </button>
              <a className="btn btn-line" href={chapterUrl(`/api/board/events/${e.id}/csv`)} download>
                Download CSV
              </a>
              {!e.past && (
                <button type="button" className="btn" onClick={() => (setConfirm("remind"), setMsg(null))}>
                  Send reminder to everyone
                </button>
              )}
            </div>
          )}
          {confirm === "remind" && (
            <div className="admin-row confirm">
              <strong>Email a reminder with the {e.online ? "meeting link" : "address"} to {people(n)}?</strong>
              <button type="button" className="btn" disabled={busy} onClick={remind}>
                {busy ? "Sending…" : "Yes, send"}
              </button>
              <button type="button" className="btn btn-line" disabled={busy} onClick={() => setConfirm(null)}>
                Not yet
              </button>
            </div>
          )}
          {e.online && !e.meetingLink && confirm === "remind" && (
            <p className="msg err">This event has no meeting link yet. Add it (Edit) before sending, or the reminder won&apos;t have it.</p>
          )}
        </div>
      )}
      {msg && (
        <p className={`msg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

function EventForm({ id: eventId, initial, chapterTitle, onDone }: { id?: number; initial: Form; chapterTitle: string; onDone: (saved: boolean) => void }) {
  const [f, setF] = useState<Form>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    const { error: err, data } = await apiCall("/api/board/photos", "POST", form);
    setUploading(false);
    const photo = typeof data?.src === "string" ? Number(data.src.split("/").pop()) : NaN;
    if (err || !Number.isInteger(photo)) return setError(err ?? "The upload didn't work.");
    set("flyerId", photo);
  }

  async function save(ev: FormEvent) {
    ev.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await apiCall(eventId ? `/api/board/events/${eventId}` : "/api/board/events", eventId ? "PATCH" : "POST", f);
    setBusy(false);
    if (err) return setError(err);
    onDone(true);
  }

  return (
    <div className="card">
      <h3>{eventId ? "Edit the event" : "Add an event"}</h3>
      <form className="stack wide event-form" onSubmit={save}>
        <label htmlFor={`${id}-title`}>
          Title
          <input id={`${id}-title`} type="text" value={f.title} onChange={(e) => set("title", e.target.value)} required />
        </label>
        <div className="pair">
          <label htmlFor={`${id}-tag`}>
            Tag
            <input id={`${id}-tag`} type="text" value={f.tag} onChange={(e) => set("tag", e.target.value)} placeholder="Workshop · UC Berkeley" />
          </label>
          <label>
            Chapter
            <input type="text" value={chapterTitle} readOnly aria-describedby={`${id}-chapter-note`} />
            <span id={`${id}-chapter-note`} className="deep">
              Events belong to the hub they&apos;re made on. Emails come from this chapter&apos;s sender.
            </span>
          </label>
        </div>
        <div className="pair">
          <label htmlFor={`${id}-date`}>
            Date
            <input id={`${id}-date`} type="date" value={f.date} onChange={(e) => set("date", e.target.value)} required />
          </label>
          <div className="pair">
            <label htmlFor={`${id}-start`}>
              Starts (Pacific)
              <input id={`${id}-start`} type="time" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} required />
            </label>
            <label htmlFor={`${id}-end`}>
              Ends
              <input id={`${id}-end`} type="time" value={f.endTime} onChange={(e) => set("endTime", e.target.value)} required />
            </label>
          </div>
        </div>
        <fieldset className="stack">
          <legend>Where</legend>
          <label className="check">
            <input type="radio" name={`${id}-where`} checked={f.online} onChange={() => set("online", true)} />
            Online
          </label>
          <label className="check">
            <input type="radio" name={`${id}-where`} checked={!f.online} onChange={() => set("online", false)} />
            In person
          </label>
        </fieldset>
        {f.online ? (
          <label htmlFor={`${id}-link`}>
            Meeting link (private)
            <input id={`${id}-link`} type="url" value={f.meetingLink} onChange={(e) => set("meetingLink", e.target.value)} placeholder="https://berkeley.zoom.us/j/…" />
            <span className="deep">Never shown on the page. It&apos;s only in the RSVP confirmation and reminder emails.</span>
          </label>
        ) : (
          <label htmlFor={`${id}-address`}>
            Address
            <input id={`${id}-address`} type="text" value={f.address} onChange={(e) => set("address", e.target.value)} />
          </label>
        )}
        <div className="pair">
          <label htmlFor={`${id}-host`}>
            Host name
            <input id={`${id}-host`} type="text" value={f.hostName} onChange={(e) => set("hostName", e.target.value)} />
          </label>
          <label htmlFor={`${id}-hosttitle`}>
            Host title
            <input id={`${id}-hosttitle`} type="text" value={f.hostTitle} onChange={(e) => set("hostTitle", e.target.value)} />
          </label>
        </div>
        <label htmlFor={`${id}-desc`}>
          Description
          <textarea id={`${id}-desc`} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </label>
        <div className="stack">
          <span>Flyer</span>
          {f.flyerId ? (
            <div className="flyer-edit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoSrc(`/api/board/photos/${f.flyerId}`)} alt="Flyer" />
              <button type="button" className="chip" onClick={() => set("flyerId", null)}>
                Remove flyer
              </button>
            </div>
          ) : (
            <span className="deep">No flyer yet. The page shows the date instead.</span>
          )}
          <label htmlFor={`${id}-flyer`}>
            {f.flyerId ? "Replace the flyer" : "Upload a flyer"} (JPG, PNG or WebP, up to 2 MB)
            <input id={`${id}-flyer`} type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          {uploading && <p className="msg">Uploading…</p>}
        </div>
        <label className="check">
          <input type="checkbox" checked={f.showCount} onChange={(e) => set("showCount", e.target.checked)} />
          Show RSVP count (&ldquo;N people are going&rdquo; on the page)
        </label>
        <div className="admin-row">
          <button type="submit" className="btn" disabled={busy || uploading}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-line" disabled={busy} onClick={() => onDone(false)}>
            Cancel
          </button>
        </div>
        {error && (
          <p className="msg err" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
