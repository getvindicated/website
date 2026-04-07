"use client";

import { useState } from "react";
import { PageHero, FadeUp } from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────
type PinColor = "red" | "gold" | "purple" | "green";

const pinColorMap: Record<
  PinColor,
  {
    bg: string;
    border: string;
    hoverBg: string;
    hlBorder: string;
    hlBg: string;
  }
> = {
  red: {
    bg: "var(--color-red)",
    border: "rgba(214,59,59,0.4)",
    hoverBg: "rgba(214,59,59,0.08)",
    hlBorder: "var(--color-red)",
    hlBg: "rgba(214,59,59,0.14)",
  },
  gold: {
    bg: "var(--color-gold)",
    border: "rgba(201,168,76,0.4)",
    hoverBg: "rgba(201,168,76,0.08)",
    hlBorder: "var(--color-gold)",
    hlBg: "rgba(201,168,76,0.12)",
  },
  purple: {
    bg: "var(--color-vivid)",
    border: "rgba(124,58,237,0.5)",
    hoverBg: "rgba(124,58,237,0.08)",
    hlBorder: "var(--color-light)",
    hlBg: "rgba(124,58,237,0.12)",
  },
  green: {
    bg: "#2d9e6b",
    border: "rgba(45,158,107,0.4)",
    hoverBg: "rgba(45,158,107,0.08)",
    hlBorder: "#2d9e6b",
    hlBg: "rgba(45,158,107,0.12)",
  },
};

// ── Document Exhibit ─────────────────────────────────────────
type PinData = { n: number; top: string; left: string; color: PinColor };
type HlData = {
  n: number;
  top: string;
  left: string;
  w: string;
  h: string;
  color: PinColor;
};
type CardData = {
  badge: string;
  badgeColor: PinColor;
  title: React.ReactNode;
  body: React.ReactNode;
  verdict: React.ReactNode;
  verdictColor: PinColor;
};

