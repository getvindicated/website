"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PageHero,
  FadeUp,
  Divider,
  SectionLabel,
  SectionTitle,
  Accordion,
  Checklist,
  Pullquote,
  CardGrid,
  InfoBox,
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
  { id: 1, top: "12%", left: "71%", color: "purple", title: "Engine Cover" },
  { id: 2, top: "55%", left: "27%", color: "gold", title: "Oil Filler Cap" },
  {
    id: 3,
    top: "28%",
    left: "14%",
    color: "green",
    title: "Coolant Reservoir",
  },
  { id: 4, top: "80%", left: "22%", color: "gold", title: "Serpentine Belt" },
  { id: 5, top: "88%", left: "48%", color: "green", title: "Radiator & Fan" },
  { id: 6, top: "12%", left: "38%", color: "gold", title: "Heat Shielding" },
  {
    id: 7,
    top: "83%",
    left: "78%",
    color: "purple",
    title: "Air Filter Housing",
  },
  { id: 8, top: "38%", left: "82%", color: "red", title: "Battery" },
  {
    id: 9,
    top: "65%",
    left: "10%",
    color: "green",
    title: "Power Steering Fluid",
  },
  { id: 10, top: "64%", left: "82%", color: "red", title: "Fuse Box" },
];

const colorMap: Record<
  PinColor,
  { bg: string; badge: string; text: string; label: string }
