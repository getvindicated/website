"use client";

import { useEffect, useRef, useState } from "react";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

// A phone lock screen whose notifications slide in one by one the first
// time it scrolls into view.
export function PhoneNotifications({
  dict,
}: {
  dict: HomePageDict["publicKnowledge"];
}) {
  const reduce = usePrefersReducedMotion();
  const phoneRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const el = phoneRef.current;
    if (!el) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        dict.notifs.forEach((_, i) =>
          timers.push(setTimeout(() => setShown(i + 1), 300 + i * 700)),
        );
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [reduce, dict.notifs]);

  return (
    <div className="phone-stage" role="img" aria-label={dict.phoneLabel}>
      <div className="phone" ref={phoneRef}>
        <div className="screen">
          <div className="clock">{dict.clock}</div>
          {dict.notifs.map((n, i) => (
            <div
              key={n.time}
              className={`notif${reduce || i < shown ? " show" : ""}`}
            >
              <b>
                {dict.appName} <i>{n.time}</i>
              </b>
              {n.body}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
