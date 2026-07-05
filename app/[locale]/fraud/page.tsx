"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  PageHero,
  FadeUp,
  Divider,
  SectionTitle,
  Button,
} from "@/components/ui";
import { ScamNotebook } from "@/components/sections/ScamNotebook";
import { RedFlagField } from "@/components/sections/RedFlagField";

// ── Pink Slip hotspots ───────────────────────────────────────
// One object per field: position, content, and styling all live
// together, so nothing can drift out of sync with anything else.
const hotspots = [
  {
    id: "title",
    label: "Certificate of Title",
    top: "4%", left: "27%", w: "44%", h: "5%",
    danger: false,
    title: (
      <>
        California
        <br />
        <em>Certificate of Title</em>
      </>
    ),
    body: "This is the \u201cpink slip,\u201d issued by the California DMV and the only legal proof that someone owns a vehicle. When you buy a car, the seller signs the back and hands it to you. You take it to the DMV to transfer it into your name. Without this step, the car is not legally yours, no matter what you paid.",
    verdict: "If a seller says you don't need the pink slip, that they'll \u201cmail it later,\u201d or that it's \u201clost\u201d: do not complete the purchase.",
  },
  {
    id: "owner",
    label: "Registered Owner",
    top: "25%", left: "8%", w: "48%", h: "13%",
    danger: false,
    title: (
      <>
        Who Legally
        <br />
        <em>Owns This Car</em>
      </>
    ),
    body: "The name here must match the person selling you the car. Red flags: name doesn't match the seller's ID, the registered owner is an unknown business, or the seller claims to be selling \u201con behalf of\u201d someone without documentation.",
    verdict: "Always ask for the seller's government-issued ID. The name must match the title exactly.",
  },
  {
    id: "history",
    label: "Vehicle History",
    top: "6.5%", left: "61%", w: "34%", h: "5%",
    danger: true,
    title: (
      <>
        Vehicle History
        <br />
        <em>Check This First.</em>
      </>
    ),
    body: "This box records DMV flags: salvage designation, lemon law buyback, flood damage, or prior theft recovery. A \u201csalvage\u201d title means the car was declared a total loss by an insurer. Both salvage and rebuilt titles dramatically affect value.",
    verdict: "If you see any text in the Vehicle History box, research exactly what it means before proceeding.",
  },
  {
    id: "vin",
    label: "Vehicle ID Number",
    top: "12.5%", left: "8%", w: "47%", h: "5%",
    danger: false,
    title: (
      <>
        The VIN Must
        <br />
        <em>Match Exactly.</em>
      </>
    ),
    body: "The VIN is a unique 17-character code assigned at manufacture. Physically locate it on the car (dashboard and door jamb) and verify it matches this document character by character. A mismatch could indicate VIN cloning, where a stolen car takes the identity of a legitimate one.",
    verdict: "Enter the VIN at vehiclehistory.gov (free) or Carfax to check accident history and title status before anything else.",
  },
  {
    id: "signature",
    label: "Signature Section",
    top: "47%", left: "8%", w: "88%", h: "7%",
    danger: true,
    title: (
      <>
        The Seller Must Sign
        <br />
        <em>In Front of You.</em>
      </>
    ),
    body: "This is where the registered owner legally releases their interest in the vehicle. This must be signed in front of you at the time of sale, not pre-signed, not signed later, not by someone other than the registered owner. A pre-signed title means someone already released ownership; you don't know to whom, or when.",
    verdict: "Never accept: a pre-signed title, a blank signature section, or a signature from anyone other than the registered owner of record.",
  },
  {
    id: "odometer",
    label: "Odometer Disclosure",
    top: "56%", left: "8%", w: "88%", h: "10%",
    danger: true,
    title: (
      <>
        Mileage Fraud
        <br />
        <em>Is a Federal Crime.</em>
      </>
    ),
    body: "Federal law requires the seller to disclose actual mileage at time of sale. Odometer rollback is a federal offense under the Motor Vehicle Information and Cost Savings Act. Verify the reading here matches the car's physical odometer, then cross-check against the vehicle history report.",
    verdict: "If you suspect fraud: document the discrepancy with photos, do not complete the purchase, and report to NHTSA at nhtsa.gov.",
  },
];

