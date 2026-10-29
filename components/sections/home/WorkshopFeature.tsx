import Link from "next/link";
import type { EventsPageDict } from "@/lib/i18n/dictionary";
import type { PublicEvent } from "@/lib/events/types";
import { eventLabels } from "@/lib/events/format";

// "Upcoming workshop" right under the home hero, built from the next
// public event (lib/events), so it changes with the Events tab and is gone
// when nothing is coming up. The RSVP button opens that event's form on
// the Events page.

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

export function WorkshopFeature({ dict, event: e, locale, eventsHref }: { dict: EventsPageDict; event: PublicEvent; locale: string; eventsHref: string }) {
  const f = dict.feature;
  const l = eventLabels(e, locale);
  const when = [fill(f.when, { date: l.dateLabel, time: l.hours }), e.online ? f.online : e.locationTba ? dict.tba : e.address].filter(Boolean).join(" · ");
  return (
    <section className="workshop" aria-label={f.section}>
      <div className="wrap workshop-grid">
        <div className="workshop-flyer">
          {e.flyer ? (
            // Uploaded flyers come from the database, so a plain <img>.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.flyer} alt={fill(dict.flyerAlt, { title: e.title })} />
          ) : (
            <div className="ev-datebox ev-datebox-lg" aria-hidden="true">
              <span>{l.month}</span>
              <b>{l.day}</b>
            </div>
          )}
        </div>
        <div className="workshop-text">
          <span className="workshop-label">{f.label}</span>
          <h2>{e.title}</h2>
          <p className="workshop-when">{when}</p>
          {e.hostName && (
            <p className="workshop-host">
              <b>{e.hostName}</b>
              {e.hostTitle && <span>{e.hostTitle}</span>}
            </p>
          )}
          {e.description && <p className="workshop-desc">{e.description}</p>}
          <div className="ctas">
            <Link className="btn btn-solid" href={`${eventsHref}#rsvp-${e.id}`}>
              {f.rsvp}
            </Link>
            <Link className="btn btn-line" href={eventsHref}>
              {f.all}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
