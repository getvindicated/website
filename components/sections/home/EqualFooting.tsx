import type { HomePageDict } from "@/lib/i18n/dictionary";

export function EqualFooting({ dict }: { dict: HomePageDict["footing"] }) {
  return (
    <section className="band">
      <div className="wrap">
        <div className="intro">
          <h2 className="h2">{dict.title}</h2>
          <figure className="footing-law">
            <blockquote>
              <p>{dict.quote}</p>
            </blockquote>
            <figcaption>
              <cite>{dict.quoteCite}</cite>
            </figcaption>
          </figure>
          <p className="lede">{dict.body}</p>
        </div>
        <ul className="stats">
          {dict.rows.map((row) => (
            <li key={row.stat}>
              <div className="big">{row.stat}</div>
              <div>
                <h3>{row.title}</h3>
                <p>{row.body}</p>
                <cite>{row.cite}</cite>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