// ── Signature draw-on animation ──────────────────────────────
function SignatureDraw() {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ top: "49%", left: "9%", width: "32%", height: "6%" }}
      viewBox="0 0 300 60"
      fill="none"
    >
      <path
        d="M5,40 C25,10 45,55 65,25 S105,15 125,35 S165,10 185,30 S225,50 255,20 S280,35 295,25"
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: 420,
          strokeDashoffset: drawn ? 0 : 420,
          transition: "stroke-dashoffset 1.1s ease-in-out",
        }}
      />
    </svg>
  );
}

// ── Odometer flip-up animation ───────────────────────────────
function OdometerFlip() {
  const [display, setDisplay] = useState("000000");

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1100;
    const target = 150000;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target).toString().padStart(6, "0"));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        top: "58.3%",
        left: "27.5%",
        width: "19%",
        height: "3.4%",
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "2px",
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, monospace",
          fontWeight: 700,
          fontSize: "clamp(0.5rem, 1.05vw, 0.82rem)",
          color: "#9fffb0",
          letterSpacing: "0.05em",
        }}
      >
        {display}
      </span>
    </div>
  );
}

function PinkSlipExplainer() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playKey, setPlayKey] = useState(0);
  const active = hotspots.find((h) => h.id === activeId) || null;

  function selectHotspot(id: string) {
    setActiveId((cur) => {
      const next = cur === id ? null : id;
      if (next) setPlayKey((k) => k + 1);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-12 mt-12 max-lg:grid-cols-1">
      {/* Document image, directly clickable */}
      <div className="relative select-none">
        <Image
          src="/pink-slip.png"
          alt="California Certificate of Title"
          width={0}
          height={0}
          sizes="50vw"
          className="w-full block h-auto"
          style={{
            border: "2px solid var(--color-border)",
            filter: active
              ? "brightness(1) saturate(1)"
              : "brightness(0.88) saturate(0.75)",
            transition: "filter 0.3s",
          }}
        />

        {/* Clickable regions, with a subtle idle outline so they read as interactive even before you click */}
        {hotspots.map((hl) => (
          <button
            key={hl.id}
            onClick={() => selectHotspot(hl.id)}
            className="absolute rounded-md transition-all duration-300 border-0 bg-transparent cursor-pointer"
            style={{
              top: hl.top,
              left: hl.left,
              width: hl.w,
              height: hl.h,
              border: activeId === hl.id
                ? `2px solid ${hl.danger ? "var(--color-red)" : "var(--color-gold)"}`
                : "1.5px dashed rgba(255,255,255,0.28)",
              background: activeId === hl.id
                ? hl.danger
                  ? "rgba(214,59,59,0.12)"
                  : "rgba(201,168,76,0.12)"
                : "transparent",
              boxShadow: activeId === hl.id
                ? `0 0 24px 4px ${hl.danger ? "rgba(214,59,59,0.35)" : "rgba(201,168,76,0.35)"}`
                : "none",
            }}
            aria-label={hl.label}
          />
        ))}

        {activeId === "signature" && <SignatureDraw key={playKey} />}
        {activeId === "odometer" && <OdometerFlip key={playKey} />}
      </div>

      {/* Field list + explainer (still works as an alternate path) */}
      <div className="max-lg:!static" style={{ position: "sticky", top: "5rem" }}>
        <div
          className="flex flex-col mb-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {hotspots.map((hl) => (
            <button
              key={hl.id}
              onClick={() => selectHotspot(hl.id)}
              className="text-left py-3 px-1 text-[1.05rem] transition-colors duration-150"
              style={{
                borderBottom: "1px solid var(--color-border)",
                color:
                  activeId === hl.id
                    ? hl.danger
                      ? "#ff6b6b"
                      : "var(--color-light)"
                    : "var(--color-white)",
                fontWeight: activeId === hl.id ? 700 : 400,
              }}
            >
              {hl.label}
            </button>
          ))}
        </div>

        {active === null ? (
          <p className="text-[0.9rem] text-white">
            Click directly on the document, or pick a field from the list above.
          </p>
        ) : (
          <div className="slide-up">
            <h3 className="text-[1.9rem] leading-[1.15] mb-5">{active.title}</h3>
            <p className="text-[1.15rem] text-white leading-[1.7] mb-6">
              {active.body}
            </p>
            <p className="text-[1.15rem] text-white font-semibold leading-[1.7]">
              {active.verdict}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const redFlags = [
  {
    trigger: '"Buy Today or Lose It": Artificial Urgency',
    body: (
      <div className="space-y-4">
        <p>
          One of the oldest tactics in the playbook. The salesperson implies
          another buyer is coming in tonight, the deal expires at close of
          business, or the price goes up tomorrow. None of this is usually true; the car has been sitting on the lot for weeks.
        </p>
        <p>
          It&apos;s designed to stop you from getting an independent inspection,
          sleeping on the decision, or comparing prices elsewhere.
        </p>
        <p>
          <strong>Your response:</strong> &ldquo;I&apos;ll need 48 hours to have
          the car independently inspected.&rdquo; A legitimate dealer
          accommodates this. A bad one won&apos;t, which is your answer.
        </p>
      </div>
    ),
  },
  {
    trigger: "The Four-Square Method: Payment Confusion",
    body: (
      <div className="space-y-4">
        <p>
          A widely documented dealer tactic where negotiations are split into
          four boxes: purchase price, trade-in value, down payment, and monthly
          payment. By shuffling focus between boxes, dealers can make a bad deal
          look good.
        </p>
        <p>
          A $400/month payment sounds reasonable until you realize it&apos;s
          over 84 months with a 20% APR. The four-square hides that math on
          purpose.
        </p>
        <p>
          <strong>Your response:</strong> Negotiate the out-the-door price only.
          Don&apos;t discuss monthly payments until the total price is locked in
          writing.
        </p>
      </div>
    ),
  },
  {
    trigger: 'Spot Delivery Scam: "Yo-Yo" Financing',
    body: (
      <div className="space-y-4">
        <p>
          You drive off the lot thinking the deal is done. Days or weeks later,
          the dealer calls to say financing &ldquo;fell through&rdquo; and you
          need to return the car or sign a new contract at a higher interest
          rate. By then, you&apos;ve already traded in your old car and
          emotionally moved on.
        </p>
        <p>
          <strong>Your response:</strong> Before you drive off, confirm in
          writing that financing is fully approved, not conditional. If
          they can&apos;t confirm it, don&apos;t take the car home yet.
        </p>
      </div>
    ),
  },
  {
    trigger: "The Finance Office Ambush: Hidden Arbitration Clauses",
    body: (
      <div className="space-y-4">
        <p>
          After you&apos;ve agreed on a price, you&apos;re handed a stack of
          paperwork in the finance office. Buried inside is often a mandatory
          arbitration clause, a provision that strips your right to sue
          the dealership in court if something goes wrong.
        </p>
        <p>
          Arbitration clauses are legal and common, but they&apos;re rarely
          explained. Studies have shown that consumers win in arbitration at far
          lower rates than in court.
        </p>
        <p>
          <strong>What to do:</strong> Read every document before signing. If
          you see &ldquo;arbitration,&rdquo; ask what it means and whether you can
          opt out. Some contracts allow you to opt out within 30 days of
          signing.
        </p>
      </div>
    ),
  },
  {
    trigger: "Post-Sale Document Pressure: The Second Signing",
    body: (
      <div className="space-y-4">
        <p>
          After the sale is complete, some dealers call buyers back in claiming
          a form was missed or a &ldquo;small correction&rdquo; is needed. What
          follows is a second round of signing, often done quickly and without a
          chance to read what&apos;s being signed.
        </p>
        <p>
          <strong>Your response:</strong> Never sign anything post-sale under
          time pressure. Ask them to mail or email it so you can review it
          first. You are under no legal obligation to sign new documents after a
          completed sale.
        </p>
      </div>
    ),
  },
  {
    trigger: "Add-Ons & Upsells: The Finance Office Markup",
    body: (
      <div className="space-y-4">
        <p>
          The finance office is where dealers make a significant portion of
          their profit, not on the car itself, but on add-ons presented as
          standard. Common examples:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>Nitrogen tire inflation ($200–$400)</strong>: Air
            is already 78% nitrogen. Widely considered a scam.
          </li>
          <li>
            <strong>VIN etching ($200–$400)</strong>: You can buy a
            kit and do this yourself for under $25.
          </li>
          <li>
            <strong>Paint/fabric protection ($300–$1,000)</strong>:
            Usually a basic wax application at extreme markup.
          </li>
          <li>
            <strong>GAP insurance (heavily marked up)</strong>:
            Legitimate, but available much cheaper through your own insurer.
          </li>
        </ul>
        <p>
          Everything in the finance office is optional. California law (AB68)
          requires each item to be listed separately with its individual cost.
        </p>
      </div>
    ),
  },
];

type KyrLaw = {
  tag: string;
  title: string;
  body: string;
  action: string;
  actionColor: string;
};

const federalLaws: KyrLaw[] = [
  {
    tag: "Truth in Lending Act (TILA)",
    title: "Your APR must be disclosed before you sign. No exceptions.",
    body: "The dealer is required by federal law to show you your Annual Percentage Rate, the total finance charge, and the total cost of the loan before you sign anything. On a $15,000 loan, the difference between 7% APR and 30% APR is over $8,000.",
    action:
      "\u201CShow me the APR, finance charge, and total of payments right now, before I sign.\u201D",
    actionColor: "var(--color-gold)",
  },
  {
    tag: "FTC Used Car Rule",
    title: "Every used car must have a Buyers Guide in the window.",
    body: "By law, every used car on a dealer lot must display a Buyers Guide sticker disclosing whether it has a warranty, what the warranty covers, or that it\u2019s sold \u201Cas is.\u201D The FTC can fine dealers up to $51,744 per missing sticker.",
    action:
      "No sticker visible, or a dealer who removes it before you can read it, is a federal violation. Document it.",
    actionColor: "var(--color-red)",
  },
  {
    tag: "Motor Vehicle Information Act",
    title: "Odometer rollback is a federal felony.",
    body: "The dealer must provide a written odometer disclosure at the time of sale. Cross-reference the number on the contract with the physical odometer, the Carfax report, and any service records. All three must match.",
    action:
      "If they don\u2019t match: Stop the transaction. Photograph everything. Report to the FTC at reportfraud.ftc.gov.",
    actionColor: "var(--color-red)",
  },
  {
    tag: "Fair Credit Reporting Act",
    title:
      "If they pull your credit, you\u2019re entitled to see exactly what they found.",
    body: "Dealers must give you a written disclosure showing your exact credit score, which bureau provided it, and how it affected your loan terms. Know your number before you walk in.",
    action:
      "Before you go: Pull your free report at annualcreditreport.com. Walk in knowing your number.",
    actionColor: "var(--color-gold)",
  },
];

const californiaLaws: KyrLaw[] = [
  {
    tag: "AB68: Cancellation",
    title:
      "You can undo the purchase within 2 days, but you have to buy this right at signing.",
    body: "California does not have an automatic cooling-off period. However, every licensed dealer must offer you a 2-day contract cancellation option on used cars priced $40,000 or less. It costs $75 to 1% of the purchase price plus a restocking fee if used, but it gives you a legal exit.",
    action:
      "\u201CI\u2019d like to purchase the 2-day contract cancellation option.\u201D",
    actionColor: "var(--color-accent)",
  },
  {
    tag: "AB68: Interest Rates",
    title:
      "Interest rate markups are capped. The dealer can\u2019t charge whatever they want.",
    body: "California law caps dealer interest rate markups: max 2% on loans over 60 months, max 2.5% on shorter loans. Getting pre-approved at a bank or credit union before you walk in removes this leverage entirely.",
    action:
      "Before you go: Get pre-approved. Walk in with a rate. They have to beat it.",
    actionColor: "var(--color-gold)",
  },
  {
    tag: "AB68: Add-Ons",
    title:
      "Every add-on must be listed separately with its own price. No bundling.",
    body: "Any financed item must appear as a separate line item. The dealer must show your monthly payment with and without each optional item. One big bundled number presented as \u201Cthe payment\u201D is a California law violation.",
    action:
      "\u201CIt\u2019s all just one package,\u201D that\u2019s not legal. Ask for itemized line items, in writing.",
    actionColor: "var(--color-red)",
  },
  {
    tag: "Prohibited Practice",
    title: "They cannot require an add-on as a condition of financing.",
    body: "No dealer can require you to purchase GAP insurance, an extended warranty, paint protection, or any other add-on as a condition of getting your loan approved. If a finance manager implies you \u201Chave to\u201D take an add-on to qualify, that\u2019s a lie, and it\u2019s illegal.",
    action:
      "\u201CPlease show me in writing where it says this is required to get financing.\u201D Watch what happens next.",
    actionColor: "var(--color-red)",
  },
];

function LawList({ laws }: { laws: KyrLaw[] }) {
  return (
    <div style={{ borderTop: "1px solid var(--color-border)" }}>
      {laws.map((law) => (
        <div
          key={law.tag}
          className="py-8"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <p
            className="text-[1rem] font-semibold mb-2"
            style={{ color: "var(--color-light)" }}
          >
            {law.tag}
          </p>
          <h3 className="text-[clamp(1.15rem,2vw,1.4rem)] leading-[1.3] tracking-[-0.01em] mb-3 max-w-[680px]">
            {law.title}
          </h3>
          <p className="text-[0.95rem] text-white leading-[1.8] mb-4 max-w-[680px]">
            {law.body}
          </p>
          <p
            className="text-[0.88rem] italic leading-[1.6] max-w-[680px]"
            style={{ color: law.actionColor }}
          >
            {law.action}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function FraudPage() {
  return (
    <>
      <PageHero
        kicker=""
        title={
          <>
            Know What
            <br />
            <em>They&apos;re Doing.</em>
          </>
        }
        subtitle="Real tactics used against buyers. Named, explained, and countered, because knowing you're being scammed is the first step to walking away."
      />

      {/* Pink Slip Explainer */}
      <FadeUp>
        <section
          className="px-20 py-16 max-md:px-6"
          style={{ background: "var(--color-bg-page)", margin: 0 }}
        >
          <SectionTitle>
            This document is your
            <br />
            <em>only proof you own the car.</em>
          </SectionTitle>
          <p className="text-base text-white leading-[1.75] max-w-[680px] mt-4">
            A California Certificate of Title, called the &ldquo;pink
            slip,&rdquo; is the legal document that proves vehicle
            ownership. Without it in your name, the car is not legally yours, no
            matter what you paid. Click directly on the document to learn what
            each section means.
          </p>
          <PinkSlipExplainer />
        </section>
      </FadeUp>

      <Divider />

      {/* Red Flags */}
      <FadeUp>
        <section
          id="red-flags"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <SectionTitle className="mb-10">
            Car Purchasing <em>Red Flags.</em>
          </SectionTitle>
          <RedFlagField />
        </section>
      </FadeUp>

      <Divider />

      {/* Know Your Rights */}
      <FadeUp>
        <section
          id="know-your-rights"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
          style={{ background: "var(--color-bg-surface)", margin: 0 }}
        >
          <SectionTitle className="mb-3">
            The law is already <em>on your side.</em>
          </SectionTitle>
          <p className="text-[1.05rem] text-white leading-[1.75] max-w-[680px] mb-14">
            Most buyers don&apos;t know what dealers are legally required to do.
            Here&apos;s what the law actually says, in plain English
            and exactly what to say when they try to ignore it.
          </p>

          {/* Federal */}
          <h3
            className="text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em] mb-6"
          >
            Federal <em>Protections</em>
          </h3>
          <LawList laws={federalLaws} />

          {/* California */}
          <h3
            className="text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em] mt-16 mb-6"
          >
            California <em>Protections</em>
          </h3>
          <LawList laws={californiaLaws} />

          <div
            className="flex items-center justify-between flex-wrap gap-6 pt-10 mt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <p className="text-base font-semibold">
              You walked in knowing nothing. Now you know everything.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/documents">See Real Documents Decoded</Button>
              <Button href="/inspection" variant="outline">
                Inspection Guide
              </Button>
            </div>
          </div>
        </section>
      </FadeUp>

      <Divider />

      {/* After a scam */}
      <FadeUp>
        <section id="after" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <SectionTitle className="mb-10">
            What to Do <em>After a Scam.</em>
          </SectionTitle>
          <ScamNotebook />
        </section>
      </FadeUp>
    </>
  );
}
