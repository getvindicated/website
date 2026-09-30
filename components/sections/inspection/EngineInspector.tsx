"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { InspectionPageDict } from "@/lib/i18n/dictionary";

type Dict = InspectionPageDict["engine"];
type Severity = "easy" | "watch" | "red" | "know";
type FlagColor = "red" | "gold";

// Hotspot positions as fractions of the engine illustration.
const PARTS: { x: number; y: number; s: Severity; fc: FlagColor }[] = [
  { x: 0.133, y: 0.356, s: "red", fc: "red" },
  { x: 0.306, y: 0.249, s: "know", fc: "gold" },
  { x: 0.745, y: 0.212, s: "red", fc: "red" },
  { x: 0.459, y: 0.337, s: "know", fc: "gold" },
  { x: 0.404, y: 0.456, s: "watch", fc: "red" },
  { x: 0.768, y: 0.505, s: "red", fc: "red" },
  { x: 0.895, y: 0.47, s: "easy", fc: "red" },
  { x: 0.286, y: 0.63, s: "watch", fc: "gold" },
  { x: 0.651, y: 0.845, s: "easy", fc: "red" },
];
const FLAG_SEV: Record<FlagColor, Severity> = { red: "red", gold: "watch" };
const MOBILE = "(max-width: 900px)";