> = {
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
    what: "The engine cover is a plastic panel that sits on top of the engine. It\u2019s mostly cosmetic \u2014 it makes the engine bay look clean and reduces noise.",
    steps: [
      "Check if the cover is cracked or warped. Minor cosmetic damage is fine; significant damage suggests rough handling.",
      "Look at whether it sits evenly. A cover that doesn\u2019t sit flush can mean lots of DIY repairs.",
      "Ask the mechanic to remove it and look at what\u2019s underneath.",
    ],
    flag: "A clean, intact engine cover on a high-mileage car is actually a good sign \u2014 it means the seller cared about presentation.",
    flagColor: "gold",
  },
  2: {
    subtitle: "Open this \u2014 what\u2019s inside tells you a lot",
    what: "The oil filler cap is the round cap on top of the engine where you pour new oil in. It takes two seconds to open and what you see inside tells you things the dipstick alone cannot.",
    steps: [
      "Twist it counterclockwise and lift off. Look at the underside of the cap and inside the opening.",
      "Look for any white or cream-colored residue, froth, or buildup.",
      "Smell inside briefly \u2014 it should smell like oil, nothing chemical or sweet.",
    ],
    flag: "Serious red flag: White or creamy residue that looks like mayonnaise is an emulsion of oil and coolant \u2014 caused by a blown head gasket. This repair can exceed $3,000. Walk away or negotiate hard.",
    flagColor: "red",
    flag2:
      "Also watch for: Thick sludge like tar. This means the engine went extended periods without oil changes. A sludged engine has shortened lifespan.",
  },
  3: {
    subtitle: "Never open when hot. Read it cold.",
    what: "The coolant reservoir is a translucent plastic tank that holds the engine\u2019s coolant. Most modern cars have an overflow reservoir you can read without opening anything.",
    steps: [
      "Look at the exterior of the tank \u2014 it\u2019s translucent so you can see the level without opening it.",
      "Check that the level is between MIN and MAX markers.",
      "Look at the color through the tank walls. Coolant should be bright green, orange, pink, or blue.",
      "Only open the cap if the engine is completely cold \u2014 hot coolant under pressure can cause serious burns.",
    ],
    flag: "Red flags: Brown or rusty coolant means neglect. Milky or foamy coolant means oil has mixed in \u2014 head gasket failure, a $1,500 to $3,000+ repair.",
    flagColor: "red",
  },
  4: {
    subtitle: "One belt runs almost everything \u2014 know what to look for",
    what: "The serpentine belt drives the alternator, power steering pump, AC compressor, and water pump. If it breaks while driving, you lose all of those systems simultaneously.",
    steps: [
      "With the engine OFF, locate the belt \u2014 a wide, flat ribbed belt running between multiple pulleys.",
      "Look at the ribbed side. Fine cracks between the ribs are the first sign of aging.",
      "Check the smooth back side. A glazed, shiny appearance means the belt is slipping.",
      "Ask your mechanic to assess remaining life during the inspection.",
    ],
    flag: "Price impact: Serpentine belt replacement costs $75 to $200 parts and labor. If it looks worn, use it as a negotiating point \u2014 not a deal-breaker.",
    flagColor: "gold",
  },
  5: {
    subtitle: "The system that keeps the engine from overheating",
    what: "The radiator is the large flat heat-exchanger at the front of the engine bay. Hot coolant from the engine flows through it and air passing through the fins cools it down before it recirculates.",
    steps: [
      "With the engine cold, look at the front of the radiator for bent fins, cracks, or signs of leakage (dried green, orange, or pink residue).",
      "Check around the base of the radiator and hoses for wet spots or dried coolant stains.",
      "Start the engine and let it warm up. The fan should turn on after a few minutes at idle.",
      "Check the temperature gauge during your test drive \u2014 it should stay in the normal range.",
    ],
    flag: "Red flag: Any coolant leak is a repair item before purchase. A cracked radiator replacement runs $300 to $900. Overheating on the test drive is a serious warning.",
    flagColor: "red",
  },
  6: {
    subtitle: "The foil-like material protecting wires and hoses from heat",
    what: "Heat shielding is a reflective foil or wrapped material that protects fuel lines, wiring harnesses, and rubber hoses from the extreme heat generated by the exhaust manifold and engine block.",
    steps: [
      "Look for shielding that\u2019s loose, hanging, or completely missing in sections.",
      "Check nearby rubber hoses and wiring for heat damage \u2014 cracking, melting, or discoloration.",
      "Ask your mechanic to check if the shielding is intact and if any heat-sensitive components show wear.",
    ],
    flag: "Missing heat shielding isn\u2019t an immediate breakdown \u2014 but damaged wiring from heat exposure can cause intermittent electrical problems that are expensive and hard to diagnose.",
    flagColor: "gold",
  },
  7: {
    subtitle:
      "Where the engine breathes \u2014 and what a dirty filter signals",
    what: "The air filter housing is the black plastic box that the air intake hose connects to. Inside is the air filter \u2014 a paper or foam element that keeps dust and debris out of the engine.",
    steps: [
      "Find the large black plastic box \u2014 usually connected to a wide intake hose going toward the engine.",
      "If you can open it (usually 2\u20134 clips), look at the filter inside. Hold it up to the light.",
      "A clean filter is light gray or white. A dirty filter is dark gray or black.",
    ],
    flag: 'A severely clogged filter on a car with "full service history" is a red flag \u2014 either the service records are incomplete or the seller is exaggerating. Air filters cost $15\u201330 and should be replaced every 15,000\u201330,000 miles.',
    flagColor: "gold",
  },
  8: {
    subtitle: "Corrosion tells the story. So does the date.",
    what: "The 12-volt battery powers the starter motor, all electronics, and keeps the car\u2019s computers alive when the engine is off. Most car batteries last 3\u20135 years. Replacement is $100\u2013$250.",
    steps: [
      "Find the battery \u2014 a large rectangular box, usually in a corner of the engine bay.",
      "Look for a date sticker on the top or side \u2014 most batteries are stamped with month/year of manufacture.",
      "Look at the terminals. Check for corrosion (white, blue, or green fuzzy buildup).",
      "Look at the battery case \u2014 check for bulging, cracking, or leaking.",
    ],
    flag: "Red flags: Heavy corrosion on terminals, a date that\u2019s 4+ years old, or a bulging battery case. A visibly old battery is a $150\u2013$250 legitimate ask off the price.",
    flagColor: "red",
  },
  9: {
    subtitle: "Easy to check, tells you if the steering system is healthy",
    what: "The power steering reservoir is a small translucent tank that holds the hydraulic fluid that makes turning the steering wheel easy. Many newer cars have electric power steering and won\u2019t have this \u2014 that\u2019s normal.",
    steps: [
      "Find the reservoir \u2014 it\u2019s usually small and labeled with a steering wheel icon.",
      "Check the fluid level through the translucent side \u2014 it should be between MIN and MAX.",
      "Look at the color. New fluid is clear to light yellow. Dark brown or black means it\u2019s overdue.",
      "During the test drive, listen for a whining noise when turning.",
    ],
    flag: "Low fluid without a visible leak means the system is consuming fluid \u2014 a slow leak somewhere. Whining on turns + low fluid = power steering pump issue. That\u2019s a $200\u2013$600 repair.",
    flagColor: "gold",
  },
  10: {
    subtitle: "The box that keeps the car\u2019s electricity safe",
    what: "The fuse box holds tiny safety pieces called fuses that protect every electrical circuit in the car. If something goes wrong electrically, a fuse blows to stop damage \u2014 like a safety switch.",
    steps: [
      "Ask to open the fuse box lid. Look for any fuses that are visibly blown \u2014 the metal strip inside will be broken.",
      "Look for mismatched fuses. A 30-amp fuse in a slot rated for 10-amp means someone bypassed an electrical problem. This is dangerous.",
      "Check for burn marks, dark spots, melting, or a burnt smell inside the box.",
      "Look for dirt, water stains, or rust inside. The inside should be completely clean and dry.",
      "Check if wires look messy, taped, or spliced together. Clean, factory wiring is normal.",
    ],
    flag: "Red flag: Blown fuses, mismatched fuses, burn marks, or messy wiring mean existing electrical problems. Electrical issues on used cars are among the hardest and most expensive to diagnose.",
    flagColor: "red",
  },
};

