"use client";

import { Fragment, useEffect, useState } from "react";
import type { FraudPageDict } from "@/lib/i18n/dictionary";
import { ScrollTour } from "../shared/ScrollTour";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";

type Dict = FraudPageDict["flags"];

// Each red flag plays out as a short chat on a phone while its card is
// the active step.
export function FlagsChatTour({ dict }: { dict: Dict }) {
  const [step, setStep] = useState(-1);
  const total = dict.items.length;
  const fill = (s: string, n: number) =>
    s.replace("{n}", String(n)).replace("{total}", String(total));

  const cards = dict.items.map((f, i) => (
    <Fragment key={f.title}>
      <span className="tag sev-red">{fill(dict.tag, i + 1)}</span>
      <h3>{f.title}</h3>
      <p>{f.body}</p>
      <div className="say">{dict.whatToDo.replace("{text}", f.todo)}</div>
    </Fragment>
  ));

  return (
    <ScrollTour
      className="tour-chat"
      cards={cards}
      intro={dict.intro}
      onStep={setStep}
      visual={
        <div className="chat-phone">
          <div className="chat-top">
            <span className="chat-av" aria-hidden="true">
              D
            </span>
            <div>
              <b>{dict.dealer}</b>
              <span>{step >= 0 ? dict.items[step].title : dict.floor}</span>
            </div>
          </div>
          <Conversation key={step} dict={dict} step={step} counter={step >= 0 ? fill(dict.counter, step + 1) : ""} />
        </div>
      }
    />
  );
}

// Remounted for each step, so its timers restart from the beginning.
function Conversation({
  dict,
  step,
  counter,
}: {
  dict: Dict;
  step: number;
  counter: string;
}) {
  const reduce = usePrefersReducedMotion();
  // 0 dealer typing, 1 dealer said, 2 you typing, 3 you said, 4 flag chip
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (step < 0) return;
    if (reduce) {
      setPhase(4);
      return;
    }
    const ts = [700, 1300, 2100, 2600].map((ms, k) =>
      setTimeout(() => setPhase(k + 1), ms),
    );
    return () => ts.forEach(clearTimeout);
  }, [step, reduce]);

  if (step < 0) {
    return (
      <div className="chat-body">
        <div className="chat-note">{dict.start}</div>
      </div>
    );
  }
  const f = dict.items[step];
  const typing = (
    <span className="typing" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
  return (
    <div className="chat-body" aria-live="polite">
      <div className="chat-note">{counter}</div>
      <div className="bub them">{phase >= 1 ? f.dealer : typing}</div>
      {phase >= 2 && <div className="bub me">{phase >= 3 ? f.you : typing}</div>}
      {phase >= 4 && (
        <div className="bub flagchip">
          <b>{dict.chip}</b> {f.title}
        </div>
      )}
    </div>
  );
}
