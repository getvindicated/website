"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EventsPageDict } from "@/lib/i18n/dictionary";
import type { PublicEvent } from "@/lib/events/types";
import { eventLabels } from "@/lib/events/format";

// A one-line bar above the header on every public page while a workshop is
// coming up: "Free: {title} · Thu, Nov 19 · RSVP". Pages are static, so it
// loads the next event in the browser. Closing it hides it for that event
// in this browser; a new event shows again.

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
const key = (id: number) => `vin-workshop-bar-closed-${id}`;

function closed(id: number) {
  try {
    return localStorage.getItem(key(id)) === "1";
  } catch {
    return false;
  }
}

export function WorkshopBar({ dict, locale, eventsHref }: { dict: EventsPageDict["bar"]; locale: string; eventsHref: string }) {
  const [event, setEvent] = useState<PublicEvent | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/events/next?locale=${encodeURIComponent(locale)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const e = (j?.event ?? null) as PublicEvent | null;
        if (live && e && !closed(e.id)) setEvent(e);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [locale]);

  if (!event) return null;
  const l = eventLabels(event, locale);
  const hide = () => {
    try {
      localStorage.setItem(key(event.id), "1");
    } catch {
      /* private mode: hidden for this page view only */
    }
    setEvent(null);
  };
  return (
    <div className="rd workshop-bar" role="region" aria-label={dict.label}>
      <div className="wrap workshop-bar-in">
        <Link href={`${eventsHref}#rsvp-${event.id}`} className="workshop-bar-link">
          {/* Only the title part shortens on narrow screens; the date stays. */}
          <span className="workshop-bar-text">{fill(dict.text.split("{date}")[0], { title: event.title })}</span>
          <span className="workshop-bar-date">{fill(dict.text.slice(dict.text.indexOf("{date}")), { date: l.shortDate, title: event.title })}</span>
          <span aria-hidden="true">·</span>
          <b>{dict.rsvp}</b>
        </Link>
        <button type="button" className="workshop-bar-x" aria-label={dict.close} onClick={hide}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
