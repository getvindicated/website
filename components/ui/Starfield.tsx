"use client";

// Tiny twinkling stars scattered across the page background, reusing the
// existing `.star` / `star-twinkle` keyframe already defined in
// globals.css (same one the homepage RoadScene banner uses).
// Rendered once in the root layout, fixed behind all page content.

const STARS = [
  { top: "4%", left: "8%", size: 2, delay: "0s" },
  { top: "12%", left: "22%", size: 1.5, delay: "0.6s" },
  { top: "7%", left: "38%", size: 2, delay: "1.2s" },
  { top: "18%", left: "55%", size: 1.5, delay: "0.3s" },
  { top: "9%", left: "71%", size: 2, delay: "1.6s" },
  { top: "22%", left: "84%", size: 1.5, delay: "0.9s" },
  { top: "31%", left: "12%", size: 1.5, delay: "1.8s" },
  { top: "27%", left: "45%", size: 2, delay: "0.4s" },
  { top: "38%", left: "64%", size: 1.5, delay: "1.1s" },
  { top: "34%", left: "92%", size: 2, delay: "0.7s" },
  { top: "48%", left: "6%", size: 2, delay: "1.4s" },
  { top: "44%", left: "30%", size: 1.5, delay: "0.2s" },
  { top: "52%", left: "50%", size: 1.5, delay: "1.9s" },
  { top: "58%", left: "78%", size: 2, delay: "0.5s" },
  { top: "63%", left: "18%", size: 1.5, delay: "1.3s" },
  { top: "69%", left: "40%", size: 2, delay: "0.8s" },
  { top: "72%", left: "60%", size: 1.5, delay: "1.7s" },
  { top: "76%", left: "88%", size: 2, delay: "1.0s" },
  { top: "84%", left: "25%", size: 1.5, delay: "0.1s" },
  { top: "89%", left: "70%", size: 2, delay: "1.5s" },
];

export function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: "white",
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
