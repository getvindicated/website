import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";

export function HomeCta({
  dict,
  ppiHref,
  documentsHref,
}: {
  dict: HomePageDict["cta"];
  ppiHref: string;
  documentsHref: string;
}) {
  return (
    <section>
      <div className="wrap">
        <div className="cta">
          <div>
            <h2>{dict.title}</h2>
            <p>{dict.body}</p>
            <div className="ctas">
              <Link className="btn btn-white" href={ppiHref}>
                {dict.primary}
              </Link>
              <Link className="btn btn-ghost-white" href={documentsHref}>
                {dict.secondary}
              </Link>
            </div>
          </div>
          <svg viewBox="0 0 260 260" aria-hidden="true">
            <circle cx="130" cy="130" r="120" fill="rgba(255,255,255,.12)" />
            <rect x="70" y="40" width="120" height="170" rx="14" fill="#fff" />
            <rect x="100" y="30" width="60" height="22" rx="8" fill="#2a0f31" />
            <path d="M92 88l10 10 18-20M92 128l10 10 18-20M92 168l10 10 18-20" stroke="#9533A5" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M132 92h38M132 132h38M132 172h26" stroke="#2a0f31" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
