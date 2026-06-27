"use client";

import { useEffect, useRef, useState } from "react";
import { Patrick_Hand } from "next/font/google";

const patrickHand = Patrick_Hand({ subsets: ["latin"], weight: "400" });

const scamSteps = [
  { strong: "Document everything immediately.", text: "Dates, times, names. Save all texts, emails, and contracts." },
  { strong: "File with your state DMV.", text: "Most states have consumer protection divisions for automotive fraud." },
  { strong: "File with the FTC.", text: "reportfraud.ftc.gov: complaints build the database used to pursue enforcement." },
  { strong: "Contact the manufacturer.", text: "Franchised dealerships have parent oversight. They take complaints seriously." },
  { strong: "Consider a consumer protection attorney.", text: "Many work on contingency; you pay nothing upfront." },
  { strong: "Leave an honest public review.", text: "Google, Yelp, BBB. You're protecting the next person." },
];

type Step = (typeof scamSteps)[number];

function FlipClone({
  step,
  num,
  onDone,
}: {
  step: Step;
  num: number;
  onDone: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFlipped(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`sn-page sn-clone ${flipped ? "sn-flipping" : ""}`}
      onTransitionEnd={onDone}
    >
      <span className="sn-num">{num}.</span>
      <p className="sn-strong">{step.strong}</p>
      <p className="sn-text">{step.text}</p>
    </div>
  );
}

export function ScamNotebook() {
  const [index, setIndex] = useState(0);
  const [cloneId, setCloneId] = useState<number | null>(null);
  const idRef = useRef(0);

  function flip() {
    if (cloneId !== null) return;
    idRef.current += 1;
    setCloneId(idRef.current);
  }

  function handleCloneDone() {
    setIndex((i) => (i >= scamSteps.length - 1 ? 0 : i + 1));
    setCloneId(null);
  }

  const current = scamSteps[index];
  const nextIndex = (index + 1) % scamSteps.length;
  const upcoming = scamSteps[nextIndex];
  const isLast = index === scamSteps.length - 1;

  return (
    <div className={patrickHand.className}>
      <style>{`
        .sn-outer { width: 100%; max-width: 460px; margin: 0 auto; position: relative; }
        .sn-spiral { position: absolute; top: -14px; left: 30px; right: 30px; height: 28px; display: flex; justify-content: space-between; z-index: 30; pointer-events: none; }
        .sn-ring { width: 18px; height: 28px; border-radius: 9px; background: linear-gradient(135deg, #cfcfd6, #6f6f78); box-shadow: 0 2px 3px rgba(0,0,0,0.4) inset, 0 1px 2px rgba(0,0,0,0.5); }
        .sn-notebook { position: relative; width: 100%; height: 540px; border-radius: 10px; cursor: pointer; user-select: none; perspective: 1800px; }
        .sn-page { position: absolute; inset: 0; background: #fbf6e9; border-radius: 8px; box-shadow: 0 25px 60px -10px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4); padding: 54px 38px 38px 64px; background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 38px, #aebde0 39px, transparent 40px); background-position: 0 64px; }
        .sn-page::before { content: ""; position: absolute; top: 0; bottom: 0; left: 42px; width: 2px; background: #d9756f; opacity: 0.7; }
        .sn-page-under { z-index: 1; filter: brightness(0.96); }
        .sn-page-top { z-index: 10; }
        .sn-clone { z-index: 15; transform-style: preserve-3d; transform-origin: top center; transform: rotateX(0deg); transition: transform 0.62s cubic-bezier(.45,.05,.55,.95); backface-visibility: hidden; }
        .sn-clone.sn-flipping { transform: rotateX(-178deg); }
        .sn-num { font-size: 3.2rem; line-height: 1; color: #7c3aed; display: block; margin-bottom: 14px; }
        .sn-strong { font-size: 2.5rem; line-height: 1.2; color: #15121d; font-weight: 700; margin: 0 0 16px; }
        .sn-text { font-size: 1.75rem; line-height: 1.4; color: #15121d; margin: 0; }
        .sn-hint { position: absolute; bottom: 22px; right: 30px; font-size: 1.2rem; color: #7c3aed; opacity: 0.75; }
        .sn-dots { display: flex; gap: 7px; margin-top: 24px; justify-content: center; }
        .sn-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.25); }
        .sn-dot.sn-done { background: #c9a6e0; }
      `}</style>

      <div className="sn-outer">
        <div className="sn-spiral">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="sn-ring" />
          ))}
        </div>

        <div className="sn-notebook" onClick={flip}>
          <div className="sn-page sn-page-under">
            <span className="sn-num">{nextIndex + 1}.</span>
            <p className="sn-strong">{upcoming.strong}</p>
            <p className="sn-text">{upcoming.text}</p>
          </div>

          <div className="sn-page sn-page-top">
            <span className="sn-num">{index + 1}.</span>
            <p className="sn-strong">{current.strong}</p>
            <p className="sn-text">{current.text}</p>
            <span className="sn-hint">
              {isLast ? "tap to start over" : "tap to flip \u2192"}
            </span>
          </div>

          {cloneId !== null && (
            <FlipClone
              key={cloneId}
              step={current}
              num={index + 1}
              onDone={handleCloneDone}
            />
          )}
        </div>

        <div className="sn-dots">
          {scamSteps.map((_, i) => (
            <span key={i} className={`sn-dot ${i <= index ? "sn-done" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