function DocExhibit({
  image,
  alt,
  pins,
  highlights,
  cards,
  navLabels,
}: {
  image: string;
  alt: string;
  pins: PinData[];
  highlights: HlData[];
  cards: Record<number, CardData>;
  navLabels: Record<number, string>;
}) {
  const [active, setActive] = useState<number | null>(null);
  const card = active !== null ? cards[active] : null;

  return (
    <div
      className="grid max-lg:grid-cols-1"
      style={{ gridTemplateColumns: "1fr 380px" }}
    >
      {/* Image */}
      <div
        className="p-5 border-r border-white/[0.08] overflow-y-auto max-lg:border-r-0 max-lg:border-b"
        style={{
          background: "var(--color-bg-mid)",
          maxHeight: "calc(100vh - 62px)",
          position: "sticky",
          top: 62,
        }}
      >
        <div className="relative inline-block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} className="w-full block" />

          {/* Highlights */}
          {highlights.map(({ n, top, left, w, h, color }) => {
            const cfg = pinColorMap[color];
            return (
              <div
                key={n}
                className="absolute pointer-events-none rounded-sm border-2 transition-opacity duration-200"
                style={{
                  top,
                  left,
                  width: w,
                  height: h,
                  opacity: active === n ? 1 : 0,
                  borderColor: cfg.hlBorder,
                  background: cfg.hlBg,
                }}
              />
            );
          })}

          {/* Pins */}
          {pins.map(({ n, top, left, color }) => {
            const cfg = pinColorMap[color];
            return (
              <button
                key={n}
                className="absolute w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.54rem] font-semibold text-white border border-white/80 z-20 transition-all duration-150"
                style={{
                  top,
                  left,
                  transform:
                    active === n
                      ? "translate(-50%,-50%) scale(1.2)"
                      : "translate(-50%,-50%)",
                  background: active === n ? "white" : cfg.bg,
                  color: active === n ? cfg.bg : "#fff",
                  boxShadow:
                    active === n
                      ? "0 0 0 3px rgba(255,255,255,0.25)"
                      : undefined,
                }}
                onClick={() => setActive(active === n ? null : n)}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div
        className="flex flex-col"
        style={{ background: "var(--color-bg-surface)" }}
      >
        {/* Legend */}
        <div
          className="flex flex-wrap gap-3 px-6 py-3 border-b"
          style={{
            borderColor: "var(--color-border)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          {(
            [
              ["red", "Critical caveat"],
              ["gold", "Price impact"],
              ["purple", "Know this"],
              ["green", "Good sign"],
            ] as [PinColor, string][]
          ).map(([color, label]) => (
            <div key={color} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: pinColorMap[color].bg }}
              />
              <span className="text-[0.55rem] uppercase tracking-[0.08em] text-white/60">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Prompt or card */}
        {!card ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span
              className="text-2xl point-left"
              style={{ color: "var(--color-light)" }}
            >
              ←
            </span>
            <p className="text-[0.62rem] text-white/60">
              Click any numbered
              <br />
              pin on the document
            </p>
          </div>
        ) : (
          <div
            className="slide-up flex-1 overflow-y-auto scrollbar-none"
            key={active}
          >
            <div className="px-7 py-5">
              <p
                className="text-[0.56rem] uppercase tracking-widest mb-2"
                style={{ color: pinColorMap[card.badgeColor].hlBorder }}
              >
                {card.badge}
              </p>
              <h3 className="text-[1.2rem] font-bold leading-[1.15] mb-4">
                {card.title}
              </h3>
              <div className="text-[0.83rem] text-white/80 leading-[1.75] mb-4">
                {card.body}
              </div>
              <div
                className="px-4 py-3 border-l-[3px] text-[0.8rem] leading-[1.6]"
                style={{
                  borderColor: pinColorMap[card.verdictColor].bg,
                  background: pinColorMap[card.verdictColor].hoverBg,
                  color: "#fff",
                }}
              >
                {card.verdict}
              </div>
            </div>
            {/* Nav */}
            <div
              className="flex flex-wrap gap-1 px-6 py-3 border-t"
              style={{
                borderColor: "var(--color-border)",
                background: "rgba(90,48,105,0.04)",
              }}
            >
              {pins.map(({ n, color }) => (
                <button
                  key={n}
                  onClick={() => setActive(n)}
                  className="px-3 py-1 text-[0.52rem] uppercase tracking-[0.06em] border transition-all duration-150"
                  style={{
                    borderColor:
                      active === n
                        ? pinColorMap[color].bg
                        : "rgba(90,48,105,0.2)",
                    color:
                      active === n
                        ? pinColorMap[color].hlBorder
                        : "rgba(255,255,255,0.5)",
                    background:
                      active === n ? pinColorMap[color].hoverBg : "none",
                  }}
                >
                  {navLabels[n]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Buyers Guide Accordion ───────────────────────────────────
const bgItems = [
  {
    tag: "Most Important",
    tagColor: "red" as PinColor,
    title: '"AS IS — NO DEALER WARRANTY"',
    body: (
      <>
        <p>
          This is the most important box on the form. If the &quot;As Is&quot; box is
          checked, the dealer is telling you:{" "}
          <strong>
            if anything breaks after you drive off the lot, that is entirely
            your problem.
          </strong>{" "}
          No refunds. No repairs. No obligation.
        </p>
      </>
    ),
    flag: {
      color: "red" as PinColor,
      text: 'What to do: If a car is sold "As Is," price that risk into your offer. Budget for potential repairs. And get an independent inspection before you buy — it is the only protection you have.',
    },
  },
  {
    tag: "Know This",
    tagColor: "gold" as PinColor,
    title: '"DEALER WARRANTY" — Full or Limited',
    body: (
      <>
        <p>
          If the Dealer Warranty box is checked, the dealer is promising to
          cover certain repairs for a limited time.{" "}
          <strong>Full Warranty</strong> means 100%.{" "}
          <strong>Limited Warranty</strong> means a percentage — read those
          numbers carefully.
        </p>
      </>
    ),
    flag: {
      color: "gold" as PinColor,
      text: "Always ask for the warranty in writing. The form says what systems are covered and for how long. Verbal warranties are nearly impossible to enforce.",
    },
  },
  {
    tag: "Know This",
    tagColor: "purple" as PinColor,
    title: '"MANUFACTURER\'S WARRANTY STILL APPLIES"',
    body: (
      <>
        <p>
          This means the original factory warranty has not yet expired. Some of
          the car components are still covered by the manufacturer — not the
          dealer. This is genuinely valuable.
        </p>
      </>
    ),
    flag: {
      color: "purple" as PinColor,
      text: "Look up the warranty terms for that specific make and model. A car still under manufacturer warranty is worth more.",
    },
  },
  {
    tag: "Watch This",
    tagColor: "gold" as PinColor,
    title: '"SERVICE CONTRACT" Available for Extra Charge',
    body: (
      <>
        <p>
          A service contract (extended warranty) is optional and not free. The
          word &quot;available&quot; means they want to sell it to you — not that you need
          it.
        </p>
      </>
    ),
    flag: {
      color: "gold" as PinColor,
      text: "If you want extended coverage: Compare the the dealer price to third-party providers. The the dealer version is almost always more expensive for the same coverage.",
    },
  },
  {
    tag: "Protects You",
    tagColor: "green" as PinColor,
    title: '"SPOKEN PROMISES ARE DIFFICULT TO ENFORCE"',
    body: (
      <>
        <p>
          This line is federal law telling you directly:{" "}
          <strong>do not trust verbal promises.</strong> Any promise a dealer
          makes that is not written on the contract does not legally exist.
        </p>
      </>
    ),
    flag: {
      color: "green" as PinColor,
      text: "The rule: Any promise not written on the contract does not exist. If they won't write it down, they don't intend to keep it.",
    },
  },
  {
    tag: "Know This",
    tagColor: "purple" as PinColor,
    title: '"ASK THE DEALER IF YOUR MECHANIC CAN INSPECT"',
    body: (
      <>
        <p>
          This line is also federal law. You do not need to ask permission. You
          have the right. California law additionally requires dealers to post a
          sign inside the dealership stating this.
        </p>
      </>
    ),
    flag: {
      color: "green" as PinColor,
      text: "Always get the inspection. A $100–$200 inspection before purchase is the cheapest insurance you can buy.",
    },
  },
];

function BuyersGuideAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div
      className="border-t"
      style={{
        borderColor: "rgba(26,10,46,0.12)",
        background: "var(--color-bg-surface)",
      }}
    >
      {bgItems.map((item, i) => {
        const cfg = pinColorMap[item.tagColor];
        return (
          <div
            key={i}
            className="border-b"
            style={{ borderColor: "rgba(26,10,46,0.1)" }}
          >
            <button
              className="w-full flex items-center gap-3 px-7 py-4 transition-colors duration-150 bg-transparent border-none text-left"
              onClick={() => setOpen(open === i ? null : i)}
              style={{ cursor: "none" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(90,48,105,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              <span
                className="text-[0.65rem] font-bold px-2 py-1 rounded-sm whitespace-nowrap flex-shrink-0"
                style={{
                  background: cfg.hoverBg,
                  color: cfg.hlBorder,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                {item.tag}
              </span>
              <span className="text-[0.88rem] font-bold flex-1 leading-[1.3]">
                {item.title}
              </span>
              <span
                className="text-[1.2rem] flex-shrink-0 transition-transform duration-200 font-light"
                style={{
                  color: "#fff",
                  transform: open === i ? "rotate(45deg)" : "none",
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div className="px-7 pb-5 slide-up">
                <div className="text-[0.87rem] text-white/80 leading-[1.72] mb-3">
                  {item.body}
                </div>
                <div
                  className="px-4 py-3 border-l-[3px] text-[0.82rem] leading-[1.6] text-white"
                  style={{ borderColor: cfg.bg, background: cfg.hoverBg }}
                >
                  {item.flag.text}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function DocumentsPage() {
  return (
    <>
      <PageHero
        kicker="Interactive Document Exhibits"
        title={
          <>
            Real documents.
            <br />
            <em>Decoded.</em>
          </>
        }
        subtitle="A Carfax decoded pin by pin, plus the FTC Buyers Guide explained in plain English — the two documents every used car buyer needs to understand."
      />

      {/* Carfax Page 1 */}
      <FadeUp>
        <section
          id="ex-carfax1"
          className="border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="px-14 py-10 border-b max-md:px-6"
            style={{
              background: "var(--color-bg-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <p
              className="text-[0.6rem] tracking-wide mb-2"
              style={{ color: "var(--color-light)" }}
            >
              Exhibit 01 — Carfax Vehicle History Report · Page 1
            </p>
            <h2 className="text-[1.75rem] font-black leading-[1.1] mb-2">
              How to Read a Carfax
              <br />
              <em>Page One</em>
            </h2>
            <p className="text-[0.88rem] text-white/70 leading-[1.7] max-w-[680px]">
              Every Carfax leads with the same structure: mileage and VIN,
              accident history, reliability forecast, and recent service. This
              walkthrough explains what each section means and how each finding
              affects what you should pay.
            </p>
          </div>
          <DocExhibit
            image="/carfax-p1.png"
            alt="Carfax Page 1"
            pins={[
              { n: 1, top: "22%", left: "50%", color: "gold" },
              { n: 2, top: "35%", left: "19%", color: "green" },
              { n: 3, top: "47%", left: "19%", color: "purple" },
              { n: 4, top: "38%", left: "62%", color: "purple" },
              { n: 5, top: "55%", left: "50%", color: "red" },
              { n: 6, top: "71%", left: "50%", color: "green" },
            ]}
            highlights={[
              {
                n: 1,
                top: "20%",
                left: "1%",
                w: "97%",
                h: "7%",
                color: "gold",
              },
              {
                n: 2,
                top: "30%",
                left: "19%",
                w: "40%",
                h: "13%",
                color: "green",
              },
              {
                n: 3,
                top: "43%",
                left: "19%",
                w: "40%",
                h: "11%",
                color: "purple",
              },
              {
                n: 4,
                top: "26%",
                left: "62%",
                w: "36%",
                h: "32%",
                color: "purple",
              },
              { n: 5, top: "54%", left: "1%", w: "97%", h: "4%", color: "red" },
              {
                n: 6,
                top: "63%",
                left: "1%",
                w: "97%",
                h: "17%",
                color: "green",
              },
            ]}
            navLabels={{
              1: "Mileage",
              2: "No Accidents",
              3: "Reliability",
              4: "Summary",
              5: "Disclaimer",
              6: "Service",
            }}
            cards={{
              1: {
                badge: "01 — Mileage",
                badgeColor: "gold",
                title: (
                  <>
                    195,555 Miles —<br />
                    <em>What High Mileage Actually Means</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      <strong>Under 100k:</strong> Low mileage, most systems
                      within lifespan.
                      <br />
                      <strong>100k–150k:</strong> Sweet spot — depreciation
                      happened, systems still good.
                      <br />
                      <strong>150k–200k:</strong> High, but a well-maintained
                      Honda can reach 250k–300k+.
                    </p>
                    <p>
                      This car averaged 10,257 mi/yr under Owner 3 — well below
                      the 15,000/yr average. The 2013 Accord also uses a{" "}
                      <strong>timing chain, not a belt</strong> — removing one
                      major high-mileage expense.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>Price range:</strong> At 195k miles, a 2013 Accord
                    EX-L in good condition should be roughly $7,000–$10,000
                    depending on condition.
                  </>
                ),
                verdictColor: "gold",
              },
              2: {
                badge: "02 — Good Sign",
                badgeColor: "green",
                title: (
                  <>
                    No Accidents Reported —<br />
                    <em>A Real Green Flag, With One Caveat</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      No insurance claims, police reports, or rental damage
                      reports across all three owners. For a 13-year-old car at
                      195k miles, this is genuinely significant.
                    </p>
                    <p>
                      A clean accident history supports $1,000–$2,000 in premium
                      vs. comparable cars with reported accidents.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>The caveat:</strong> Carfax estimates up to 1 in 5
                    accidents goes unreported. &quot;No accidents reported&quot; ≠ &quot;no
                    accidents ever.&quot; A physical inspection catches unreported
                    damage.
                  </>
                ),
                verdictColor: "green",
              },
              3: {
                badge: "03 — Reliability",
                badgeColor: "purple",
                title: (
                  <>
                    Good Reliability Forecast —<br />
                    <em>What &quot;Good&quot; Means at 195k Miles</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      Top 50% vs. similar vehicles at similar mileage, average
                      repair cost $350/year. For a 13-year-old car at 195k, that
                      is solid.
                    </p>
                    <p>
                      Budget for ongoing repairs: spark plugs ($150–200),
                      accessory belt ($150–300), CV axles ($300–500), eventually
                      timing chain ($800–1,200).
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>Budget:</strong> $500–$1,000/year for maintenance at
                    this mileage. Factor it into your offer as honest financial
                    planning.
                  </>
                ),
                verdictColor: "purple",
              },
              4: {
                badge: "04 — Summary Stats",
                badgeColor: "purple",
                title: (
                  <>
                    17 Records, 3 Owners,
                    <br />
                    <em>Personal Use, California</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      <strong>17 service records</strong> means maintenance was
                      done at shops that report to Carfax.
                      <br />
                      <strong>Personal vehicle</strong> across all three owners
                      is better than commercial or fleet use.
                      <br />
                      <strong>California ownership</strong> means no rust from
                      northeastern salt-belt states.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>All-California ownership</strong> is a genuine
                    positive — it extends mechanical lifespan meaningfully.
                  </>
                ),
                verdictColor: "purple",
              },
              5: {
                badge: "05 — Critical Caveat",
                badgeColor: "red",
                title: (
                  <>
                    Carfax Own Disclaimer —<br />
                    <em>This Report Is Not Enough Alone</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      The small text says: &quot;Other information about this
                      vehicle, including problems, may not have been reported to
                      CARFAX. Use this report as one important tool, along with
                      a vehicle inspection and test drive.&quot;
                    </p>
                    <p>
                      <strong>
                        Carfax is telling you directly: do not rely only on this
                        report.
                      </strong>
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>Non-negotiable:</strong> A clean Carfax is necessary
                    but not sufficient. Always pair it with an independent
                    physical inspection.
                  </>
                ),
                verdictColor: "red",
              },
              6: {
                badge: "06 — Good Sign",
                badgeColor: "green",
                title: (
                  <>
                    Oil Changed August 2025 —<br />
                    <em>What Recent Service Signals</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      The current owner maintained this car right up to nearly
                      200,000 miles. A car serviced regularly to the point of
                      sale suggests the owner wasn&apos;t hiding a developing
                      problem.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>What to ask for:</strong> Request physical receipts,
                    not just the Carfax summary. Gaps in the record should be
                    explained by the current seller.
                  </>
                ),
                verdictColor: "green",
              },
            }}
          />
        </section>
      </FadeUp>

      {/* Carfax Page 2 */}
      <FadeUp>
        <section
          id="ex-carfax2"
          className="border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="px-14 py-10 border-b max-md:px-6"
            style={{
              background: "var(--color-bg-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <p
              className="text-[0.6rem] tracking-wide mb-2"
              style={{ color: "var(--color-light)" }}
            >
              Exhibit 02 — Carfax Vehicle History Report · Page 2
            </p>
            <h2 className="text-[1.75rem] font-black leading-[1.1] mb-2">
              How to Read a Carfax
              <br />
              <em>Page Two</em>
            </h2>
            <p className="text-[0.88rem] text-white/70 leading-[1.7] max-w-[680px]">
              The second page is where the serious history lives: title brands,
              the additional history grid, and the ownership table. These
              sections can reveal problems that do not appear anywhere else.
            </p>
          </div>
          <DocExhibit
            image="/carfax-p2.png"
            alt="Carfax Page 2"
            pins={[
              { n: 1, top: "13%", left: "1%", color: "green" },
              { n: 2, top: "51.5%", left: "1%", color: "purple" },
              { n: 3, top: "70%", left: "1%", color: "purple" },
              { n: 4, top: "78.5%", left: "1%", color: "gold" },
              { n: 5, top: "81%", left: "1%", color: "gold" },
            ]}
            highlights={[
              {
                n: 1,
                top: "13%",
                left: "1%",
                w: "97%",
                h: "39%",
                color: "green",
              },
              {
                n: 2,
                top: "51.5%",
                left: "1%",
                w: "97%",
                h: "17.5%",
                color: "purple",
              },
              {
                n: 3,
                top: "70%",
                left: "1%",
                w: "97%",
                h: "13%",
                color: "purple",
              },
              {
                n: 4,
                top: "78.5%",
                left: "1%",
                w: "97%",
                h: "2.5%",
                color: "gold",
              },
              {
                n: 5,
                top: "81%",
                left: "1%",
                w: "97%",
                h: "2.5%",
                color: "gold",
              },
            ]}
            navLabels={{
              1: "History Grid",
              2: "Title History",
              3: "Ownership",
              4: "Short Tenure",
              5: "Mileage Math",
            }}
            cards={{
              1: {
                badge: "01 — Additional History Grid",
                badgeColor: "green",
                title: (
                  <>
                    The Checks That Matter Most
                    <br />
                    <em>Any Flag Here Changes Everything</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      <strong>Total Loss:</strong> Declared worth less than
                      repair costs. These vehicles are worth 30–50% less.
                      <br />
                      <strong>Structural/Frame Damage:</strong> Affects handling
                      and crash safety permanently.
                      <br />
                      <strong>Airbag Deployment:</strong> Indicates a serious
                      collision. Verify replacement airbag quality.
                      <br />
                      <strong>Odometer Rollback:</strong> Federal crime. Walk
                      away immediately.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>Any flag in this grid</strong> is a serious
                    negotiating point or a deal-ender. &quot;Total Loss&quot; or
                    &quot;Structural Damage&quot; should make you question the asking
                    price by 30%+ or walk away.
                  </>
                ),
                verdictColor: "green",
              },
              2: {
                badge: "02 — Title History",
                badgeColor: "purple",
                title: (
                  <>
                    Title Brands and What They Mean
                    <br />
                    <em>Carfax Strongest Guarantee</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      <strong>Salvage:</strong> Total loss — legally cannot be
                      resold without rebuild and inspection.
                      <br />
                      <strong>Rebuilt/Reconstructed:</strong> Was salvage, was
                      repaired. Typically 20–40% below clean title.
                      <br />
                      <strong>Flood/Fire/Hail:</strong> Flood cars are
                      especially problematic — corrosion of electrical systems
                      can appear years later.
                      <br />
                      <strong>Lemon Law Buyback:</strong> Must be disclosed.
                      Legal to resell but represents known defect history.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>Carfax buyback guarantee</strong> covers
                    DMV-reported brands. It does not cover unreported damage —
                    which is why the physical inspection remains essential.
                  </>
                ),
                verdictColor: "purple",
              },
              3: {
                badge: "03 — Ownership Count and Length",
                badgeColor: "purple",
                title: (
                  <>
                    Reading the Ownership Table
                    <br />
                    <em>Tenure Matters More Than Count</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      <strong>Long tenures (3+ years each):</strong> Owners who
                      kept the car for years typically cared for it.
                      <br />
                      <strong>Short tenures (under 12 months):</strong> Always
                      ask what the current seller knows about why.
                      <br />
                      <strong>Many owners in quick succession:</strong> That car
                      has a story. It might be fine — or it might explain why no
                      one kept it.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>The ideal profile:</strong> One or two long-term
                    owners who drove average or below-average annual mileage.
                  </>
                ),
                verdictColor: "purple",
              },
              4: {
                badge: "04 — Short Ownership Tenures",
                badgeColor: "gold",
                title: (
                  <>
                    When Someone Only Kept It a Few Months
                    <br />
                    <em>How to Investigate Without Assuming</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      A short tenure does not automatically mean a problem — but
                      it deserves an explanation. Check: Did they do multiple
                      repairs during that tenure? Where did they buy it from?
                      Does the mileage add up to normal driving?
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>What to say:</strong> &quot;I noticed the previous owner
                    only kept this car for [X] months. Do you have any
                    information about why they sold?&quot; Their answer — or their
                    hesitation — is data.
                  </>
                ),
                verdictColor: "gold",
              },
              5: {
                badge: "05 — Calculating Mileage Yourself",
                badgeColor: "gold",
                title: (
                  <>
                    The Math the Carfax Sometimes Will not Do
                    <br />
                    <em>Always Run These Numbers Yourself</em>
                  </>
                ),
                body: (
                  <>
                    <p>
                      Subtract starting odometer from ending odometer to get
                      total miles per owner. Divide by tenure in months,
                      multiply by 12 to get annual rate. Compare to the
                      12,000–15,000 mile industry average.
                    </p>
                  </>
                ),
                verdict: (
                  <>
                    <strong>Why this matters:</strong> Annual mileage rate
                    reveals how the car was actually used — more informative
                    than total mileage alone.
                  </>
                ),
                verdictColor: "gold",
              },
            }}
          />
        </section>
      </FadeUp>

      {/* Buyers Guide */}
      <FadeUp>
        <section id="ex-buyers-guide">
          <div
            className="px-14 py-10 border-b max-md:px-6"
            style={{
              background: "var(--color-bg-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <p
              className="text-[0.6rem] tracking-wide mb-2"
              style={{ color: "var(--color-light)" }}
            >
              Exhibit 03 — FTC Buyers Guide
            </p>
            <h2 className="text-[1.75rem] font-black leading-[1.1] mb-2">
              The Sticker in Every Used Car Window
              <br />
              <em>What It Actually Means</em>
            </h2>
            <p className="text-[0.88rem] text-white/70 leading-[1.7] max-w-[680px]">
              Federal law requires this form to be displayed in the window of
              every used car for sale at a dealership. Most buyers glance at it
              and move on. Here is what every section actually means.
            </p>
          </div>

          <div
            className="grid gap-[1.5px] max-lg:grid-cols-1"
            style={{
              gridTemplateColumns: "1fr 1fr",
              background: "var(--color-border)",
            }}
          >
            <div
              className="flex items-start justify-center p-6"
              style={{ background: "var(--color-bg-surface)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/buyers-guide-p1.png"
                alt="FTC Buyers Guide"
                className="w-full max-w-[520px] block border"
                style={{ borderColor: "rgba(90,48,105,0.2)" }}
              />
            </div>
            <div style={{ background: "var(--color-bg-surface)" }}>
              <div
                className="px-7 py-4 border-b"
                style={{
                  borderColor: "var(--color-border)",
                  background: "rgba(90,48,105,0.06)",
                }}
              >
                <p
                  className="text-[0.78rem] font-semibold"
                  style={{ color: "var(--color-accent)" }}
                >
                  Click any section below to expand it
                </p>
              </div>
              <BuyersGuideAccordion />
            </div>
          </div>

          {/* Takeaway strip */}
          <div
            className="grid gap-[1.5px] max-lg:grid-cols-1"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              background: "var(--color-border)",
            }}
          >
            {[
              {
                color: "var(--color-gold)",
                label: "The Most Important Line",
                title: '"Keep this form."',
                body: "The Buyers Guide is part of the contract. Keep your copy. If the the dealer warranty promises do not match what they told you, this is your evidence.",
              },
              {
                color: "var(--color-red)",
                label: "Federal Violation",
                title: "Removing the sticker before sale is illegal.",
                body: "16 C.F.R. 455 prohibits removing the Buyers Guide before consumer purchase. If it's not in the window, that's a federal violation you can report to the FTC.",
              },
              {
                color: "var(--color-light)",
                label: "Check These Two Things",
                title: "VIN + Warranty Status",
                body: "Cross-check the VIN on the Buyers Guide with the dashboard VIN and the title. Note exactly which warranty box is checked before any conversation about price.",
              },
            ].map(({ color, label, title, body }) => (
              <div
                key={label}
                className="p-8"
                style={{ background: "var(--color-bg-surface)" }}
              >
                <p className="text-[0.72rem] font-bold mb-2" style={{ color }}>
                  {label}
                </p>
                <p className="text-[0.88rem] font-semibold mb-2">{title}</p>
                <p className="text-[0.93rem] leading-[1.65] text-white/80">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>
    </>
  );
}
