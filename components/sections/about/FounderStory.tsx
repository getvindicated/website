import type { AboutPageDict } from "@/lib/i18n/dictionary";

export function FounderStory({ dict }: { dict: AboutPageDict["story"] }) {
  return (
    <section id="story">
      <div className="wrap prose">
        <h2 className="h2">{dict.title}</h2>
        <p className="lede">{dict.body}</p>
        {dict.strikes.map((s) => (
          <article className="strike" key={s.n}>
            <h3>
              <span className="strike-n">{s.n}</span> {s.title}
            </h3>
            <p className="strike-meta">{s.tag}</p>
            <p>{s.body}</p>
          </article>
        ))}
        <blockquote className="pull">
          {dict.quote}
          <cite>{dict.quoteCite}</cite>
        </blockquote>
      </div>
    </section>
  );
}
