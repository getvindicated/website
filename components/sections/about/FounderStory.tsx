"use client";

import type { AboutPageDict } from "@/lib/i18n/dictionary";
import { useInView } from "../shared/useInView";

// Sticky intro on the left, strike cards that fade in as they scroll past.
export function FounderStory({ dict }: { dict: AboutPageDict["story"] }) {
  return (
    <section className="band" id="story">
      <div className="wrap founder">
        <div className="founder-side">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
          <blockquote className="pull">
            {dict.quote}
            <cite>{dict.quoteCite}</cite>
          </blockquote>
        </div>
        <div className="strikes">
          {dict.strikes.map((s) => (
            <StrikeCard key={s.n} strike={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StrikeCard({
  strike,
}: {
  strike: AboutPageDict["story"]["strikes"][number];
}) {
  const [ref, inView] = useInView<HTMLElement>(0.35);
  return (
    <article ref={ref} className={`strike-card${inView ? " in" : ""}`}>
      <div className="strike-top">
        <span className="strike-n" aria-hidden="true">
          {strike.n}
        </span>
        <span className="tag">{strike.tag}</span>
      </div>
      <h3>{strike.title}</h3>
      <p>{strike.body}</p>
    </article>
  );
}
