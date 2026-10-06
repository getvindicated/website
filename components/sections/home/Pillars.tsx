import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";

export function Pillars({
  dict,
  ppiHref,
  fraudHref,
}: {
  dict: HomePageDict["pillars"];
  ppiHref: string;
  fraudHref: string;
}) {
  const [inspection, fraud] = dict.items;
  return (
    <section>
      <div className="wrap center">
        <h2 className="h2">{dict.title}</h2>
        <p className="lede">{dict.body}</p>
        <div className="grid2 mt56">
          <Link className="pcard pcard-line" href={ppiHref}>
            <div className="icon" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9533A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-5-5M8 11l2 2 4-4" />
              </svg>
            </div>
            <h3>{inspection.title}</h3>
            <p>{inspection.body}</p>
          </Link>
          <Link className="pcard pcard-line" href={fraudHref}>
            <div className="icon" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9533A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3>{fraud.title}</h3>
            <p>{fraud.body}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
