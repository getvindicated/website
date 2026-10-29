"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { EventsPageDict } from "@/lib/i18n/dictionary";
import type { PublicEvent } from "@/lib/events/types";
import { SCHOOLS, type School } from "@/lib/events/types";
import { googleCalendarUrl, type EventLabels } from "@/lib/events/format";

export type ShownEvent = PublicEvent & EventLabels;

const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The Events page: an Upcoming / Past toggle and one card per event, each
// with its own RSVP form.
export function EventsList({ dict, events }: { dict: EventsPageDict; events: ShownEvent[] }) {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const [flyer, setFlyer] = useState<ShownEvent | null>(null);
  const upcoming = events.filter((e) => !e.past);
  // Most recent first.
  const past = events.filter((e) => e.past).reverse();
  const shown = view === "upcoming" ? upcoming : past;

  // A link to a past event (#event-3) opens the Past list.
  useEffect(() => {
    const id = Number(window.location.hash.replace(/^#(event|rsvp)-/, ""));
    if (id && past.some((e) => e.id === id)) setView("past");
    // Only on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="ev-toggle" role="group" aria-label={dict.toggleLabel}>
        {(["upcoming", "past"] as const).map((v) => (
          <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
            {dict[v]}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="ev-empty">{view === "upcoming" ? dict.noneUpcoming : dict.nonePast}</p>
      ) : (
        <div className="ev-list">
          {shown.map((e) => (
            <EventCard key={e.id} dict={dict} event={e} onFlyer={() => setFlyer(e)} />
          ))}
        </div>
      )}
      <FlyerDialog dict={dict} event={flyer} onClose={() => setFlyer(null)} />
    </>
  );
}

function EventCard({ dict, event: e, onFlyer }: { dict: EventsPageDict; event: ShownEvent; onFlyer: () => void }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<{ first: string; email: string; emailed: boolean } | null>(null);
  const [count, setCount] = useState(e.count);
  const prevCountRef = useRef(e.count);
  const titleId = useId();
  const cardRef = useRef<HTMLElement>(null);

  // "RSVP, it's free" on the home page and the top bar link to
  // /events#rsvp-<id>: open this event's form and bring it into view.
  useEffect(() => {
    const check = () => {
      if (window.location.hash !== `#rsvp-${e.id}` || e.past) return;
      setOpen(true);
      requestAnimationFrame(() => cardRef.current?.scrollIntoView({ block: "start" }));
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [e.id, e.past]);

  return (
    <article className="ev-card" id={`event-${e.id}`} aria-labelledby={titleId} ref={cardRef}>
      <div className="ev-flyer">
        {e.flyer ? (
          <button type="button" className="ev-flyer-btn" onClick={onFlyer} aria-label={dict.enlarge}>
            {/* Uploaded flyers come from the database, so a plain <img>. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.flyer} alt={fill(dict.flyerAlt, { title: e.title })} />
          </button>
        ) : (
          <div className="ev-datebox ev-datebox-lg" aria-hidden="true">
            <span>{e.month}</span>
            <b>{e.day}</b>
          </div>
        )}
      </div>
      <div className="ev-body">
        {e.tag && <span className="tag">{e.tag}</span>}
        <h2 id={titleId}>{e.title}</h2>
        <ul className="ev-facts">
          <li>
            <b>{e.dateLabel}</b>
            <span>{fill(dict.time, { time: e.timeLabel })}</span>
          </li>
          <li>
            <b>{e.online ? dict.online : e.address}</b>
            {e.online && <span>{dict.onlineNote}</span>}
          </li>
          {e.hostName && (
            <li>
              <b>{e.hostName}</b>
              {e.hostTitle && <span>{e.hostTitle}</span>}
            </li>
          )}
        </ul>
        {e.description && <p className="ev-desc">{e.description}</p>}
        {count !== null && count > 0 && (
          <p className="ev-count">{count === 1 ? dict.goingOne : fill(dict.going, { n: count })}</p>
        )}
        {e.past ? (
          <p className="ev-ended">{dict.ended}</p>
        ) : (
          <>
            {done && <Done dict={dict} event={e} done={done} />}
            {open && (
              <div hidden={!!done}>
                <RsvpForm
                  dict={dict}
                  event={e}
                  onCancel={() => setOpen(false)}
                  onOptimistic={(first, email) => {
                    prevCountRef.current = count;
                    setDone({ first, email, emailed: true });
                    setCount((c) => (c === null ? c : c + 1));
                  }}
                  onSettled={(r) => {
                    setDone({ first: r.first, email: r.email, emailed: r.emailed });
                    if (r.count !== null) setCount(r.count);
                  }}
                  onRollback={() => {
                    setDone(null);
                    setCount(prevCountRef.current);
                  }}
                />
              </div>
            )}
            {!open && !done && (
              <button type="button" className="btn btn-solid ev-rsvp" onClick={() => setOpen(true)}>
                {dict.rsvp}
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

type Result = { first: string; email: string; emailed: boolean; count: number | null };

function RsvpForm({
  dict,
  event,
  onCancel,
  onOptimistic,
  onSettled,
  onRollback,
}: {
  dict: EventsPageDict;
  event: ShownEvent;
  onCancel: () => void;
  onOptimistic: (first: string, email: string) => void;
  onSettled: (r: Result) => void;
  onRollback: () => void;
}) {
  const f = dict.form;
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState<School | "">("");
  const [question, setQuestion] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; email?: string; school?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => nameRef.current?.focus(), []);

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = f.nameError;
    if (!EMAIL.test(email.trim())) next.email = f.emailError;
    if (!school) next.school = f.schoolError;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    // Show the confirmation right away, assuming the RSVP goes through, and
    // roll it back if the server disagrees.
    const trimmedEmail = email.trim().toLowerCase();
    onOptimistic(name.trim().split(/\s+/)[0], trimmedEmail);
    try {
      const res = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // The page's language, so their emails come in it.
        body: JSON.stringify({ eventId: event.id, name, email, school, question, optIn, locale: document.documentElement.lang }),
      });
      const j = await res.json().catch(() => null);
      if (res.ok && j?.ok) return onSettled({ first: j.first, email: j.email, emailed: j.emailed, count: j.count ?? null });
      onRollback();
      const code = j?.error;
      if (code === "name") setErrors({ name: f.nameError });
      else if (code === "email") setErrors({ email: f.emailError });
      else if (code === "school") setErrors({ school: f.schoolError });
      else if (code === "closed") setErrors({ form: f.closed });
      else if (code === "tooMany") setErrors({ form: f.tooMany });
      else setErrors({ form: f.error });
    } catch {
      onRollback();
      setErrors({ form: f.error });
    } finally {
      setBusy(false);
    }
  }

  const field = (k: "name" | "email" | "school") =>
    errors[k] ? { "aria-invalid": true as const, "aria-describedby": `${id}-${k}-err` } : {};
  const err = (k: "name" | "email" | "school") =>
    errors[k] && (
      <span className="ev-err" id={`${id}-${k}-err`}>
        {errors[k]}
      </span>
    );

  return (
    <form className="ev-form" onSubmit={submit} noValidate aria-label={`${f.title}: ${event.title}`}>
      <div className="ev-field">
        <label>
          {f.name}
          <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} {...field("name")} />
        </label>
        {err("name")}
      </div>
      <div className="ev-field">
        <label>
          {f.email}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} {...field("email")} />
        </label>
        {err("email")}
      </div>
      <div className="ev-field ev-wide">
        <label>
          {f.school}
          <select value={school} onChange={(e) => setSchool(e.target.value as School)} {...field("school")}>
            <option value="" disabled>
              {f.schoolPick}
            </option>
            {SCHOOLS.map((s) => (
              <option key={s} value={s}>
                {f.schools[s]}
              </option>
            ))}
          </select>
        </label>
        {err("school")}
      </div>
      <label className="ev-wide">
        {f.question}
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={1000} rows={3} />
      </label>
      <label className="ev-check ev-wide">
        <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
        {f.optIn}
      </label>
      {errors.form && (
        <p className="ev-err" role="alert">
          {errors.form}
        </p>
      )}
      <div className="ctas">
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? f.sending : f.submit}
        </button>
        <button type="button" className="btn btn-line" onClick={onCancel} disabled={busy}>
          {f.cancel}
        </button>
      </div>
    </form>
  );
}

function Done({ dict, event: e, done }: { dict: EventsPageDict; event: ShownEvent; done: { first: string; email: string; emailed: boolean } }) {
  const d = dict.done;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const page = typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}#event-${e.id}`;
  const msg = !done.emailed ? d.emailFailed : e.online ? d.online : d.inPerson;
  return (
    <div className="ev-done" ref={ref} tabIndex={-1} role="status">
      <h3>{d.title}</h3>
      <p>{fill(msg, { first: done.first, email: done.email })}</p>
      <div className="ctas">
        <a className="btn btn-solid" href={googleCalendarUrl(e, dict.online, d.calendarNote, page)} target="_blank" rel="noopener noreferrer">
          {d.google}
        </a>
        <a className="btn btn-line" href={`/api/events/${e.id}/ics?locale=${encodeURIComponent(document.documentElement.lang)}`} download>
          {d.ics}
        </a>
      </div>
    </div>
  );
}

function FlyerDialog({ dict, event, onClose }: { dict: EventsPageDict; event: ShownEvent | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (event && !d.open) d.showModal();
    if (!event && d.open) d.close();
  }, [event]);
  return (
    <dialog
      ref={ref}
      className="ev-dialog"
      onClose={onClose}
      onClick={(ev) => {
        // A click on the dark backdrop closes it.
        if (ev.target === ref.current) onClose();
      }}
    >
      {event?.flyer && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.flyer} alt={fill(dict.flyerAlt, { title: event.title })} />
          <button type="button" className="btn btn-white ev-dialog-close" onClick={onClose}>
            {dict.close}
          </button>
        </>
      )}
    </dialog>
  );
}
