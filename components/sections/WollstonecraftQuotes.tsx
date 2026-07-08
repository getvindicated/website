"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const QUOTES: { quote: string; source: string }[] = [
  {
    quote:
      "Strengthen the female mind by enlarging it, and there will be an end to blind obedience.",
    source: "A Vindication of the Rights of Woman, 1792",
  },
  {
    quote:
      "My own sex, I hope, will excuse me, if I treat them like rational creatures, instead of flattering their fascinating graces, and viewing them as if they were in a state of perpetual childhood, unable to stand alone.",
    source: "A Vindication of the Rights of Woman",
  },
  {
    quote:
      "It is vain to expect virtue from women till they are in some degree independent of men.",
    source: "A Vindication of the Rights of Woman",
  },
  {
    quote:
      "All the sacred rights of humanity are violated by insisting on blind obedience.",
    source: "A Vindication of the Rights of Woman",
  },
  {
    quote: "It is justice, not charity, that is wanting in the world!",
    source: "A Vindication of the Rights of Woman",
  },
  {
    quote:
      "I do not wish them [women] to have power over men; but over themselves.",
    source: "A Vindication of the Rights of Woman",
  },
];

const AUTO_ADVANCE_MS = 6000;
const FADE_MS = 250;

export function WollstonecraftQuotes() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    setVisible(false);
    setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, FADE_MS);
  }, []);

  const advance = useCallback(() => {
    setIndex((current) => {
      const next = (current + 1) % QUOTES.length;
      goTo(next);
      return current;
    });
  }, [goTo]);

  // Auto-advance on a timer; resets whenever the index changes,
  // so a manual click pushes the next auto-advance back out.
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, advance]);

  const current = QUOTES[index];

  return (
    <div>
      <button
        type="button"
        onClick={() => goTo((index + 1) % QUOTES.length)}
        className="text-left w-full bg-transparent border-none p-0 cursor-pointer"
        aria-label="Show next Wollstonecraft quote"
      >
        <p
          className="text-[clamp(1.2rem,2vw,1.5rem)] italic leading-[1.5] transition-opacity"
          style={{
            fontFamily: "var(--font-heading), Georgia, serif",
            color: "var(--color-accent)",
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
            minHeight: "5.5rem",
          }}
        >
          &ldquo;{current.quote}&rdquo;
        </p>
        <p
          className="text-[0.85rem] font-bold mt-4 transition-opacity"
          style={{
            color: "var(--color-accent)",
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          Mary Wollstonecraft, {current.source}
        </p>
      </button>

      <div className="flex gap-2 mt-6">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to quote ${i + 1} of ${QUOTES.length}`}
            className="rounded-full transition-all"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              transitionDuration: `${FADE_MS}ms`,
              background:
                i === index ? "var(--color-accent)" : "rgba(149,51,165,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
