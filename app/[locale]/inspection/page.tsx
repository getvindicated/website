"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PageHero,
  FadeUp,
  SectionTitle,
  Accordion,
  Pullquote,
  CardGrid,
  InfoBox,
  WarningBox,
} from "@/components/ui";

// ── Engine diagram pins ──────────────────────────────────────
type PinColor = "green" | "gold" | "red" | "purple";

const enginePins: {
  id: number;
  top: string;
  left: string;
  color: PinColor;
  title: string;
}[] = [
  { id: 1, top: "20%", left: "66%", color: "purple", title: "Engine Cover" },
  { id: 2, top: "55%", left: "27%", color: "gold", title: "Oil Filler Cap" },
  {
    id: 3,
    top: "31%",
    left: "20%",
    color: "green",
    title: "Coolant Reservoir",
  },
  { id: 4, top: "76%", left: "25%", color: "gold", title: "Serpentine Belt" },
  { id: 5, top: "85%", left: "48%", color: "green", title: "Radiator & Fan" },
  { id: 6, top: "18%", left: "34%", color: "gold", title: "Heat Shielding" },
  {
    id: 7,
    top: "78%",
    left: "82%",
    color: "purple",
    title: "Air Filter Housing",
  },
  { id: 8, top: "33%", left: "86%", color: "red", title: "Battery" },
  {
    id: 9,
    top: "65%",
    left: "10%",
    color: "green",
    title: "Power Steering Fluid",
  },
  { id: 10, top: "64%", left: "88%", color: "red", title: "Fuse Box" },
];

const colorMap: Record<PinColor, { bg: string; badge: string; text: string; label: string }> = {
  green: {
    bg: "#1a7a4a",
    badge: "rgba(26,122,74,0.2)",
    text: "#4ddb94",
    label: "Easy to Check",
  },
  gold: {
    bg: "#8a6010",
    badge: "rgba(201,168,76,0.15)",
    text: "var(--color-gold)",
    label: "Watch Carefully",
  },
  red: {
    bg: "#8a1a1a",
    badge: "rgba(214,59,59,0.15)",
    text: "#ff7070",
    label: "Serious Red Flag",
  },
  purple: {
    bg: "var(--color-vivid)",
    badge: "rgba(90,48,105,0.2)",
    text: "var(--color-accent)",
    label: "Need to Know",
  },
};

type CardContent = {
  subtitle: string;
  what: string;
  steps: string[];
  flag: string;
  flagColor: PinColor;
  flag2?: string;
};

