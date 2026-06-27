"use client";

import { useState } from "react";

const redFlags = [
  {
    label: "Too-Good-To-Be-True Pricing",
    trigger: "Too Good to Be True Pricing",
    body: "Dealers advertise a price that already includes a stack of rebates and discounts: military, teacher, loyalty, recent grad, and more. Most buyers will not actually qualify for most of them. The price online is built to get you in the door, not to be the price you pay.",
    script: "Ask for the out-the-door price in writing before you go in, and ask exactly which discounts you qualify for.",
  },
  {
    label: "The Disappearing Discounts",
    trigger: "The Disappearing Discounts Script",
    body: "At the desk, the salesperson asks a series of qualifying questions: are you a college grad, military, a local resident, trading in a car. Each no crosses off a discount. By the end, your price has climbed by thousands, even though you were told you qualify for the manufacturer's rebate.",
    script: "Ask to see the original advertised price next to the final price, with every line item that changed and why.",
  },
  {
    label: "Bogus Accessories",
    trigger: "Bogus Accessories and Coatings",
    body: "Wheel locks, splash guards, paint protectant, and similar add-ons get added to the price even if you never asked for them. If the dealer says it is already on the car, that is a negotiating point, not a reason to pay for it.",
    script: "Ask the dealer to remove anything you did not request, or to lower the price to reflect it.",
  },
  {
    label: "Made-Up Fees",
    trigger: "Made-Up Fees",
    body: "A full tank of gas, a reconditioning fee, a CPO fee, a delivery or clean up fee: these are usually already built into the price by the manufacturer. Charging for them again is just an extra markup with an official-sounding name.",
    script: "Ask which fees are required by law and which ones are made up, then ask for those removed.",
  },
  {
    label: "Double-Charged Destination Fee",
    trigger: "The Double-Charged Destination Fee",
    body: "Destination, also called freight, is already listed on the window sticker above the MSRP. A dishonest dealer will quote you a price that already includes it, then add it again later as a separate fee. If you see destination broken out on its own line, you are being charged for it twice.",
    script: "Ask whether destination is already included in the price you were quoted, and ask to see it removed if it shows up again.",
  },
];

export function RedFlagField() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function selectFlag(i: number) {
    setActiveIndex((cur) => (cur === i ? null : i));
  }

  const active = activeIndex !== null ? redFlags[activeIndex] : null;

  return (
    <div>
      <style>{`
        .rf-field { position: relative; display: flex; align-items: flex-end; justify-content: space-between; height: 230px; padding: 0 18px 0; }
        .rf-flag-unit { position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; flex: 1; }
        .rf-pole-wrap { position: relative; display: flex; align-items: flex-end; height: 170px; }
        .rf-pole { width: 3px; height: 120px; background: #9a9aa3; border-radius: 2px; transition: height 0.45s cubic-bezier(.2,.8,.3,1.2); position: relative; }
        .rf-flag-unit.rf-active .rf-pole { height: 158px; }
        .rf-pennant { position: absolute; top: 0; left: 1.5px; width: 48px; height: 32px; background: var(--color-red); clip-path: polygon(0 0, 100% 50%, 0 100%); transform-origin: 0% 50%; animation: rf-wave 2.4s ease-in-out infinite; transition: background 0.3s, filter 0.3s; }
        .rf-flag-unit.rf-active .rf-pennant { filter: drop-shadow(0 0 10px rgba(255,92,92,0.55)); }
        @keyframes rf-wave { 0%,100% { transform: rotate(0deg) skewY(0deg); } 50% { transform: rotate(2deg) skewY(-3deg); } }
        .rf-flag-num { position: absolute; top: 7px; left: 11px; font-size: 0.85rem; font-weight: 700; color: #fff; }
        .rf-flag-label { margin-top: 14px; font-size: 0.95rem; color: #fff; text-align: center; max-width: 130px; line-height: 1.3; }
        .rf-flag-unit.rf-active .rf-flag-label { font-weight: 700; }
        .rf-content-wrap { overflow: hidden; max-height: 0; transition: max-height 0.5s cubic-bezier(.2,.8,.3,1); }
        .rf-content-wrap.rf-open { max-height: 520px; }
        .rf-content { margin-top: 36px; padding-top: 30px; }
        .rf-content-title { font-size: 1.6rem; font-weight: 700; margin: 0 0 16px; color: #fff; }
        .rf-content-body { font-size: 1.05rem; line-height: 1.7; color: #fff; margin: 0 0 22px; }
        .rf-content-script { font-size: 1.05rem; line-height: 1.6; color: #fff; margin: 0; }
        .rf-content-script strong { font-weight: 700; }
        .rf-empty-hint { text-align: center; margin-top: 30px; font-size: 1rem; color: #fff; }
      `}</style>

      <div className="rf-field">
        {redFlags.map((flag, i) => (
          <div
            key={flag.label}
            className={`rf-flag-unit ${i === activeIndex ? "rf-active" : ""}`}
            onClick={() => selectFlag(i)}
          >
            <div className="rf-pole-wrap">
              <div className="rf-pole">
                <div className="rf-pennant">
                  <span className="rf-flag-num">{i + 1}</span>
                </div>
              </div>
            </div>
            <div className="rf-flag-label">{flag.label}</div>
          </div>
        ))}
      </div>

      {!active && <p className="rf-empty-hint">Tap any flag above to read it.</p>}

      <div className={`rf-content-wrap ${active ? "rf-open" : ""}`}>
        {active && (
          <div className="rf-content">
            <p className="rf-content-title">{active.trigger}</p>
            <p className="rf-content-body">{active.body}</p>
            <p className="rf-content-script">
              <strong>What to say:</strong> {active.script}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
