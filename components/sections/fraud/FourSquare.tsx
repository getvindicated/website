"use client";

import { useEffect, useRef, useState } from "react";
import type { FraudPageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";
import { formatMoney } from "./money";

type Dict = FraudPageDict["fourSquare"];

// $19,000 financed at 8% APR, stretched over longer and longer terms.
const STEPS = [
  { n: 60, pay: 385, tot: 23115 },
  { n: 72, pay: 333, tot: 23985 },
  { n: 84, pay: 296, tot: 24876 },
];
const FINANCED = 19000;
const BAR_MAX = 26000;
const WHO = ["them", "me", "them", "me", "them", "flagchip"] as const;

export function FourSquare({ dict, locale }: { dict: Dict; locale: string }) {
  const reduce = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [shown, setShown] = useState(1);
  const [bump, setBump] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  stepRef.current = step;
  const money = (n: number) => formatMoney(n, locale);
  const last = STEPS.length - 1;

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const ask = () => {
    const s = stepRef.current;
    if (s >= last) return;
    setShown((v) => v + 1);
    timers.current.push(
      setTimeout(() => {
        setPrev(s);
        setStep(s + 1);
        setShown((v) => (s + 1 === last ? dict.lines.length : v + 1));
        setBump((b) => b + 1);
      }, reduce ? 0 : 700),
    );
  };

  const autoplay = () => {
    if (reduce) return;
    timers.current.push(setTimeout(ask, 1200));
    timers.current.push(setTimeout(ask, 3400));
  };

  const reset = () => {
    clear();
    stepRef.current = 0;
    setStep(0);
    setPrev(null);
    setShown(1);
  };

  // Play once when it first scrolls into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          autoplay();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const c = chatRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [shown]);

  const st = STEPS[step];
  return (
    <div className="fs mt56" ref={rootRef}>
      <div className="fs-paper-wrap">
        <div className="fs-paper" role="group" aria-label={dict.sheetLabel}>
          <div className="fs-cell">
            <span>{dict.tradeIn}</span>
            <b>{money(4000)}</b>
          </div>
          <div className="fs-cell">
            <span>{dict.price}</span>
            <b>{money(25000)}</b>
          </div>
          <div className="fs-cell">
            <span>{dict.down}</span>
            <b>{money(2000)}</b>
          </div>
          <div className="fs-cell fs-pay">
            <span>{dict.monthly}</span>
            <b key={`p${bump}`} className={prev !== null ? "pop" : undefined}>
              {money(st.pay)}
            </b>
            <s key={`o${bump}`} className={prev !== null ? "go" : undefined}>
              {prev !== null ? money(STEPS[prev].pay) : ""}
            </s>
          </div>
        </div>
        <div key={`t${bump}`} className={`fs-hidden${step > 0 ? " out bump" : ""}`}>
          <span>{dict.hidden}</span>
          <b>{dict.months.replace("{n}", String(st.n))}</b>
        </div>
      </div>
      <div className="fs-side">
        <div className="fs-chat" ref={chatRef} aria-live="polite">
          {dict.lines.slice(0, shown).map((t, i) => (
            <div key={i} className={`bub ${WHO[i]}`}>
              {t}
            </div>
          ))}
        </div>
        <div className="fs-total">
          <div className="fs-total-row">
            <span>{dict.total}</span>
            <b>{money(st.tot)}</b>
          </div>
          <div className="fs-bar" aria-hidden="true">
            <i id="fsBarP" style={{ width: `${(FINANCED / BAR_MAX) * 100}%` }} />
            <i id="fsBarI" style={{ width: `${((st.tot - FINANCED) / BAR_MAX) * 100}%` }} />
          </div>
          <div className="apr-bar-key">
            <span>
              <i className="k1" />
              {dict.financed}
            </span>
            <span>
              <i className="k2 red" />
              {dict.interest}
            </span>
          </div>
        </div>
        <div className="ctas">
          <button
            type="button"
            id="fsAsk"
            className="btn btn-solid"
            disabled={step >= last}
            onClick={() => {
              clear();
              ask();
            }}
          >
            {dict.ask}
          </button>
          <button
            type="button"
            className="btn btn-line"
            onClick={() => {
              reset();
              autoplay();
            }}
          >
            {dict.replay}
          </button>
        </div>
        <div className="say">{dict.say}</div>
        <p className="ai-src">{dict.note}</p>
      </div>
    </div>
  );
}