const fill = (s: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((t, [k, v]) => t.replace(`{${k}}`, String(v)), s);

// "Inspect it yourself": tap a hotspot (or run the guided mode) to zoom
// into that part and get a checklist for it.
export function EngineInspector({ dict }: { dict: Dict }) {
  const [current, setCurrent] = useState(-1);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [ticks, setTicks] = useState<boolean[]>([]);
  const [cardIn, setCardIn] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const total = PARTS.length;

  const place = useCallback((i: number) => {
    const frame = frameRef.current;
    const view = viewRef.current;
    const zoom = zoomRef.current;
    const spot = spotRef.current;
    if (!frame || !view || !zoom || !spot) return;
    if (i < 0) {
      zoom.style.transform = "none";
      spot.classList.remove("show");
      frame.classList.remove("zoomed");
      return;
    }
    const mobile = window.matchMedia(MOBILE).matches;
    const W = zoom.offsetWidth;
    const H = zoom.offsetHeight;
    const FW = view.clientWidth;
    const FH = view.clientHeight;
    const p = PARTS[i];
    const z = mobile ? 1.9 : 2.1;
    const fx = mobile ? 0.5 : p.x > 0.5 ? 0.73 : 0.27;
    const tx = Math.min(0, Math.max(FW - W * z, FW * fx - p.x * W * z));
    const ty = Math.min(0, Math.max(FH - H * z, FH * 0.5 - p.y * H * z));
    zoom.style.transform = `translate(${tx}px,${ty}px) scale(${z})`;
    const d = 0.14 * W;
    Object.assign(spot.style, {
      left: `${p.x * W - d / 2}px`,
      top: `${p.y * H - d / 2}px`,
      width: `${d}px`,
      height: `${d}px`,
      borderRadius: "50%",
    });
    spot.classList.add("show");
    frame.classList.add("zoomed");
  }, []);

  useEffect(() => {
    place(current);
    if (current < 0) return;
    setCardIn(false);
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setCardIn(true)));
    const card = cardRef.current;
    if (card) {
      card.scrollTop = 0;
      if (window.matchMedia(MOBILE).matches) card.scrollIntoView({ block: "nearest" });
    }
    return () => cancelAnimationFrame(r);
  }, [current, place]);

  useEffect(() => {
    const onResize = () => place(current);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && current >= 0) setCurrent(-1);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [current, place]);

  function open(i: number) {
    setTicks(new Array(dict.parts[i].steps.length).fill(false));
    setCurrent(i);
  }

  function markAndNext() {
    const next = new Set(checked).add(current);
    setChecked(next);
    const after = PARTS.findIndex((_, k) => k > current && !next.has(k));
    const any = PARTS.findIndex((_, k) => !next.has(k));
    const go = after >= 0 ? after : any;
    if (go >= 0) open(go);
    else {
      setCurrent(-1);
      requestAnimationFrame(() =>
        doneRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
    }
  }

  function toggleTick(k: number) {
    const t = ticks.map((v, j) => (j === k ? !v : v));
    setTicks(t);
    if (t.every(Boolean)) setChecked((c) => new Set(c).add(current));
  }

  const part = current >= 0 ? dict.parts[current] : null;
  const meta = current >= 0 ? PARTS[current] : null;

  return (
    <>
      <div className="insp-bar">
        <div className="insp-progress">
          <div className="insp-meter" aria-hidden="true">
            <i style={{ width: `${(checked.size / total) * 100}%` }} />
          </div>
          <span aria-live="polite">{fill(dict.progress, { n: checked.size, total })}</span>
        </div>
        <button
          type="button"
          className="btn btn-solid"
          onClick={() => {
            const f = PARTS.findIndex((_, k) => !checked.has(k));
            open(f >= 0 ? f : 0);
            sectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
          }}
        >
          {dict.start}
        </button>
      </div>
      <div className="insp-chips">
        {dict.parts.map((p, i) => (
          <button
            key={p.t}
            type="button"
            className={[checked.has(i) && "done", i === current && "cur"].filter(Boolean).join(" ") || undefined}
            aria-pressed={i === current}
            onClick={() => open(i)}
          >
            <span className="ck" aria-hidden="true" />
            {p.t}
          </button>
        ))}
      </div>
      <div className="insp" ref={sectionRef}>
        <div className="insp-frame" ref={frameRef}>
          <div className="insp-view" ref={viewRef}>
          <div className="insp-zoom" ref={zoomRef}>
            <Image
              src="/images/learn/engine-bay.webp"
              alt={dict.imageAlt}
              width={1536}
              height={1024}
              sizes="(max-width: 1200px) 100vw, 1136px"
              draggable={false}
            />
            <div className="spot" ref={spotRef} />
          </div>
          <div className="insp-hots">
            {PARTS.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`hot sevpin-${p.s}${checked.has(i) ? " done" : ""}`}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                aria-label={fill(dict.inspect, { part: dict.parts[i].t })}
                tabIndex={current >= 0 ? -1 : 0}
                onClick={() => open(i)}
              >
                <span className="hot-ring" />
                <span className="hot-dot" />
                <span className="hot-tip" aria-hidden="true">
                  {dict.parts[i].t}
                </span>
              </button>
            ))}
          </div>
          </div>
          {part && meta && (
            <div
              ref={cardRef}
              className={`insp-card${cardIn ? " in" : ""}`}
              data-side={meta.x > 0.5 ? "left" : "right"}
              role="region"
              aria-label={part.t}
            >
              <button type="button" className="insp-x" aria-label={dict.close} onClick={() => setCurrent(-1)}>
                ×
              </button>
              <span className={`tag sev-${meta.s}`}>
                {fill(dict.of, { n: current + 1, total })} · {dict.severity[meta.s]}
              </span>
              <h3>{part.t}</h3>
              <p className="sub">{part.sub}</p>
              <p>{part.what}</p>
              <p className="how">{dict.how}</p>
              <ul className="todo">
                {part.steps.map((step, k) => (
                  <li key={step}>
                    <label>
                      <input type="checkbox" checked={ticks[k] ?? false} onChange={() => toggleTick(k)} />{" "}
                      <span>{step}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className={`flagbox sev-${FLAG_SEV[meta.fc]}`}>{part.flag}</div>
              {part.flag2 && <div className="flagbox sev-watch">{part.flag2}</div>}
              <div className="insp-nav">
                <button type="button" className="btn btn-line" disabled={current === 0} onClick={() => open(current - 1)}>
                  {dict.back}
                </button>
                <button type="button" className="btn btn-solid" onClick={markAndNext}>
                  {checked.has(current) ? dict.nextPart : dict.markChecked}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="insp-done" ref={doneRef} hidden={checked.size < total}>
        <span>
          <b>{dict.doneTitle}</b> {dict.doneBody}
        </span>
        <button
          type="button"
          className="btn btn-line"
          onClick={() => {
            setChecked(new Set());
            setCurrent(-1);
          }}
        >
          {dict.reset}
        </button>
      </div>
    </>
  );
}
