"use client";

import { useState } from "react";
import type { FraudPageDict } from "@/lib/i18n/dictionary";
import { formatMoney } from "./money";

type Dict = FraudPageDict["receipt"];
type Category = "req" | "neg" | "opt" | "red";

// Amounts and categories for each receipt line, in dictionary order.
const LINES: [number, Category][] = [
  [28500, "neg"], [1395, "req"], [2500, "red"], [495, "red"], [299, "red"],
  [199, "red"], [895, "opt"], [2195, "opt"], [795, "opt"], [85, "req"],
  [7, "req"], [3325, "req"], [620, "req"],
];
const CAT_TAG: Record<Category, string> = {
  req: "sev-easy",
  neg: "sev-know",
  opt: "sev-watch",
  red: "sev-red",
};
const canDrop = (c: Category) => c === "red" || c === "opt";

export function FeeReceipt({ dict, locale }: { dict: Dict; locale: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [strip, setStrip] = useState(false);
  const money = (n: number) => formatMoney(n, locale);

  let total = 0;
  let saved = 0;
  LINES.forEach(([amt, c]) => {
    if (strip && canDrop(c)) saved += amt;
    else total += amt;
  });

  return (
    <>
      <div className="rc-legend">
        {(Object.keys(CAT_TAG) as Category[]).map((c) => (
          <span key={c}>
            <i className={`dot ${c}`} aria-hidden="true" />
            {dict.categories[c]}
          </span>
        ))}
      </div>
      <div className="rc-wrap">
        <div className="receipt" role="group" aria-label={dict.label}>
          <div className="rc-head">
            <b>{dict.heading}</b>
            <span>{dict.sub}</span>
          </div>
          <ul className="rc-lines">
            {dict.lines.map((l, i) => {
              const [amt, c] = LINES[i];
              const isOpen = open === i;
              const gone = strip && canDrop(c);
              return (
                <li key={l.name} className={[`rc-${c}`, isOpen && "open", gone && "gone"].filter(Boolean).join(" ")}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`rc-note-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <i className={`dot ${c}`} aria-hidden="true" />
                    <span className="nm">
                      {l.name}
                      <span className="sr-only"> ({dict.categories[c]})</span>
                    </span>
                    <span className="amt">{money(amt)}</span>
                  </button>
                  <div className="rc-note" id={`rc-note-${i}`}>
                    <div inert={!isOpen}>
                      <span className={`tag ${CAT_TAG[c]} cat`}>
                        <i className={`dot ${c}`} aria-hidden="true" />
                        {dict.categories[c]}
                      </span>
                      <p>
                        <b>{l.short}</b> {l.long}
                      </p>
                      {l.say && <div className="say">{dict.whatToSay.replace("{text}", l.say)}</div>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="rc-total">
            <span>{dict.total}</span>
            <b>{money(total)}</b>
          </div>
          <label className="rc-toggle">
            <input type="checkbox" checked={strip} onChange={(e) => setStrip(e.target.checked)} />{" "}
            {dict.strip}
          </label>
          <div className="rc-save" aria-live="polite">
            {strip ? dict.saved.replace("{amount}", money(saved)) : ""}
          </div>
        </div>
      </div>
      <p className="ai-src">{dict.note}</p>
    </>
  );
}
