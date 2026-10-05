import type { ReactNode } from "react";
import Link from "next/link";

type CtaLink = { label: string; href: string };

// The purple call-to-action card that closes most redesigned pages.
export function CtaBand({
  title,
  body,
  primary,
  secondary,
  art,
}: {
  title: string;
  body: string;
  primary: CtaLink;
  secondary?: CtaLink;
  art: ReactNode;
}) {
  return (
    <section>
      <div className="wrap">
        <div className="cta">
          <div>
            <h2>{title}</h2>
            <p>{body}</p>
            <div className="ctas">
              <Link className="btn btn-white" href={primary.href}>
                {primary.label}
              </Link>
              {secondary && (
                <Link className="btn btn-ghost-white" href={secondary.href}>
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
          {art}
        </div>
      </div>
    </section>
  );
}

export function ChecklistArt() {
  return (
    <svg viewBox="0 0 260 260" aria-hidden="true">
      <circle cx="130" cy="130" r="120" fill="rgba(255,255,255,.12)" />
      <rect x="70" y="40" width="120" height="170" rx="14" fill="#fff" />
      <rect x="100" y="30" width="60" height="22" rx="8" fill="#2a0f31" />
      <path d="M92 88l10 10 18-20M92 128l10 10 18-20M92 168l10 10 18-20" stroke="#9533A5" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M132 92h38M132 132h38M132 172h26" stroke="#2a0f31" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function PeopleArt() {
  return (
    <svg viewBox="0 0 260 260" aria-hidden="true">
      <circle cx="130" cy="130" r="120" fill="rgba(255,255,255,.12)" />
      <circle cx="90" cy="110" r="28" fill="#fff" />
      <circle cx="170" cy="110" r="28" fill="#ecd6f0" />
      <path d="M40 200c0-30 22-50 50-50s50 20 50 50z" fill="#fff" />
      <path d="M120 200c0-30 22-50 50-50s50 20 50 50z" fill="#ecd6f0" />
    </svg>
  );
}
