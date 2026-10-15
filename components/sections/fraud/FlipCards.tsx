"use client";

import { useState } from "react";
import type { FraudPageDict } from "@/lib/i18n/dictionary";

export function FlipCards({ items }: { items: FraudPageDict["after"]["items"] }) {
  const [flipped, setFlipped] = useState<boolean[]>(items.map(() => false));
  return (
    <div className="flip-grid">
      {items.map((it, i) => (
        <button
          key={it.front}
          type="button"
          className="flip"
          aria-pressed={flipped[i]}
          onClick={() => setFlipped((f) => f.map((v, k) => (k === i ? !v : v)))}
        >
          <div className="flip-in">
            <div className="face front" aria-hidden={flipped[i]}>
              <span className="n">{i + 1}</span>
              <b>{it.front}</b>
            </div>
            <div className="face back" aria-hidden={!flipped[i]}>
              {it.back}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
