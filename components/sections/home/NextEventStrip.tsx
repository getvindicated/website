"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EventsPageDict } from "@/lib/i18n/dictionary";
import type { PublicEvent } from "@/lib/events/types";
import { eventLabels } from "@/lib/events/format";

// The next event under the home hero: date box, title, "Thursday, 6 PM ·
// Online · Free" and an RSVP button. The home page is static, so this
// loads the event in the browser. Rendered only once events are public.
export function NextEventStrip({ dict, locale, eventsHref }: { dict: EventsPageDict["strip"]; locale: string; eventsHref: string }) {
  const [event, setEvent] = useState<PublicEvent | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/events/next?locale=${encodeURIComponent(locale)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && setEvent(j?.event ?? null))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [locale]);

  if (!event) return null;
  const l = eventLabels(event, locale);
  const href = `${eventsHref}#event-${event.id}`;
  return (
    <section className="ev-strip-section" aria-label={dict.label}>
      <div className="wrap">
        <div className="ev-strip">
          <div className="ev-datebox" aria-hidden="true">
            <span>{l.month}</span>
            <b>{l.day}</b>
          </div>
          <div className="ev-strip-text">
            <span className="ev-strip-label">{dict.label}</span>
            <Link href={href} className="ev-strip-title">
              {event.title}
            </Link>
            <span className="ev-strip-meta">{[l.short, event.online ? dict.online : dict.inPerson, dict.free].join(" · ")}</span>
          </div>
          <Link href={href} className="btn btn-solid ev-strip-btn">
            {dict.rsvp}
          </Link>
        </div>
      </div>
    </section>
  );
}
