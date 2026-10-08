"use client";

import { useEffect, useRef, useState } from "react";
import type { FraudPageDict } from "@/lib/i18n/dictionary";
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
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(1);
  const chatRef = useRef<HTMLDivElement>(null);
  const money = (n: number) => formatMoney(n, locale);
  const last = STEPS.length - 1;

  // Each ask adds the buyer's line and the dealer's answer to the chat.
  const ask = () => {
    if (step >= last) return;
    setStep(step + 1);
    setShown(step + 1 === last ? dict.lines.length : shown + 2);
  };

  const reset = () => {
    setStep(0);
    setShown(1);
  };

  useEffect(() => {
    const c = chatRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [shown]);

  const st = STEPS[step];
  return (
    <div className="fs mt48">
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
            <b>{money(st.pay)}</b>
            {step > 0 && <s>{money(STEPS[step - 1].pay)}</s>}
          </div>
        </div>
        <div className="fs-hidden" hidden={step === 0}>
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
            onClick={ask}
          >
            {dict.ask}
          </button>
          <button
            type="button"
            className="btn btn-line"
            onClick={reset}
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