const engineCards: Record<number, CardContent> = {
  1: {
    subtitle: "The plastic cover that hides the engine below",
    what: "The engine cover is a plastic panel that sits on top of the engine. It's mostly cosmetic; it makes the engine bay look clean and reduces noise.",
    steps: [
      "Check if the cover is cracked or warped. Minor cosmetic damage is fine; significant damage suggests rough handling.",
      "Look at whether it sits evenly. A cover that doesn't sit flush can mean lots of DIY repairs.",
      "Ask the mechanic to remove it and look at what's underneath.",
    ],
    flag: "A clean, intact engine cover on a high-mileage car is actually a good sign; it means the seller cared about presentation.",
    flagColor: "gold",
  },
  2: {
    subtitle: "Open this: what's inside tells you a lot",
    what: "The oil filler cap is the round cap on top of the engine where you pour new oil in. It takes two seconds to open and what you see inside tells you things the dipstick alone cannot.",
    steps: [
      "Twist it counterclockwise and lift off. Look at the underside of the cap and inside the opening.",
      "Look for any white or cream-colored residue, froth, or buildup.",
      "Smell inside briefly; it should smell like oil, nothing chemical or sweet.",
    ],
    flag: "Serious red flag: White or creamy residue that looks like mayonnaise is an emulsion of oil and coolant, caused by a blown head gasket. This repair can exceed $3,000. Walk away or negotiate hard.",
    flagColor: "red",
    flag2:
      "Also watch for: Thick sludge like tar. This means the engine went extended periods without oil changes. A sludged engine has shortened lifespan.",
  },
  3: {
    subtitle: "Never open when hot. Read it cold.",
    what: "The coolant reservoir is a translucent plastic tank that holds the engine's coolant. Most modern cars have an overflow reservoir you can read without opening anything.",
    steps: [
      "Look at the exterior of the tank; it's translucent so you can see the level without opening it.",
      "Check that the level is between MIN and MAX markers.",
      "Look at the color through the tank walls. Coolant should be bright green, orange, pink, or blue.",
      "Only open the cap if the engine is completely cold; hot coolant under pressure can cause serious burns.",
    ],
    flag: "Red flags: Brown or rusty coolant means neglect. Milky or foamy coolant means oil has mixed in: head gasket failure, a $1,500 to $3,000+ repair.",
    flagColor: "red",
  },
  4: {
    subtitle: "One belt runs almost everything; know what to look for",
    what: "The serpentine belt drives the alternator, power steering pump, AC compressor, and water pump. If it breaks while driving, you lose all of those systems simultaneously.",
    steps: [
      "With the engine OFF, locate the belt, a wide, flat ribbed belt running between multiple pulleys.",
      "Look at the ribbed side. Fine cracks between the ribs are the first sign of aging.",
      "Check the smooth back side. A glazed, shiny appearance means the belt is slipping.",
      "Ask your mechanic to assess remaining life during the inspection.",
    ],
    flag: "Price impact: Serpentine belt replacement costs $75 to $200 parts and labor. If it looks worn, use it as a negotiating point, not a deal-breaker.",
    flagColor: "gold",
  },
  5: {
    subtitle: "The system that keeps the engine from overheating",
    what: "The radiator is the large flat heat-exchanger at the front of the engine bay. Hot coolant from the engine flows through it and air passing through the fins cools it down before it recirculates.",
    steps: [
      "With the engine cold, look at the front of the radiator for bent fins, cracks, or signs of leakage (dried green, orange, or pink residue).",
      "Check around the base of the radiator and hoses for wet spots or dried coolant stains.",
      "Start the engine and let it warm up. The fan should turn on after a few minutes at idle.",
      "Check the temperature gauge during your test drive; it should stay in the normal range.",
    ],
    flag: "Red flag: Any coolant leak is a repair item before purchase. A cracked radiator replacement runs $300 to $900. Overheating on the test drive is a serious warning.",
    flagColor: "red",
  },
  6: {
    subtitle: "The foil-like material protecting wires and hoses from heat",
    what: "Heat shielding is a reflective foil or wrapped material that protects fuel lines, wiring harnesses, and rubber hoses from the extreme heat generated by the exhaust manifold and engine block.",
    steps: [
      "Look for shielding that's loose, hanging, or completely missing in sections.",
      "Check nearby rubber hoses and wiring for heat damage: cracking, melting, or discoloration.",
      "Ask your mechanic to check if the shielding is intact and if any heat-sensitive components show wear.",
    ],
    flag: "Missing heat shielding isn't an immediate breakdown, but damaged wiring from heat exposure can cause intermittent electrical problems that are expensive and hard to diagnose.",
    flagColor: "gold",
  },
  7: {
    subtitle:
      "Where the engine breathes, and what a dirty filter signals",
    what: "The air filter housing is the black plastic box that the air intake hose connects to. Inside is the air filter, a paper or foam element that keeps dust and debris out of the engine.",
    steps: [
      "Find the large black plastic box, usually connected to a wide intake hose going toward the engine.",
      "If you can open it (usually 2-4 clips), look at the filter inside. Hold it up to the light.",
      "A clean filter is light gray or white. A dirty filter is dark gray or black.",
    ],
    flag: 'A severely clogged filter on a car with "full service history" is a red flag: either the service records are incomplete or the seller is exaggerating. Air filters cost $15-30 and should be replaced every 15,000-30,000 miles.',
    flagColor: "gold",
  },
  8: {
    subtitle: "Corrosion tells the story. So does the date.",
    what: "The 12-volt battery powers the starter motor, all electronics, and keeps the car's computers alive when the engine is off. Most car batteries last 3-5 years. Replacement is $100-$250.",
    steps: [
      "Find the battery, a large rectangular box, usually in a corner of the engine bay.",
      "Look for a date sticker on the top or side; most batteries are stamped with month/year of manufacture.",
      "Look at the terminals. Check for corrosion (white, blue, or green fuzzy buildup).",
      "Look at the battery case: check for bulging, cracking, or leaking.",
    ],
    flag: "Red flags: Heavy corrosion on terminals, a date that's 4+ years old, or a bulging battery case. A visibly old battery is a $150-$250 legitimate ask off the price.",
    flagColor: "red",
  },
  9: {
    subtitle: "Easy to check, tells you if the steering system is healthy",
    what: "The power steering reservoir is a small translucent tank that holds the hydraulic fluid that makes turning the steering wheel easy. Many newer cars have electric power steering and won't have this; that's normal.",
    steps: [
      "Find the reservoir; it's usually small and labeled with a steering wheel icon.",
      "Check the fluid level through the translucent side; it should be between MIN and MAX.",
      "Look at the color. New fluid is clear to light yellow. Dark brown or black means it's overdue.",
      "During the test drive, listen for a whining noise when turning.",
    ],
    flag: "Low fluid without a visible leak means the system is consuming fluid, indicating a slow leak somewhere. Whining on turns + low fluid = power steering pump issue. That's a $200-$600 repair.",
    flagColor: "gold",
  },
  10: {
    subtitle: "The box that keeps the car's electricity safe",
    what: "The fuse box holds tiny safety pieces called fuses that protect every electrical circuit in the car. If something goes wrong electrically, a fuse blows to stop damage, like a safety switch.",
    steps: [
      "Ask to open the fuse box lid. Look for any fuses that are visibly blown; the metal strip inside will be broken.",
      "Look for mismatched fuses. A 30-amp fuse in a slot rated for 10-amp means someone bypassed an electrical problem. This is dangerous.",
      "Check for burn marks, dark spots, melting, or a burnt smell inside the box.",
      "Look for dirt, water stains, or rust inside. The inside should be completely clean and dry.",
      "Check if wires look messy, taped, or spliced together. Clean, factory wiring is normal.",
    ],
    flag: "Red flag: Blown fuses, mismatched fuses, burn marks, or messy wiring mean existing electrical problems. Electrical issues on used cars are among the hardest and most expensive to diagnose.",
    flagColor: "red",
  },
};

