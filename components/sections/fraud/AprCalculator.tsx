"use client";

import { useState, type CSSProperties } from "react";
import type { FraudPageDict } from "@/lib/i18n/dictionary";
import { formatMoney } from "./money";

type Dict = FraudPageDict["apr"];

const PRINCIPAL = 15000;
const TERMS = [36, 48, 60, 72];
const MIN = 3;
const MAX = 30;

const monthly = (apr: number, n: number) => {
  const r = apr / 1200;
  return r === 0 ? PRINCIPAL / n : (PRINCIPAL * r) / (1 - Math.pow(1 + r, -n));
};
const pct = (v: number) => ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * 100;

// California caps the dealer's markup over the lender's approved rate:
// 2 points on loans over 60 months, 2.5 points otherwise.
const markupCap = (term: number) => (term > 60 ? 2 : 2.5);

export function AprCalculator({ dict, locale }: { dict: Dict; locale: string }) {
  const [rate, setRate] = useState(7);
  const [term, setTerm] = useState(60);
  const [buyInput, setBuyInput] = useState("7");
  const money = (n: number) => formatMoney(n, locale);
  const fmt1 = (n: number) =>
    n.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const buy = Math.min(25, Math.max(2, parseFloat(buyInput) || 7));
  const points = markupCap(term);
  const cap = buy + points;
  const mo = monthly(rate, term);
  const tot = mo * term;
  const interest = tot - PRINCIPAL;
  const baseInterest = monthly(buy, term) * term - PRINCIPAL;
  const over = rate > cap + 1e-9;
  const marked = !over && rate > buy + 1e-9;
  const close = Math.abs(pct(cap) - pct(buy)) < 22;

  const stepBuy = (d: number) => setBuyInput(String(Math.min(25, Math.max(2, buy + d))));

  return (
    <div className="apr mt56">
      <div className="apr-controls">
        <label htmlFor="aprRate" className="apr-label">
          {dict.rateLabel}
        </label>
        <div className={`apr-rate${over ? " over" : ""}`}>
          <span>{fmt1(rate)}%</span>
        </div>
        <div className="apr-track-wrap">
          <input
            type="range"
            id="aprRate"
            min={MIN}
            max={MAX}
            step={0.5}
            value={rate}
            aria-describedby="aprHint"
            aria-valuetext={dict.rateValue.replace("{rate}", fmt1(rate))}
            style={{ "--fill": `${pct(rate)}%` } as CSSProperties}
            onChange={(e) => setRate(+e.target.value)}
          />
          <div className="apr-marks" aria-hidden="true">
            <span className="mk mk-buy" style={{ left: `${pct(buy)}%` }}>
              <i />
              <em>{dict.approval}</em>
            </span>
            <span className={`mk mk-cap${close ? " low" : ""}`} style={{ left: `${pct(cap)}%` }}>
              <i />
              <em>{dict.capMark.replace("{rate}", fmt1(cap))}</em>
            </span>
          </div>
          <div className="apr-scale" aria-hidden="true">
            <span>{MIN}%</span>
            <span>{MAX}%</span>
          </div>
        </div>
        <div className="apr-row">
          <div>
            <span className="apr-label" id="aprTermLabel">
              {dict.termLabel}
            </span>
            <div className="seg" role="radiogroup" aria-labelledby="aprTermLabel">
              {TERMS.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={term === n}
                  onClick={() => setTerm(n)}
                >
                  {dict.termOption.replace("{n}", String(n))}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="apr-label" htmlFor="aprBuy">
              {dict.approvedLabel}
            </label>
            <div className="stepper">
              <button type="button" aria-label={dict.lower} onClick={() => stepBuy(-0.5)}>
                −
              </button>
              <input
                id="aprBuy"
                type="number"
                min={2}
                max={25}
                step={0.5}
                inputMode="decimal"
                value={buyInput}
                onChange={(e) => setBuyInput(e.target.value)}
                onBlur={() => setBuyInput(String(buy))}
              />
              <span>%</span>
              <button type="button" aria-label={dict.raise} onClick={() => stepBuy(0.5)}>
                +
              </button>
            </div>
          </div>
        </div>
        <p className="apr-hint" id="aprHint">
          {dict.hint}
        </p>
      </div>
      <div className="apr-results" aria-live="polite">
        <div className="apr-big">
          <span className="apr-label">{dict.monthly}</span>
          <b>{dict.perMonth.replace("{amount}", money(mo))}</b>
        </div>
        <div className="apr-split">
          <div>
            <span className="apr-label">{dict.interest}</span>
            <b>{money(interest)}</b>
          </div>
          <div>
            <span className="apr-label">{dict.totalCost}</span>
            <b>{money(tot)}</b>
          </div>
        </div>
        <div className="apr-bar" aria-hidden="true">
          <i id="barP" style={{ width: `${(PRINCIPAL / tot) * 100}%` }} />
          <i id="barI" style={{ width: `${(interest / tot) * 100}%` }} />
        </div>
        <div className="apr-bar-key">
          <span>
            <i className="k1" />
            {dict.car}
          </span>
          <span>
            <i className="k2" />
            {dict.interestKey}
          </span>
        </div>
        <div className={`apr-verdict${over ? " bad" : marked ? "" : " ok"}`}>
          {over ? (
            <>
              <strong>{dict.overTitle}</strong>{" "}
              {dict.over
                .replace("{buy}", fmt1(buy))
                .replace("{points}", String(points))
                .replace("{term}", String(term))
                .replace("{cap}", fmt1(cap))}
            </>
          ) : marked ? (
            <>
              <strong>{dict.markupTitle}</strong>{" "}
              {dict.markup.replace("{amount}", money(interest - baseInterest)).replace("{buy}", fmt1(buy))}
            </>
          ) : (
            <>
              <strong>{dict.okTitle}</strong> {dict.ok}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
