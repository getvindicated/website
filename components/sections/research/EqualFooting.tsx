import type { ReactNode } from "react";
import type { ResearchPageDict } from "@/lib/i18n/dictionary";

const FONT = "Plus Jakarta Sans,sans-serif";

export function EqualFooting({ dict }: { dict: ResearchPageDict["footing"] }) {
  const art: ReactNode[] = [
    <svg key="quotes" viewBox="0 0 340 250" aria-hidden="true">
      <rect x="30" y="130" width="100" height="90" rx="10" fill="#d9b8df" />
      <rect x="190" y="50" width="100" height="170" rx="10" fill="#9533A5" />
      <path d="M20 222h300" stroke="#2a0f31" strokeWidth="4" strokeLinecap="round" />
      <text x="80" y="118" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="20" fill="#2a0f31">
        {dict.quoteA}
      </text>
      <text x="240" y="38" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="20" fill="#2a0f31">
        {dict.quoteB}
      </text>
    </svg>,
    <svg key="listing" viewBox="0 0 340 250" aria-hidden="true">
      <rect x="50" y="30" width="240" height="160" rx="14" fill="#fff" stroke="#2a0f31" strokeWidth="4" />
      <rect x="50" y="30" width="240" height="30" rx="14" fill="#2a0f31" />
      <rect x="50" y="46" width="240" height="14" fill="#2a0f31" />
      <rect x="72" y="80" width="110" height="80" rx="8" fill="#ecd6f0" stroke="#9533A5" strokeWidth="3" strokeDasharray="8 6" />
      <path d="M200 88h70M200 108h56M200 128h64" stroke="#2a0f31" strokeWidth="6" strokeLinecap="round" />
      <circle cx="258" cy="190" r="34" fill="#9533A5" />
      <text x="258" y="202" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="34" fill="#fff">
        !
      </text>
    </svg>,
    <svg key="clock" viewBox="0 0 340 250" aria-hidden="true">
      <circle cx="170" cy="125" r="92" fill="#fff" stroke="#2a0f31" strokeWidth="4" />
      <path d="M170 125V58" stroke="#2a0f31" strokeWidth="6" strokeLinecap="round" />
      <path d="M170 125l44 26" stroke="#9533A5" strokeWidth="6" strokeLinecap="round" />
      <path d="M170 33a92 92 0 0 1 80 46" fill="none" stroke="#9533A5" strokeWidth="12" strokeLinecap="round" />
      <circle cx="170" cy="125" r="8" fill="#2a0f31" />
    </svg>,
  ];

  return (
    <section className="pt0">
      <div className="wrap">
        <div className="center">
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
        <div className="rows">
          {dict.rows.map((row, i) => (
            <div className="row" key={row.stat}>
              <div className="row-art">{art[i]}</div>
              <div>
                <div className="big">{row.stat}</div>
                <h3>{row.title}</h3>
                <p>{row.body}</p>
                <cite>{row.cite}</cite>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
