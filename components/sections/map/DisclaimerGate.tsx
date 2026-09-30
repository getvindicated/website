"use client";

import { useRef, useState } from "react";
import type { MapPageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

type Dict = MapPageDict["disclaimer"];

// The map only appears after the visitor confirms they've read the
// VINdisclaimer.
export function DisclaimerGate({ dict, mapHref }: { dict: Dict; mapHref: string }) {
  const reduce = usePrefersReducedMotion();
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState(false);
  const launchRef = useRef<HTMLAnchorElement>(null);

  function reveal() {
    setOpen(true);
    requestAnimationFrame(() => {
      launchRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      launchRef.current?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <div className={`vd${open ? " done" : ""}`}>
        <div className="vd-head">
          <span className="vd-kicker-dot" aria-hidden="true" />
          <h2 className="vd-title">{dict.title}</h2>
          <p className="vd-lede">{dict.lede}</p>
        </div>
        <div className="vd-grid">
          {dict.items.map((it, i) => (
            <div className="vd-item" key={it.title}>
              <span className="vd-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
          ))}
        </div>
        <h2 className="vd-sub">{dict.howTitle}</h2>
        <ol className="vd-steps">
          {dict.steps.map((s, i) => (
            <li key={s.title}>
              <span className="vd-sn" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="dm-cats-key">
          <h3>{dict.catsTitle}</h3>
          <p>{dict.catsBody}</p>
          <ol>
            {dict.cats.map((c) => (
              <li key={c.title}>
                <b>{c.title}</b>
                <span>{c.body}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="vd-fine">{dict.fine}</p>
        <div className="vd-accept">
          <label className="vd-check">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>{dict.accept}</span>
          </label>
          <button type="button" className="vd-go" disabled={!agreed} onClick={reveal}>
            {dict.open}
          </button>
        </div>
      </div>
      {open && (
        <a
          ref={launchRef}
          className="vd-launch in"
          href={mapHref}
          target="_blank"
          rel="noopener"
        >
          <span className="vd-launch-ic" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
            </svg>
          </span>
          <span>
            <b>{dict.launchTitle}</b>
            <em>{dict.launchBody}</em>
          </span>
          <span className="vd-launch-go arrow-flip" aria-hidden="true">
            →
          </span>
        </a>
      )}
    </>
  );
}