// Shared "bright bar on the left" callout, matching the Important/InfoBox
// treatment used elsewhere on the site: rounded card, small bold colored
// label, plain white body text.
function FlagCallout({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl py-4 px-5"
      style={{
        background: "var(--color-bg-page)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p className="text-[0.85rem] font-bold mb-1.5" style={{ color }}>
        {label}
      </p>
      <p className="text-[1.02rem] text-white leading-[1.75]">{text}</p>
    </div>
  );
}

function EngineDiagram() {
  const [active, setActive] = useState<number | null>(null);
  const card = active ? engineCards[active] : null;
  const pin = active ? enginePins.find((p) => p.id === active) : null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [active]);

  // Keep the detail panel capped to the engine image's rendered height
  // (which is set by aspect-ratio, not content) so long descriptions
  // scroll inside the panel instead of stretching the image taller.
  useEffect(() => {
    const el = imageWrapRef.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setPanelHeight(mq.matches ? el.clientHeight : undefined);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    mq.addEventListener("change", update);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <div
      className="border-b"
      style={{
        background: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="px-20 py-14 border-b max-md:px-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-[1400px] mx-auto flex justify-between items-end gap-10 max-md:flex-col max-md:items-start max-md:gap-3">
          <h2 className="text-[4rem] max-md:text-[2.6rem]">
            What to <em>Actually</em> Look For
          </h2>
          <p className="text-[0.92rem] text-white leading-[1.7] max-w-[360px] text-right mb-2 max-md:text-left max-md:mb-0">
            Click any numbered pin on the engine to learn what that component
            does, how to inspect it yourself, and what condition it should be in.
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-[1fr_minmax(0,420px)] max-lg:grid-cols-1"
      >
        {/* Image + pins */}
        <div
          ref={imageWrapRef}
          className="relative overflow-hidden"
          style={{ background: "var(--color-bg-surface)", aspectRatio: "3/2" }}
        >
          <Image
            src="/engine-diagram.png"
            alt="Car engine bay"
            fill
            style={{ objectFit: "cover" }}
          />
          {enginePins.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(active === p.id ? null : p.id)}
              className="absolute w-[30px] h-[30px] rounded-full flex items-center justify-center text-white font-bold border-2 border-white/90 z-10 transition-all duration-150 cursor-pointer"
              style={{
                top: p.top,
                left: p.left,
                transform: "translate(-50%, -50%)",
                fontSize: "0.7rem",
                background: active === p.id ? "#fff" : colorMap[p.color].bg,
                color: active === p.id ? colorMap[p.color].bg : "#fff",
                outline: active === p.id ? "3px solid white" : "none",
                outlineOffset: 2,
              }}
            >
              {p.id}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div
          className="flex flex-col border-l overflow-hidden max-lg:border-l-0 max-lg:border-t"
          style={{
            background: "var(--color-bg-page)",
            borderColor: "var(--color-border)",
            height: panelHeight,
          }}
        >
          {/* Legend */}
          <div
            className="flex flex-wrap gap-3 px-6 py-4 border-b text-[0.85rem]"
            style={{
              background: "rgba(0,0,0,0.2)",
              borderColor: "var(--color-border)",
            }}
          >
            {Object.entries(colorMap).map(([key, val]) => (
              <span
                key={key}
                className="flex items-center gap-1"
                style={{ color: "#fff" }}
              >
                <span
                  className="w-[9px] h-[9px] rounded-full flex-shrink-0"
                  style={{ background: val.bg }}
                />
                {val.label}
              </span>
            ))}
          </div>

          {/* Content */}
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <span className="text-3xl">&#128269;</span>
              <p className="text-[0.85rem] text-white">
                Click any numbered pin
                <br />
                on the engine image
              </p>
              <p className="text-[0.8rem] text-white">
                10 components to inspect
              </p>
            </div>
          ) : card && pin ? (
            <div className="flex flex-col flex-1 overflow-hidden slide-up">
              <div
                className="px-7 py-6 border-b"
                style={{
                  background: "var(--color-bg-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <p className="text-[1.65rem] font-extrabold leading-[1.2] mb-1">
                  {pin.title}
                </p>
                <p className="text-base text-white italic">
                  {card.subtitle}
                </p>
              </div>

              <div ref={scrollRef} className="px-7 py-5 flex-1 overflow-y-auto space-y-4 scrollbar-none">
                <div>
                  <p
                    className="text-[1rem] font-bold mb-2"
                    style={{ color: "var(--color-accent)" }}
                  >
                    What it is
                  </p>
                  <p className="text-[1.05rem] text-white leading-[1.85]">
                    {card.what}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[1rem] font-bold mb-2"
                    style={{ color: "var(--color-accent)" }}
                  >
                    How to check it
                  </p>
                  <ol className="list-none space-y-3">
                    {card.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[1.05rem] text-white leading-[1.7]"
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[0.6rem] font-bold text-white"
                          style={{ background: "var(--color-vivid)" }}
                        >
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <FlagCallout
                  label={colorMap[card.flagColor].label}
                  text={card.flag}
                  color={colorMap[card.flagColor].text}
                />
                {card.flag2 && (
                  <FlagCallout
                    label="Also Watch For"
                    text={card.flag2}
                    color="var(--color-gold)"
                  />
                )}
              </div>

              {/* Nav dots */}
              <div
                className="flex flex-wrap gap-1 px-7 py-3 border-t"
                style={{
                  borderColor: "var(--color-border)",
                  background: "rgba(90,48,105,0.04)",
                }}
              >
                {enginePins.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[0.62rem] font-bold border transition-all duration-150 cursor-pointer"
                    style={{
                      background:
                        active === p.id ? "var(--color-vivid)" : "transparent",
                      borderColor:
                        active === p.id
                          ? "var(--color-vivid)"
                          : "rgba(90,48,105,0.2)",
                      color: "#fff",
                    }}
                  >
                    {p.id}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Winding Road: "How to Schedule a PPI" ────────────────────
type RoadItem = { strong: string; text: string };

function WindingRoad({ items }: { items: RoadItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());

  // Snakes left-to-right, then right-to-left on the next row, so the
  // road stays short and wide instead of one long vertical scroll.
  const [cols, setCols] = useState(1);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setCols(mq.matches ? 3 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Measured in pixels so the popup card can be clamped to the actual
  // rendered width instead of the viewport — on narrow phones the road
  // container is much narrower than 100vw, and a viewport-based max
  // width let the card spill past the container's edges.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fades/scales the popup in on open rather than snapping into view.
  const [entered, setEntered] = useState(false);

  const width = cols === 1 ? 400 : 1040;
  const stepY = cols === 1 ? 230 : 170;
  const topPad = 90;
  const bottomPad = 90;
  const rows = Math.ceil(items.length / cols);
  const height = topPad + (rows - 1) * stepY + bottomPad;
  const colWidth = width / cols;
  const amp = 70;

  const stops = items.map((_, i) => {
    const row = Math.floor(i / cols);
    const idxInRow = i % cols;
    const col = row % 2 === 0 ? idxInRow : cols - 1 - idxInRow;
    return {
      x:
        cols === 1
          ? width / 2 - amp * Math.sin(i * 1.15 + 0.4)
          : colWidth * (col + 0.5),
      y: topPad + row * stepY,
    };
  });

  // Bows each segment perpendicular to its direction (up/down for
  // horizontal stretches, left/right for the vertical connectors),
  // alternating sign so the road reads as one continuous curvy line.
  const bulge = 34;
  let pathD = `M ${stops[0].x} ${stops[0].y}`;
  for (let i = 1; i < stops.length; i++) {
    const p0 = stops[i - 1];
    const p1 = stops[i];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const sign = i % 2 === 0 ? -1 : 1;
    const c1x = horizontal ? p0.x + dx * 0.33 : p0.x + sign * bulge;
    const c1y = horizontal ? p0.y + sign * bulge : p0.y + dy * 0.33;
    const c2x = horizontal ? p0.x + dx * 0.66 : p1.x + sign * bulge;
    const c2y = horizontal ? p1.y + sign * bulge : p0.y + dy * 0.66;
    pathD += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`;
  }

  const shown = hovered !== null ? hovered : active;
  const shownItem = shown !== null ? items[shown] : null;
  const shownStop = shown !== null ? stops[shown] : null;
  const shownRow = shown !== null ? Math.floor(shown / cols) : 0;
  const flipBelow = shownRow === 0;

  // Clamp the popup card to the measured container so it can never
  // spill past the road's own edges, regardless of viewport width.
  const sidePad = 12;
  const scale = containerWidth ? containerWidth / width : 0;
  const popupWidthPx = containerWidth
    ? Math.min(300, containerWidth - sidePad * 2)
    : 300;
  const popupLeftPx =
    shownStop && containerWidth
      ? Math.min(
          Math.max(shownStop.x * scale - popupWidthPx / 2, sidePad),
          containerWidth - popupWidthPx - sidePad
        )
      : 0;

  useEffect(() => {
    if (shown === null) return;
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [shown]);

  const openStop = (i: number) => {
    setActive((cur) => (cur === i ? null : i));
    setVisited((prev) => new Set(prev).add(i));
  };

  const dismiss = () => {
    setActive(null);
    setHovered(null);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{
          width: "100%",
          maxWidth: cols === 1 ? 520 : 1040,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          {/* Road surface */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-bg-mid)"
            strokeWidth="30"
            strokeLinecap="round"
          />
          {/* Lane dashes */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="3"
            strokeDasharray="12 14"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>

        {/* Stops — idle/active treatment matches the pink-slip hotspots:
            dashed border at rest, colored border + tinted fill + glow when active */}
        {items.map((item, i) => {
          const s = stops[i];
          const isActive = active === i;
          const isShown = shown === i;
          const isVisited = visited.has(i);
          return (
            <button
              key={i}
              onClick={() => openStop(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className="absolute z-10 select-none rounded-3xl px-7 py-6 text-[1.05rem] font-bold text-center leading-snug transition-all duration-200 w-[210px] max-md:w-[180px] max-md:text-[0.95rem] max-md:px-5 max-md:py-5 cursor-pointer"
              style={{
                left: `${(s.x / width) * 100}%`,
                top: `${(s.y / height) * 100}%`,
                transform: `translate(-50%, -50%) scale(${isShown ? 1.04 : 1})`,
                background:
                  isActive || isVisited
                    ? "rgba(149,51,165,0.16)"
                    : "var(--color-bg-surface)",
                color: "#fff",
                border:
                  isActive || isShown || isVisited
                    ? "2px solid var(--color-vivid)"
                    : "1.5px dashed rgba(255,255,255,0.35)",
                boxShadow: isShown
                  ? "0 0 24px 4px rgba(149,51,165,0.35)"
                  : "none",
              }}
            >
              <span
                className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-[0.75rem] font-bold text-white border-2"
                style={{
                  background: "var(--color-vivid)",
                  borderColor: "var(--color-bg-page)",
                }}
              >
                {i + 1}
              </span>
              {item.strong}
            </button>
          );
        })}

        {/* Explanation card: shows on hover as a transient preview, and
            stays pinned after a click until dismissed. Flips below the
            stop for the top row so it never overlaps the button. */}
        {shownItem && shownStop && (
          <>
            {active !== null && (
              <div className="fixed inset-0 z-40" onClick={dismiss} />
            )}
            <div
              className="absolute z-50 select-none rounded-2xl py-5 px-6 max-md:py-4 max-md:px-5 pointer-events-none"
              style={{
                left: `${popupLeftPx}px`,
                top: `${(shownStop.y / height) * 100}%`,
                transform: `${
                  flipBelow
                    ? "translateY(26px)"
                    : "translateY(calc(-100% - 26px))"
                } scale(${entered ? 1 : 0.95})`,
                transformOrigin: flipBelow ? "top center" : "bottom center",
                opacity: entered ? 1 : 0,
                transition: "opacity 180ms ease, transform 180ms ease",
                width: popupWidthPx,
                background: "var(--color-bg-page)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
              }}
            >
              {active === shown && (
                <button
                  onClick={dismiss}
                  className="absolute top-3 right-4 text-white text-2xl leading-none cursor-pointer pointer-events-auto"
                  aria-label="Close"
                >
                  &times;
                </button>
              )}
              <p
                className="text-[1.02rem] font-bold mb-2 pr-6"
                style={{ color: "var(--color-light)" }}
              >
                {shownItem.strong}
              </p>
              <p className="text-[0.98rem] text-white leading-[1.75]">
                {shownItem.text}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inspectionAccordion = [
  {
    trigger: "Engine: The Heart of the Car",
    body: (
      <ul className="space-y-3 ml-5 list-disc">
        <li>
          <strong>Oil leaks:</strong> Is oil dripping from the engine?
          Small leaks become big repairs.
        </li>
        <li>
          <strong>Coolant leaks:</strong> Overheating can destroy an
          engine quickly and expensively.
        </li>
        <li>
          <strong>Timing belt/chain:</strong> If this snaps while driving,
          your engine could be totaled.
        </li>
        <li>
          <strong>Check engine light codes:</strong> Even if the light
          isn&apos;t on, a mechanic can pull stored codes.
        </li>
        <li>
          <strong>Compression test:</strong> Reveals internal engine wear
          that visual inspection can&apos;t catch.
        </li>
      </ul>
    ),
  },
  {
    trigger: "Transmission: Often the Most Expensive Fix",
    body: (
      <div className="space-y-3">
        <p>
          Transmission repairs can cost $3,000-$8,000. An inspector checks
          for:
        </p>
        <ul className="space-y-2 ml-5 list-disc">
          <li>Smooth gear shifts (automatics and manuals)</li>
          <li>
            Fluid condition and color (should be clear pink or red, not brown or
            burnt)
          </li>
          <li>Slipping between gears under acceleration</li>
          <li>Unusual sounds during gear changes</li>
        </ul>
      </div>
    ),
  },
  {
    trigger: "Brakes: Non-Negotiable Safety",
    body: (
      <ul className="space-y-3 ml-5 list-disc">
        <li>
          <strong>Brake pad thickness:</strong> Under 3mm means immediate
          replacement.
        </li>
        <li>
          <strong>Rotor condition:</strong> Scored, cracked, or warped
          rotors affect stopping distance.
        </li>
        <li>
          <strong>Brake fluid:</strong> Old fluid absorbs moisture and
          reduces braking performance.
        </li>
        <li>
          <strong>ABS function:</strong> Anti-lock braking systems require
          specific diagnostic tools to verify.
        </li>
      </ul>
    ),
  },
  {
    trigger: "Suspension & Steering",
    body: (
      <div className="space-y-3">
        <p>
          Suspension issues directly affect handling and safety at highway
          speeds, and are one of the most commonly missed problems in
          seller-provided inspections.
        </p>
        <ul className="space-y-2 ml-5 list-disc">
          <li>Ball joints, tie rods, and control arms</li>
          <li>
            CV axle boots (watch for cracking or grease spray on surrounding
            surfaces)
          </li>
          <li>Shock absorbers and struts</li>
          <li>Steering rack condition</li>
        </ul>
      </div>
    ),
  },
  {
    trigger: "Body & Frame: Accident History",
    body: (
      <div className="space-y-3">
        <p>
          A Carfax report helps but isn&apos;t the whole picture. A physical
          inspection can catch:
        </p>
        <ul className="space-y-2 ml-5 list-disc">
          <li>Uneven panel gaps (signs of bodywork after an accident)</li>
          <li>Mismatched paint (inconsistent sheen = repainted panel)</li>
          <li>Frame damage or previous straightening</li>
          <li>
            Undercarriage rust, especially in previously-northeastern cars
          </li>
        </ul>
        <p>
          <strong>Pro tip:</strong> Get a Carfax AND a physical inspection. They
          catch different things.
        </p>
      </div>
    ),
  },
];

const brands = [
  {
    name: "Toyota",
    logo: "/logo-toyota.png",
    url: "https://www.toyota.com/dealers/",
  },
  {
    name: "Honda",
    logo: "/logo-honda.png",
    url: "https://automobiles.honda.com/tools/dealer-locator",
  },
  { name: "Ford", logo: "/logo-ford.png", url: "https://ford.com/dealerships" },
  {
    name: "Nissan",
    logo: "/logo-nissan.png",
    url: "https://nissanusa.com/dealer-locator.html",
  },
  {
    name: "Chevrolet",
    logo: "/logo-chevrolet.png",
    url: "https://chevrolet.com/dealer-locator",
  },
  {
    name: "Hyundai",
    logo: "/logo-hyundai.png",
    url: "https://hyundaiusa.com/us/en/dealer-locator",
  },
  {
    name: "Mazda",
    logo: "/logo-mazda.png",
    url: "https://mazdausa.com/shopping-tools/dealer-locator",
  },
  {
    name: "Volkswagen",
    logo: "/logo-vw.png",
    url: "https://vw.com/find-a-dealer",
  },
];

export default function InspectionPage() {
  return (
    <>
      <PageHero
        kicker=""
        contained
        title={
          <>
            Don&apos;t Buy a Car
            <br />
            <em>Without This.</em>
          </>
        }
        titleStyle={
          { fontSize: "clamp(2.6rem,4.2vw,4.6rem)" } as React.CSSProperties
        }
        subtitle="A pre-purchase inspection (PPI) is the single most important thing you can do before buying a used car. It costs $100-200 and can save you thousands."
      />

      {/* What is a PPI */}
      <FadeUp>
        <section
          id="ppi-basics"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <div className="max-w-[1400px] mx-auto">
          <div
            className="grid grid-cols-[540px_1fr] gap-20 items-start max-lg:grid-cols-1 max-lg:gap-12"
          >
            <div>
              <SectionTitle
                style={
                  { fontSize: "clamp(2rem,3.6vw,3rem)" } as React.CSSProperties
                }
              >
                What Is a<br />
                <em>Pre-Purchase Inspection?</em>
              </SectionTitle>
              <p className="text-[1.1rem] leading-[1.85] text-white mt-10 max-w-[540px]">
                A PPI is when you pay an <strong>independent mechanic</strong>,
                not the seller, not the dealership, to inspect a
                car before you buy it.
              </p>
              <p className="text-[1.1rem] leading-[1.85] text-white mt-5 max-w-[540px]">
                A good PPI costs <strong>$100-$200</strong> and is the
                single most powerful tool you have before signing anything.
              </p>
            </div>
            <div className="max-w-[460px] ml-auto max-lg:ml-0">
              <p
                className="text-[1.15rem] font-bold mb-5"
                style={{ color: "#d8b4fe" }}
              >
                A PPI is not the same as
              </p>
              <div style={{ borderTop: "1px solid var(--color-border)" }}>
                {[
                  { term: "The seller\u2019s inspection", def: "they\u2019re trying to sell you the car." },
                  { term: "Your own visual check", def: "you\u2019re not a trained mechanic." },
                  { term: "A test drive", def: "you can\u2019t see what\u2019s happening under the hood." },
                ].map(({ term, def }) => (
                  <div
                    key={term}
                    className="py-4"
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <p className="text-[1.02rem] font-bold text-white mb-1">
                      {term}
                    </p>
                    <p className="text-[0.95rem] text-white/70 leading-[1.6]">
                      {def}
                    </p>
                  </div>
                ))}
              </div>
              <WarningBox className="!mt-4">
                If a dealer refuses to let you take the car to an
                independent mechanic, walk away. That refusal is your
                answer.
              </WarningBox>
            </div>
          </div>
          </div>
        </section>
      </FadeUp>

      {/* Engine Diagram */}
      <FadeUp>
        <section id="engine-diagram" className="p-0">
          <EngineDiagram />
        </section>
      </FadeUp>

      {/* Where to get one */}
      <FadeUp>
        <section
          id="where-to-get"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <div className="max-w-[1400px] mx-auto">
          <SectionTitle className="mb-12">Where to Get a PPI</SectionTitle>
          <CardGrid
            cards={[
              {
                num: "National Services",
                title: "Independent Inspection Services",
                body: (
                  <>
                    <p className="mb-3">
                      <strong>Lemon Squad</strong> (lemonsquad.com):
                      Mobile service, 110-point inspection. Cost: $150-250.
                    </p>
                    <p>
                      <strong>CARCHEX</strong> (carchex.com): Mobile or
                      shop-based, detailed report. Cost: $100-200.
                    </p>
                  </>
                ),
              },
              {
                num: "Manufacturer Network",
                title: "Manufacturer Dealerships",
                recommended: true,
                body: (
                  <>
                    <p className="mb-3">
                      If you&apos;re buying a used Honda from a Mitsubishi
                      dealership,{" "}
                      <strong>
                        take it to a Honda dealership for the PPI.
                      </strong>
                    </p>
                    <p>
                      They know that brand inside and out, have the right
                      diagnostic equipment, and have zero incentive to lie.
                      Cost: usually $100-150.
                    </p>
                  </>
                ),
              },
              {
                num: "If You Have It",
                title: "AAA Membership",
                body: "Many AAA locations offer free or discounted PPIs for members. Check your local AAA auto service center.",
              },
              {
                num: "If You Trust Them",
                title: "Trusted Local Mechanics",
                body: 'If you have a mechanic you trust, ask if they do PPIs. Red flags: they refuse to put findings in writing, they rush through it, or they tell you "everything looks fine" without checking anything.',
              },
            ]}
          />
          </div>
        </section>
      </FadeUp>

      {/* Dealer locators */}
      <FadeUp>
        <section
          id="dealer-locators"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <div className="max-w-[1400px] mx-auto">
          <SectionTitle className="mb-3">
            Find a <em>Manufacturer Dealership</em>
          </SectionTitle>
          <p className="text-[0.95rem] text-white leading-[1.7] max-w-[650px] mb-10">
            Buying a used Honda from a Mitsubishi dealer? Take it to a Honda
            dealership for your PPI. They know that brand, have the right tools,
            and have zero incentive to lie.
          </p>
          <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-4 p-8 max-md:p-6 rounded-2xl border border-[var(--color-border)] no-underline transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]"
                style={{ background: "var(--color-bg-surface)" }}
              >
                <div className="w-[72px] h-[72px] max-md:w-[56px] max-md:h-[56px] flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={72}
                    height={72}
                    className="object-contain"
                  />
                </div>
                <p className="text-[1.05rem] font-bold text-white">
                  {brand.name}
                </p>
              </Link>
            ))}
          </div>
          </div>
        </section>
      </FadeUp>

      {/* What inspectors check */}
      <FadeUp>
        <section
          id="what-to-inspect"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <div className="max-w-[1400px] mx-auto">
          <SectionTitle
            className="mb-8"
            style={
              { fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties
            }
          >
            Why You&apos;re <em>Paying for Your Safety</em>
          </SectionTitle>
          <p className="text-[1.05rem] text-white leading-[1.75] max-w-[680px] mb-8">
            A good inspector goes through the car systematically. Here&apos;s
            what they&apos;re checking, and why each category matters.
          </p>
          <Accordion items={inspectionAccordion} />
          </div>
        </section>
      </FadeUp>

      {/* Pullquote */}
      <FadeUp>
        <section
          className="px-20 py-24 max-md:px-6 max-md:py-16"
          style={{ background: "var(--color-bg-surface)", margin: 0 }}
        >
          <div className="max-w-[1400px] mx-auto">
          <Pullquote
			quote={
              <>
                Your salesperson is not your friend, your partner, or
                someone looking out for your <strong>best interests</strong>.
                They&apos;re paid on <strong>commission</strong>. The more
                you pay, the more they make. This doesn&apos;t mean
                they&apos;re evil. It just means you need to{" "}
                <strong>protect yourself</strong>.
              </>
            }
            cite="Rana Darwich, VINdicated Founder"
          />
          </div>
        </section>
      </FadeUp>

      {/* How to schedule */}
      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div className="max-w-[1400px] mx-auto">
          <SectionTitle className="mb-4 text-center">How to Schedule a PPI</SectionTitle>
          <p className="text-[0.95rem] text-white leading-[1.7] max-w-[560px] mx-auto mb-10 text-center">
            Follow the road, stop by stop. Tap a stop to read what to do there.
          </p>
          <WindingRoad
            items={[
              {
                strong: "Find your inspector first.",
                text: "Before you fall in love with a car. Having a go-to mechanic removes the pressure to scramble when you find a car you like.",
              },
              {
                strong: "Tell the seller upfront.",
                text: '"I\'d like to have this inspected by an independent mechanic before purchasing." Any seller who refuses is a red flag; walk away.',
              },
              {
                strong: "You take the car to the mechanic",
                text: 'for private sellers. For dealerships, negotiate: "I\'d like to take it for an extended test drive to a mechanic I\'ve already booked." Get it in writing.',
              },
              {
                strong: "Get the report in writing.",
                text: "Every finding, documented. No verbal summaries. You want a paper trail, for both negotiating and your own records.",
              },
              {
                strong: "Use the findings to negotiate.",
                text: "Found a leaking CV boot? That's $300-600 in repairs. Ask the seller to reduce the price accordingly or fix it before sale.",
              },
              {
                strong: "You can still walk away after a PPI.",
                text: "If the findings are serious and the seller won't negotiate, you didn't waste your money. You saved yourself from a much bigger loss.",
              },
            ]}
          />
          <InfoBox
            label="Important"
            className="mx-auto"
            style={{ maxWidth: 1040 }}
          >
            If a seller stalls on producing service records or promises
            they&apos;ll &quot;get them later,&quot; schedule the inspection
            before you commit emotionally.{" "}
            <strong>
              Schedule the inspection before you&apos;re attached, not
              after.
            </strong>
          </InfoBox>
          </div>
        </section>
      </FadeUp>
    </>
  );
}