function EngineDiagram() {
  const [active, setActive] = useState<number | null>(null);
  const card = active ? engineCards[active] : null;
  const pin = active ? enginePins.find((p) => p.id === active) : null;

  return (
    <div
      className="border-b"
      style={{
        background: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="px-16 py-14 border-b max-md:px-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p
          className="text-[0.78rem] font-semibold mb-2"
          style={{ color: "var(--color-accent)" }}
        >
          Interactive Engine Diagram
        </p>
        <h2 className="text-[2rem] font-extrabold mb-3">
          Under the Hood \u2014 <em>What to Actually Look For</em>
        </h2>
        <p className="text-[0.92rem] text-white leading-[1.7] max-w-[680px]">
          Click any numbered pin on the engine to learn what that component
          does, how to inspect it yourself, and what condition it should be in.
        </p>
      </div>

      <div
        className="grid max-lg:grid-cols-1"
        style={{ gridTemplateColumns: "1fr 420px" }}
      >
        {/* Image + pins */}
        <div
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
              className="absolute w-[30px] h-[30px] rounded-full flex items-center justify-center text-white font-bold border-2 border-white/90 z-10 transition-all duration-150"
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
          }}
        >
          {/* Legend */}
          <div
            className="flex flex-wrap gap-3 px-6 py-4 border-b text-[0.72rem]"
            style={{
              background: "rgba(0,0,0,0.2)",
              borderColor: "var(--color-border)",
            }}
          >
            {Object.entries(colorMap).map(([key, val]) => (
              <span
                key={key}
                className="flex items-center gap-1"
                style={{ color: "rgba(255,255,255,0.7)" }}
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
              <span className="text-3xl opacity-40">&#128269;</span>
              <p className="text-[0.85rem] text-white">
                Click any numbered pin
                <br />
                on the engine image
              </p>
              <p className="text-[0.72rem] text-white/60">
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
                <span
                  className="inline-flex items-center text-[0.7rem] font-bold px-2 py-1 rounded mb-3 border"
                  style={{
                    background: colorMap[pin.color].badge,
                    color: colorMap[pin.color].text,
                    borderColor: colorMap[pin.color].text + "66",
                  }}
                >
                  {colorMap[pin.color].label}
                </span>
                <p className="text-[1.65rem] font-extrabold leading-[1.2] mb-1">
                  {pin.title}
                </p>
                <p className="text-base text-white/85 italic">
                  {card.subtitle}
                </p>
              </div>

              <div className="px-7 py-5 flex-1 overflow-y-auto space-y-4 scrollbar-none">
                <div>
                  <p
                    className="text-[0.75rem] font-bold uppercase tracking-[0.06em] mb-2"
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
                    className="text-[0.75rem] font-bold uppercase tracking-[0.06em] mb-2"
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
                <div
                  className="py-3 px-4 text-[1.05rem] leading-[1.75]"
                  style={{
                    borderLeft: `3px solid ${colorMap[card.flagColor].text}`,
                    background: `${colorMap[card.flagColor].badge}`,
                    color: colorMap[card.flagColor].text,
                  }}
                >
                  {card.flag}
                </div>
                {card.flag2 && (
                  <div
                    className="py-3 px-4 text-[1.05rem] leading-[1.75]"
                    style={{
                      borderLeft: "3px solid var(--color-gold)",
                      background: "rgba(201,168,76,0.08)",
                      color: "var(--color-gold)",
                    }}
                  >
                    {card.flag2}
                  </div>
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
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[0.62rem] font-bold border transition-all duration-150"
                    style={{
                      background:
                        active === p.id ? "var(--color-vivid)" : "transparent",
                      borderColor:
                        active === p.id
                          ? "var(--color-vivid)"
                          : "rgba(90,48,105,0.2)",
                      color: active === p.id ? "#fff" : "rgba(255,255,255,0.6)",
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

const inspectionAccordion = [
  {
    trigger: "Engine \u2014 The Heart of the Car",
    body: (
      <ul className="space-y-3 ml-5 list-disc">
        <li>
          <strong>Oil leaks</strong> \u2014 Is oil dripping from the engine?
          Small leaks become big repairs.
        </li>
        <li>
          <strong>Coolant leaks</strong> \u2014 Overheating can destroy an
          engine quickly and expensively.
        </li>
        <li>
          <strong>Timing belt/chain</strong> \u2014 If this snaps while driving,
          your engine could be totaled.
        </li>
        <li>
          <strong>Check engine light codes</strong> \u2014 Even if the light
          isn\u2019t on, a mechanic can pull stored codes.
        </li>
        <li>
          <strong>Compression test</strong> \u2014 Reveals internal engine wear
          that visual inspection can\u2019t catch.
        </li>
      </ul>
    ),
  },
  {
    trigger: "Transmission \u2014 Often the Most Expensive Fix",
    body: (
      <div className="space-y-3">
        <p>
          Transmission repairs can cost $3,000\u2013$8,000. An inspector checks
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
    trigger: "Brakes \u2014 Non-Negotiable Safety",
    body: (
      <ul className="space-y-3 ml-5 list-disc">
        <li>
          <strong>Brake pad thickness</strong> \u2014 Under 3mm means immediate
          replacement.
        </li>
        <li>
          <strong>Rotor condition</strong> \u2014 Scored, cracked, or warped
          rotors affect stopping distance.
        </li>
        <li>
          <strong>Brake fluid</strong> \u2014 Old fluid absorbs moisture and
          reduces braking performance.
        </li>
        <li>
          <strong>ABS function</strong> \u2014 Anti-lock braking systems require
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
          speeds \u2014 and are one of the most commonly missed problems in
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
    trigger: "Body & Frame \u2014 Accident History",
    body: (
      <div className="space-y-3">
        <p>
          A Carfax report helps but isn\u2019t the whole picture. A physical
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
        kicker="Education \u2014 Pre-Purchase Inspection"
        title={
          <>
            Don\u2019t Buy a Car
            <br />
            <em>Without This.</em>
          </>
        }
        subtitle="A pre-purchase inspection (PPI) is the single most important thing you can do before buying a used car. It costs $100\u2013200 and can save you thousands."
      />

      {/* What is a PPI */}
      <FadeUp>
        <section
          id="ppi-basics"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <div
            className="grid gap-20 items-start max-lg:grid-cols-1"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <div>
              <SectionLabel>The Basics</SectionLabel>
              <SectionTitle
                style={
                  { fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties
                }
              >
                What Is a<br />
                <em>Pre-Purchase Inspection?</em>
              </SectionTitle>
            </div>
            <div className="space-y-5">
              <p className="text-[1.1rem] leading-[1.85] text-white">
                A PPI is when you pay an <strong>independent mechanic</strong>{" "}
                \u2014 not the seller, not the dealership \u2014 to inspect a
                car before you buy it.
              </p>
              <div
                className="p-6"
                style={{
                  background: "rgba(214,59,59,0.08)",
                  border: "1px solid rgba(214,59,59,0.3)",
                  borderLeft: "4px solid var(--color-red)",
                }}
              >
                <p
                  className="text-[0.82rem] font-bold uppercase tracking-[0.04em] mb-3"
                  style={{ color: "var(--color-accent)" }}
                >
                  This is different from:
                </p>
                <p className="text-base text-white leading-[1.8]">
                  <strong>The seller\u2019s inspection</strong> \u2014
                  they\u2019re trying to sell you the car.
                  <br />
                  <strong>Your own visual check</strong> \u2014 you\u2019re not
                  a trained mechanic.
                  <br />
                  <strong>A test drive</strong> \u2014 you can\u2019t see
                  what\u2019s happening under the hood.
                </p>
              </div>
              <p className="text-[1.1rem] leading-[1.85] text-white">
                A good PPI costs <strong>$100\u2013$200</strong> and is the
                single most powerful tool you have before signing anything.
              </p>
              <div
                className="py-4 px-5"
                style={{
                  background: "rgba(214,59,59,0.08)",
                  borderLeft: "3px solid var(--color-red)",
                }}
              >
                <p
                  className="text-[1.05rem] leading-[1.75]"
                  style={{ color: "#ffb0b0" }}
                >
                  <strong>
                    If a dealer refuses to let you take the car to an
                    independent mechanic \u2014 walk away. That refusal is your
                    answer.
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeUp>

      <Divider />

      {/* Engine Diagram */}
      <FadeUp>
        <section id="engine-diagram" className="p-0">
          <EngineDiagram />
        </section>
      </FadeUp>

      <Divider />

      {/* Where to get one */}
      <FadeUp>
        <section
          id="where-to-get"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <SectionLabel>Your Options</SectionLabel>
          <SectionTitle className="mb-12">Where to Get a PPI</SectionTitle>
          <CardGrid
            cards={[
              {
                num: "Option 01 \u2014 National Services",
                title: "Independent Inspection Services",
                body: (
                  <>
                    <p className="mb-3">
                      <strong>Lemon Squad</strong> (lemonsquad.com) \u2014
                      Mobile service, 110-point inspection. Cost: $150\u2013250.
                    </p>
                    <p>
                      <strong>CARCHEX</strong> (carchex.com) \u2014 Mobile or
                      shop-based, detailed report. Cost: $100\u2013200.
                    </p>
                  </>
                ),
              },
              {
                num: "Option 02 \u2014 Best Option",
                title: "Manufacturer Dealerships",
                body: (
                  <>
                    <p className="mb-3">
                      If you\u2019re buying a used Honda from a Mitsubishi
                      dealership,{" "}
                      <strong>
                        take it to a Honda dealership for the PPI.
                      </strong>
                    </p>
                    <p>
                      They know that brand inside and out, have the right
                      diagnostic equipment, and have zero incentive to lie.
                      Cost: usually $100\u2013150.
                    </p>
                  </>
                ),
              },
              {
                num: "Option 03 \u2014 If You Have It",
                title: "AAA Membership",
                body: "Many AAA locations offer free or discounted PPIs for members. Check your local AAA auto service center.",
              },
              {
                num: "Option 04 \u2014 If You Trust Them",
                title: "Trusted Local Mechanics",
                body: 'If you have a mechanic you trust, ask if they do PPIs. Red flags: they refuse to put findings in writing, they rush through it, or they tell you "everything looks fine" without checking anything.',
              },
            ]}
          />
        </section>
      </FadeUp>

      <Divider />

      {/* Dealer locators */}
      <FadeUp>
        <section
          id="dealer-locators"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <SectionLabel>Manufacturer Dealership Locators</SectionLabel>
          <SectionTitle className="mb-3">
            Find a <em>Manufacturer Dealership</em>
          </SectionTitle>
          <p className="text-[0.95rem] text-white/80 leading-[1.7] max-w-[650px] mb-10">
            Buying a used Honda from a Mitsubishi dealer? Take it to a Honda
            dealership for your PPI. They know that brand, have the right tools,
            and have zero incentive to lie.
          </p>
          <div
            className="grid gap-[1.5px] max-md:grid-cols-2"
            style={{ gridTemplateColumns: "repeat(4,1fr)", background: "#000" }}
          >
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-4 p-8 no-underline transition-colors duration-200 group relative overflow-hidden"
                style={{ background: "#000" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "#111";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "#000";
                }}
              >
                <div className="w-[72px] h-[72px] flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={72}
                    height={72}
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[1.05rem] font-bold text-white">
                    {brand.name}
                  </p>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                  style={{ background: "var(--color-vivid)" }}
                />
              </Link>
            ))}
          </div>
        </section>
      </FadeUp>

      <Divider />

      {/* What inspectors check */}
      <FadeUp>
        <section
          id="what-to-inspect"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <SectionLabel>What Inspectors Check</SectionLabel>
          <SectionTitle
            className="mb-4"
            style={
              { fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties
            }
          >
            Why You\u2019re <em>Paying for Your Safety</em>
          </SectionTitle>
          <p className="text-[1.05rem] text-white/80 leading-[1.75] max-w-[680px] mb-8">
            A good inspector goes through the car systematically. Here\u2019s
            what they\u2019re checking \u2014 and why each category matters.
          </p>
          <Accordion items={inspectionAccordion} />
        </section>
      </FadeUp>

      <Divider />

      {/* Pullquote */}
      <FadeUp>
        <section
          className="px-20 py-24 max-md:px-6 max-md:py-16"
          style={{ background: "var(--color-bg-surface)", margin: 0 }}
        >
          <Pullquote
            quote='"Your salesperson is not your friend, your partner, or someone looking out for your best interests. They\u2019re paid on commission. The more you pay, the more they make. This doesn\u2019t mean they\u2019re evil. It just means you need to protect yourself."'
            cite="Rana Darwich, VINdicated Founder"
          />
        </section>
      </FadeUp>

      <Divider />

      {/* How to schedule */}
      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <SectionLabel>The Process</SectionLabel>
          <SectionTitle className="mb-10">How to Schedule a PPI</SectionTitle>
          <Checklist
            items={[
              {
                strong: "Find your inspector first.",
                text: "Before you fall in love with a car. Having a go-to mechanic removes the pressure to scramble when you find a car you like.",
              },
              {
                strong: "Tell the seller upfront.",
                text: '"I\u2019d like to have this inspected by an independent mechanic before purchasing." Any seller who refuses is a red flag \u2014 walk away.',
              },
              {
                strong: "You take the car to the mechanic",
                text: 'for private sellers. For dealerships, negotiate: "I\u2019d like to take it for an extended test drive to a mechanic I\u2019ve already booked." Get it in writing.',
              },
              {
                strong: "Get the report in writing.",
                text: "Every finding, documented. No verbal summaries. You want a paper trail \u2014 both for negotiating and for your own records.",
              },
              {
                strong: "Use the findings to negotiate.",
                text: "Found a leaking CV boot? That\u2019s $300\u2013600 in repairs. Ask the seller to reduce the price accordingly or fix it before sale.",
              },
              {
                strong: "You can still walk away after a PPI.",
                text: "If the findings are serious and the seller won't negotiate \u2014 you didn't waste your money. You saved yourself from a much bigger loss.",
              },
            ]}
          />
          <InfoBox label="Important">
            <p>
              If a seller stalls on producing service records or promises
              they\u2019ll \u201cget them later,\u201d schedule the inspection
              before you commit emotionally.{" "}
              <strong>
                Schedule the inspection before you\u2019re attached \u2014 not
                after.
              </strong>
            </p>
          </InfoBox>
        </section>
      </FadeUp>
    </>
  );
}
