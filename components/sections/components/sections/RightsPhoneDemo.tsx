"use client";

import { useState, useRef, useEffect } from "react";

// ── State name matching (ported from the prototype) ──────────
const US_STATE_NAMES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function capitalizeWords(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

function resolveState(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const lower = v.toLowerCase();
  if (lower === "ca" || lower === "calif" || lower === "calif.") return "California";
  if (lower === "tx" || lower === "tex" || lower === "tex.") return "Texas";

  let best: string | null = null;
  let bestDist = Infinity;
  for (const name of US_STATE_NAMES) {
    const d = levenshtein(lower, name.toLowerCase());
    if (d < bestDist) { bestDist = d; best = name; }
  }
  const threshold = Math.max(1, Math.floor((best?.length ?? 0) * 0.25));
  if (best && bestDist <= threshold) return best;
  return capitalizeWords(v);
}

// ── Law data ───────────────────────────────────────────────
type Law = {
  tag: string;
  title: string;
  citation: string;
  plain: string;
  script: string;
  escalation: string;
};

const federalLaws: Law[] = [
  { tag: "TILA", title: "Truth in Lending Act", citation: "15 U.S.C. § 1601",
    plain: "The dealer must show you the full true cost of the loan before you sign anything: the APR, the finance charge, and the total of all payments.",
    script: "Show me the APR, the finance charge, and the total of all payments, right now, before I sign anything.",
    escalation: "If they won't give you these figures in writing before you sign, stop. This is a federal disclosure requirement, not a courtesy. You can file a complaint with the CFPB." },
  { tag: "FTC", title: "FTC Used Car Rule", citation: "16 CFR § 455",
    plain: "Every used car on a lot must display a Buyers Guide sticker stating whether it's sold \u201Cas is\u201D or with a warranty, and what that warranty covers.",
    script: "I need to see the Buyers Guide sticker before we talk about price.",
    escalation: "No sticker, or one removed before you could read it, is a federal violation. The FTC can fine a dealer up to $51,744 per car. Document it and report to the FTC." },
  { tag: "ODO", title: "Odometer Disclosure Law", citation: "49 U.S.C. § 32705",
    plain: "The dealer must give you a signed, written statement of the car's true mileage at the time of sale.",
    script: "I'd like the signed odometer disclosure statement, and I'll be checking it against the dash and the vehicle history report.",
    escalation: "Odometer rollback is a federal crime. If the numbers don't match, stop the deal, photograph everything, and report it to the FTC." },
  { tag: "FCRA", title: "Fair Credit Reporting Act", citation: "15 U.S.C. § 1681",
    plain: "If the dealer pulled your credit to set your rate, they must tell you which bureau they used and give you a written explanation of how it affected your terms.",
    script: "Was my credit report used to set this rate? I'd like the adverse action notice and the bureau it came from.",
    escalation: "No notice, or a rate that doesn't match your actual score, is reportable to the CFPB." },
  { tag: "ECOA", title: "Equal Credit Opportunity Act", citation: "15 U.S.C. § 1691",
    plain: "A dealer can't price your loan differently because of your race, gender, age, or national origin. Every applicant is supposed to be evaluated the same way.",
    script: "Can you walk me through exactly how this rate was calculated for me?",
    escalation: "If the explanation doesn't add up, you can sue for damages, and regulators can pursue civil penalties against the dealer." },
];

const STATE_LAWS: Record<string, Law[]> = {
  california: [
    { tag: "AB68-C", title: "2-Day Cancellation Option", citation: "Cal. Veh. Code § 11713.21",
      plain: "You can buy a 2-day right to cancel on a used car under $40,000, but you have to ask for it at the time of signing. It is not automatic.",
      script: "I'd like to purchase the 2-day contract cancellation option.",
      escalation: "If it's not offered to you upfront, ask directly. Cost is roughly 1% of the price, plus a restocking fee if you actually use it." },
    { tag: "AB68-R", title: "Interest Rate Markup Caps", citation: "Cal. Veh. Code § 11711",
      plain: "Dealers can only mark up your interest rate by a capped amount: 2% on loans over 60 months, 2.5% on shorter ones.",
      script: "I'm already pre-approved at this rate, you need to beat it, not just match it.",
      escalation: "Walking in pre-approved from your own bank or credit union removes almost all of the dealer's leverage on this number." },
    { tag: "AB68-A", title: "Itemized Add-Ons", citation: "Cal. Civ. Code § 2982",
      plain: "Every optional add-on has to be priced and listed as its own line item. Dealers can't bundle everything into one number and call it \u201Cthe payment.\u201D",
      script: "Show me my monthly payment with and without each add-on, itemized, in writing.",
      escalation: "\u201CIt's all one package\u201D is not legal in California. Ask for the line-by-line breakdown before you agree to anything." },
    { tag: "VC-11713", title: "Prohibited Dealer Practices", citation: "Cal. Veh. Code § 11713",
      plain: "Dealers can't advertise cars they don't actually have, change agreed-upon terms after the fact, or hide a car's known history from you.",
      script: "Is this exact price and condition still accurate right now, today?",
      escalation: "Bait-and-switch tactics under this code are a documented violation. Keep a copy of the original ad or listing as evidence." },
    { tag: "CCLRA", title: "Consumers Legal Remedies Act", citation: "Cal. Civ. Code § 1750",
      plain: "A dealer cannot deceive you about a car's price, condition, or features. Full stop. No exceptions for \u201Csales talk.\u201D",
      script: "Can you point to exactly where that's stated in writing?",
      escalation: "You can sue for damages, or to force changes to the contract, if they misrepresented something material to the sale." },
    { tag: "CC-2981.9", title: "Single Written Contract Rule", citation: "Cal. Civ. Code § 2981.9",
      plain: "Every promise the dealer makes to you has to be written into the one contract you sign. Verbal side-deals legally do not count.",
      script: "If you're agreeing to that, please add it into the contract before I sign, not after.",
      escalation: "A verbal promise with nothing in writing becomes legally meaningless the moment you've signed." },
  ],
  texas: [
    { tag: "DTPA", title: "Deceptive Trade Practices Act", citation: "Tex. Bus. & Com. Code § 17.41 et seq.",
      plain: "A dealer can't advertise one car to lure you in and then push you toward a different one (\u201Cbait and switch\u201D), and can't misrepresent a car's condition, history, or features to get you to buy.",
      script: "Is this the exact car in the ad: same price, same condition, right now?",
      escalation: "Bait-and-switch and other deceptive conduct is a documented DTPA violation. You can sue for damages, legal fees, and in some cases additional penalties." },
    { tag: "OCC-2301", title: "Dealer Disclosure & Licensing Code", citation: "Tex. Occ. Code ch. 2301",
      plain: "Texas does not give you an automatic right to cancel once you sign. This is confirmed directly by the Texas Attorney General's own buying guide. Dealers must still give you a written odometer disclosure and the federally required Buyer's Guide.",
      script: "Can I get the odometer disclosure and the Buyer's Guide before I sign anything?",
      escalation: "No odometer disclosure or no Buyer's Guide means the dealer is already out of compliance. File with the Texas DMV or Attorney General's consumer protection office." },
  ],
  massachusetts: [
    { tag: "MA-LEMON", title: "Used Car Lemon Protection", citation: "Mass. Gen. Laws ch. 90, \u00A77N\u00BD",
      plain: "Massachusetts' lemon law covers many new vehicles and also reaches used vehicles sold or leased while still within the original manufacturer warranty protection term, not just brand-new cars.",
      script: "Exactly when does the manufacturer's warranty protection period end on this car?",
      escalation: "If you're still within that protection window and the dealer denies coverage, file with the Massachusetts Attorney General's consumer office right away. Timing is everything." },
    { tag: "MA-AG", title: "Where to File: AG / Consumer Affairs", citation: "Mass. Office of Consumer Affairs & Business Regulation",
      plain: "Massachusetts routes used car lemon and warranty disputes through the Attorney General's office and the Office of Consumer Affairs, separate from the federal FTC complaint system.",
      script: "If this turns into a dispute, will you participate in good faith with the Attorney General's consumer process?",
      escalation: "File with the Massachusetts AG or Office of Consumer Affairs promptly, and keep every dealer ad and repair order as evidence of timing." },
  ],
  alaska: [
    { tag: "AK-LEMON", title: "New-Car-Only Lemon Law", citation: "Alaska Stat. \u00A7\u00A745.45.300\u201345.45.360",
      plain: "Alaska's lemon law only protects new vehicle purchases. If you're buying used in Alaska, this specific law will not apply to you, no matter how serious the defect.",
      script: "If I'm buying used, is any manufacturer warranty still active on this car?",
      escalation: "For used cars in Alaska, you're relying on title law, the federal odometer rule, and the FTC Buyers Guide, not the state lemon law. Document everything anyway." },
    { tag: "AK-DISPUTE", title: "Manufacturer Dispute Programs Can Be Mandatory", citation: "Alaska Dept. of Law",
      plain: "Alaska's lemon law process can require you to participate in an approved manufacturer dispute program before you're allowed to take the case to court.",
      script: "Do you have an approved informal dispute resolution program, and can I get that in writing?",
      escalation: "Send certified written notice to the manufacturer and keep proof. Alaska gives you only 60 days after the defect cutoff to do this." },
  ],
  "new jersey": [
    { tag: "NJ-USEDCAR", title: "Used Car Dealer Warranty Floor", citation: "NJ Used Car Lemon Law, Div. of Consumer Affairs",
      plain: "New Jersey requires dealers to provide a warranty on qualifying used cars sold for more than $3,000, that are seven model years old or newer, not declared a total loss, and have 100,000 miles or less.",
      script: "Does this car qualify for the New Jersey used car warranty: under 7 model years, under 100,000 miles, and not a total-loss title?",
      escalation: "If it qualifies and the dealer denies a warranty, file with the NJ Division of Consumer Affairs Lemon Law Unit right away." },
    { tag: "NJ-ASIS", title: "\u201CAs Is\u201D Has Real Limits", citation: "NJ Div. of Consumer Affairs",
      plain: "New Jersey's consumer affairs office specifically defines when an \u201Cas is\u201D sale is allowed under the Used Car Lemon Law framework. It isn't an automatic shield for every used car sale.",
      script: "If this is being sold as is, can you show me in writing why this car doesn't qualify for the used car warranty?",
      escalation: "The NJ Lemon Law Unit handles both new and used car cases administratively. You don't necessarily need to go straight to court." },
  ],
  "new york": [
    { tag: "NY-USEDCAR", title: "Used Car Lemon Law", citation: "NY AG used-car lemon law fact sheet",
      plain: "New York requires a dealer written warranty on qualifying used car sales, and after a reasonable number of failed repair attempts, you can pursue state arbitration or a refund.",
      script: "Can I see the written warranty required under New York's used car lemon law before I buy?",
      escalation: "If repairs keep failing, New York has a binding state arbitration program. Use it instead of accepting an informal runaround from the dealer." },
    { tag: "NY-TIMING", title: "Strict Mileage and Age Thresholds", citation: "NY AG new-car lemon law fact sheet",
      plain: "New York's lemon law thresholds are specific. Many protections key off of 18,000 miles or two years from the warranty start, with a four-repair or thirty-day-out-of-service presumption.",
      script: "What was this car's mileage and warranty start date, exactly?",
      escalation: "New York gives you up to four years from original delivery to file, but the clock and mileage thresholds matter immediately. Document the date of every repair attempt." },
  ],
  connecticut: [
    { tag: "CT-WARRANTY", title: "Used Car Dealer Warranty by Price", citation: "Connecticut DMV used-car warranty bulletin",
      plain: "Connecticut requires dealers to give a warranty on qualifying used cars priced at least $3,000: 30 days or 1,500 miles for cars $3,000 to $5,000, and 60 days or 3,000 miles for cars above $5,000, subject to age limits.",
      script: "Which Connecticut warranty tier does this car fall into based on its price, and can I get that in writing?",
      escalation: "File quickly with the Connecticut DMV Consumer Complaint Center. These are time and mileage limited windows." },
    { tag: "CT-INSPECT", title: "Pre-Sale Safety Inspection Required", citation: "Connecticut DMV",
      plain: "Connecticut dealers must complete a safety inspection before offering a used vehicle for retail sale.",
      script: "Can I see the completed pre-sale safety inspection form for this specific car?",
      escalation: "No inspection form is a red flag and a potential DMV complaint on its own, separate from any warranty dispute." },
  ],
  maine: [
    { tag: "ME-INFOACT", title: "Used Car Information Act", citation: "Maine Used Car Information Act",
      plain: "Maine has its own Used Car Information Act with dealer disclosure and inspection-related duties. Maine is exempt from the federal FTC Buyers Guide rule because of this state system.",
      script: "Can I see the Maine Buyers Guide for this car, separate from any federal paperwork?",
      escalation: "Photograph the Maine Buyers Guide before you sign. It is the document-driven backbone of your protection in Maine." },
    { tag: "ME-INSPECTION", title: "Inspection Sticker Requirement", citation: "Maine SOS/BMV used-car guide",
      plain: "Most Maine dealer-sold used cars must carry a valid inspection sticker issued within the prior 60 days, or otherwise meet a warranty-of-inspectability standard.",
      script: "When was this car's current inspection sticker issued?",
      escalation: "An inspection sticker older than 60 days, or missing entirely, is something to raise with the dealer immediately, before you sign anything." },
  ],
  wisconsin: [
    { tag: "WI-BUYERSGUIDE", title: "Wisconsin Buyers Guide System", citation: "Wisconsin Admin. Code Trans 139",
      plain: "Wisconsin's lemon law excludes previously owned vehicles entirely, but Wisconsin has its own detailed, mandatory used-car Buyers Guide system that's stricter than the federal version it replaces.",
      script: "Can I see the Wisconsin Buyers Guide for this car, and has any rebuilt or salvage history been disclosed on it?",
      escalation: "Photograph the Wisconsin Buyers Guide before signing. Since the lemon law doesn't cover used cars here, this document is effectively your main protection." },
    { tag: "WI-ASIS", title: "Strict Rules on \u201CAs Is\u201D Language", citation: "Wisconsin DOT consumer guidance",
      plain: "Wisconsin has strict formatting rules for any \u201CAS IS, NO WARRANTY\u201D language, and a written-warranty delivery rule applies whenever a sale is made subject to warranty.",
      script: "If this is sold as is, can you show me that the as-is disclosure follows Wisconsin's required format?",
      escalation: "Improperly formatted as-is language can itself be a basis for a complaint to the Wisconsin DOT or DOJ." },
  ],
};

const STATE_DIRECTION: Record<string, string> = {
  alabama: "covers new vehicles only",
  arizona: "appears to extend some coverage to used vehicles",
  arkansas: "is focused on new vehicles, with notably strong salvage-title disclosure rules",
  colorado: "appears to cover some used vehicles, but excludes leased ones",
  delaware: "appears to extend coverage to used vehicles",
  florida: "covers new and leased cars and trucks, with a structured state lemon process",
  georgia: "covers new vehicles only",
  hawaii: "appears to extend coverage to used vehicles",
  idaho: "appears to extend coverage to used vehicles",
  illinois: "covers new vehicles only",
  indiana: "covers vehicles purchased, leased, or transferred within the state",
  iowa: "covers new or previously untitled vehicles, including some leased vehicles",
  kansas: "covers new vehicles only, per state guidance",
  kentucky: "covers new vehicles only",
  louisiana: "appears to extend coverage to used vehicles",
  maryland: "covers specific registered vehicle classes, mostly newer vehicles",
  michigan: "covers new vehicles and used vehicles transferred while still under the manufacturer's warranty",
  minnesota: "extends coverage to used vehicles",
  mississippi: "appears to extend coverage to used and lease-purchase vehicles",
  missouri: "covers new vehicles only",
  nebraska: "covers new vehicles, with guidance suggesting some vehicles under two years old may also qualify",
  nevada: "appears to extend coverage to used vehicles",
  "new hampshire": "covers used vehicles only if still under the manufacturer's original warranty",
  "new mexico": "covers passenger vehicles sold and registered in the state",
  "north carolina": "covers new vehicles only",
  "north dakota": "appears to extend coverage to used vehicles",
  ohio: "covers new and leased vehicles",
  oklahoma: "covers most vehicles registered in the state, subject to weight limits",
  oregon: "appears to extend coverage to used vehicles",
  pennsylvania: "covers new vehicles only",
  "rhode island": "extends coverage to used vehicles",
  "south carolina": "covers new vehicles only",
  "south dakota": "appears to extend coverage to used vehicles",
  tennessee: "covers passenger vehicles sold in the state",
  utah: "covers highway vehicles sold in the state, including motorcycles",
  vermont: "covers passenger vehicles purchased, leased, or registered in the state",
  virginia: "covers motor vehicles under its lemon-law framework",
  washington: "covers new vehicles, with a prominent state-run arbitration process",
  "west virginia": "covers passenger vehicles and some trucks and vans",
  wyoming: "covers vehicles under 10,000 pounds sold or registered in the state",
};

function fallbackLaws(label: string): Law[] {
  const key = label.toLowerCase();
  const direction = STATE_DIRECTION[key];
  const directionLine = direction
    ? `Based on a 50-state legal summary, ${label}'s lemon law ${direction}.`
    : `We have not yet researched ${label} specifically.`;

  return [
    { tag: "FTC-COR", title: "No Automatic Right to Cancel", citation: "16 CFR Part 429, FTC Cooling-Off Rule",
      plain: "The FTC's Cooling-Off Rule gives buyers three days to cancel certain purchases, but it explicitly excludes cars sold at a dealer's permanent location. Once you sign, the deal is final unless the dealer agrees in writing to something more.",
      script: "Will you put a cancellation window into the contract, in writing, before I sign?",
      escalation: "Don't assume a \u201Ccooling-off period\u201D exists by default. Federal law specifically carves cars out of it. If you want an exit, negotiate it into the contract before signing, not after." },
    { tag: "COMING-SOON", title: "State-Specific Laws Coming Soon", citation: "",
      plain: `${directionLine} Exact statute section numbers have not been independently verified for ${label}, so treat this as a starting point, not legal advice. The five federal protections already apply to you regardless of state.`,
      script: `Does ${label} have its own cooling-off period, interest rate cap, or add-on disclosure rule?`,
      escalation: `Search "${label} lemon law" and "${label} used car dealer warranty" on your state Attorney General's website before you sign anything.` },
  ];
}

// ── Component ────────────────────────────────────────────────
type Screen = "entry" | "home" | "laws";
type Category = "federal" | "state";

export function RightsPhoneDemo() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [stateInput, setStateInput] = useState("");
  const [stateLabel, setStateLabel] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("federal");
  const [currentLawIndex, setCurrentLawIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const resolvedKey = stateLabel.toLowerCase();
  const stateLaws = stateLabel
    ? (STATE_LAWS[resolvedKey] ?? fallbackLaws(stateLabel))
    : [];
  const stateLinkName = stateLabel ? `${stateLabel} Protections` : "State Protections";
  const stateLinkMeta = !stateLabel
    ? "Enter your state to see these"
    : STATE_LAWS[resolvedKey]
      ? `${stateLaws.length} laws \u00B7 applies to you`
      : `What we have so far for ${stateLabel}`;
  const homeSub = !stateLabel
    ? "Pick one to start reading."
    : `Showing what applies in ${stateLabel}.`;

  const activeLaws = activeCategory === "federal" ? federalLaws : stateLaws;

  function submitState() {
    const resolved = resolveState(stateInput);
    setStateLabel(resolved ?? "");
    setScreen("home");
  }

  function skipState() {
    setStateLabel("");
    setScreen("home");
  }

  function openCategory(cat: Category) {
    setActiveCategory(cat);
    setCurrentLawIndex(0);
    setRevealed(new Set());
    setScreen("laws");
  }

  function jumpTo(i: number) {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (screen !== "laws" || !scrollRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setRevealed((prev) => new Set(prev).add(idx));
          }
          if (entry.intersectionRatio > 0.5) {
            setCurrentLawIndex(idx);
          }
        });
      },
      { root: scrollRef.current, threshold: [0.15, 0.5] }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [screen, activeLaws.length]);

  return (
    <div className="rpd-stage">
      <style>{`
        .rpd-stage { display: flex; flex-direction: column; align-items: center; }
        .rpd-phone { width: 340px; height: 700px; background: #040207; border-radius: 48px; padding: 12px; box-shadow: 0 0 0 1px rgba(255,255,255,0.05) inset, 0 40px 90px -20px rgba(0,0,0,0.6); position: relative; }
        .rpd-screen { position: relative; width: 100%; height: 100%; background: #fff; border-radius: 36px; overflow: hidden; --rpd-ink:#16131d; --rpd-purple:#6d33c9; --rpd-vivid:#9630a6; --rpd-vivid-deep:#7a2685; --rpd-danger:#c23b32; --rpd-line:rgba(0,0,0,0.1); }
        .rpd-island { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 84px; height: 22px; background: #000; border-radius: 18px; z-index: 50; }
        .rpd-home-indicator { position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); width: 110px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 4px; z-index: 50; }
        .rpd-stack { position: absolute; inset: 0; padding-top: 46px; }
        .rpd-view { position: absolute; inset: 0; top: 46px; display: flex; flex-direction: column; background: #fff; }
        .rpd-nav-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px 8px; flex-shrink: 0; }
        .rpd-back-btn { display: flex; align-items: center; gap: 3px; background: none; border: none; color: var(--rpd-vivid); font-size: 0.88rem; font-weight: 600; padding: 5px 3px; cursor: pointer; font-family: -apple-system, sans-serif; }
        .rpd-logo { width: 24px; height: auto; }
        .rpd-entry-wrap, .rpd-home-wrap { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 24px; overflow-y: auto; }
        .rpd-entry-wrap img { margin-bottom: 16px; width: 32px; }
        .rpd-entry-wrap h1 { font-family: Georgia, serif; font-size: 1.7rem; line-height: 1.1; font-weight: 600; margin: 0 0 8px; color: var(--rpd-ink); }
        .rpd-entry-wrap p { font-size: 0.85rem; color: var(--rpd-purple); line-height: 1.5; margin: 0 0 22px; font-family: -apple-system, sans-serif; }
        .rpd-entry-input { width: 100%; background: transparent; border: none; border-bottom: 2px solid var(--rpd-line); color: var(--rpd-ink); font-family: Georgia, serif; font-size: 1.2rem; padding: 5px 2px 10px; outline: none; margin-bottom: 22px; }
        .rpd-entry-input:focus { border-bottom-color: var(--rpd-vivid); }
        .rpd-entry-btn { background: var(--rpd-vivid); color: #fff; border: none; border-radius: 12px; padding: 13px 0; font-size: 0.92rem; font-weight: 600; cursor: pointer; width: 100%; font-family: -apple-system, sans-serif; }
        .rpd-entry-skip { text-align: center; margin-top: 14px; font-size: 0.8rem; color: var(--rpd-purple); background: none; border: none; cursor: pointer; font-family: -apple-system, sans-serif; }
        .rpd-eyebrow { font-family: Arial, Helvetica, sans-serif; font-size: 0.66rem; color: var(--rpd-purple); display: block; margin-bottom: 8px; }
        .rpd-home-wrap img { width: 30px; margin-bottom: 12px; }
        .rpd-home-wrap h1 { font-family: Georgia, serif; font-size: 1.9rem; line-height: 1.06; margin: 0 0 6px; font-weight: 600; color: #9630a6; }
        .rpd-home-wrap h1 em { font-style: italic; color: #9630a6; }
        .rpd-home-sub { font-size: 0.82rem; color: var(--rpd-purple); line-height: 1.5; margin: 0 0 30px; font-family: -apple-system, sans-serif; }
        .rpd-home-link { display: block; padding: 20px 0; border-top: 1px solid var(--rpd-line); cursor: pointer; background: none; border-left: none; border-right: none; border-bottom: none; width: 100%; text-align: left; font-family: -apple-system, sans-serif; }
        .rpd-home-link:last-of-type { border-bottom: 1px solid var(--rpd-line); }
        .rpd-home-row { display: flex; align-items: baseline; justify-content: space-between; }
        .rpd-home-name { font-family: Georgia, serif; font-size: 1.25rem; font-weight: 600; color: var(--rpd-ink); }
        .rpd-home-arrow { font-size: 1.1rem; color: var(--rpd-purple); }
        .rpd-home-meta { font-size: 0.76rem; color: var(--rpd-purple); margin-top: 4px; }
        .rpd-laws-wrap { display: flex; flex: 1; overflow: hidden; }
        .rpd-laws-scroll { flex: 1; overflow-y: auto; padding: 4px 12px 60px 20px; }
        .rpd-law-section { padding-top: 14px; padding-bottom: 32px; border-bottom: 1px solid var(--rpd-line); }
        .rpd-law-section:last-child { border-bottom: none; }
        .rpd-law-citation { font-size: 0.62rem; color: var(--rpd-purple); display: block; margin-bottom: 6px; font-family: -apple-system, sans-serif; }
        .rpd-law-title { font-family: Georgia, serif; font-size: 1.45rem; line-height: 1.12; font-weight: 600; margin: 0 0 10px; color: var(--rpd-ink); }
        .rpd-scroll-prompt { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: var(--rpd-purple); margin-top: 6px; font-family: -apple-system, sans-serif; }
        .rpd-law-content { opacity: 0; transform: translateY(10px); transition: opacity 0.5s ease, transform 0.5s ease; font-family: -apple-system, sans-serif; }
        .rpd-law-content.rpd-shown { opacity: 1; transform: translateY(0); }
        .rpd-plain-text { font-size: 0.9rem; line-height: 1.55; color: var(--rpd-ink); margin: 0 0 18px; }
        .rpd-rule { border: none; border-top: 1px solid var(--rpd-line); margin: 0 0 18px; }
        .rpd-script-quote { display: flex; gap: 8px; margin-bottom: 18px; }
        .rpd-script-quote .rpd-mark { font-family: Georgia, serif; font-size: 1.7rem; color: var(--rpd-purple); line-height: 1; margin-top: -3px; }
        .rpd-script-quote p { font-family: Georgia, serif; font-style: italic; font-size: 0.95rem; line-height: 1.45; color: var(--rpd-ink); margin: 0; }
        .rpd-escalation-text { font-size: 0.84rem; line-height: 1.5; color: var(--rpd-danger); }
        .rpd-rail { width: 26px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6px 0; }
        .rpd-rail button { background: none; border: none; color: #8a5fd6; font-size: 0.5rem; font-weight: 600; padding: 2px; cursor: pointer; line-height: 1; }
        .rpd-rail button.rpd-current { color: var(--rpd-vivid); transform: scale(1.15); }
      `}</style>

      <div className="rpd-phone">
        <div className="rpd-screen">
          <div className="rpd-island" />
          <div className="rpd-stack">

            {screen === "entry" && (
              <div className="rpd-view">
                <div className="rpd-entry-wrap">
                  <img src="/logo-mark.png" alt="VINdicated logo" />
                  <h1>Where are you buying?</h1>
                  <p>Your rights change depending on where you are. Tell us your state so we show you the protections that actually apply.</p>
                  <input
                    className="rpd-entry-input"
                    placeholder="e.g. California"
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value)}
                  />
                  <button className="rpd-entry-btn" onClick={submitState}>Continue</button>
                  <button className="rpd-entry-skip" onClick={skipState}>Skip for now</button>
                </div>
              </div>
            )}

            {screen === "home" && (
              <div className="rpd-view">
                <div className="rpd-home-wrap">
                  <img src="/logo-mark.png" alt="VINdicated logo" />
                  <span className="rpd-eyebrow">getvindicated.org</span>
                  <h1>Know Your<br /><em>Rights.</em></h1>
                  <p className="rpd-home-sub">{homeSub}</p>

                  <button className="rpd-home-link" onClick={() => openCategory("federal")}>
                    <div className="rpd-home-row">
                      <span className="rpd-home-name">Federal Protections</span>
                      <span className="rpd-home-arrow">{"\u2192"}</span>
                    </div>
                    <div className="rpd-home-meta">5 laws \u00B7 apply nationwide</div>
                  </button>

                  <button className="rpd-home-link" onClick={() => openCategory("state")}>
                    <div className="rpd-home-row">
                      <span className="rpd-home-name">{stateLinkName}</span>
                      <span className="rpd-home-arrow">{"\u2192"}</span>
                    </div>
                    <div className="rpd-home-meta">{stateLinkMeta}</div>
                  </button>
                </div>
              </div>
            )}

            {screen === "laws" && (
              <div className="rpd-view">
                <div className="rpd-nav-bar">
                  <button className="rpd-back-btn" onClick={() => setScreen("home")}>
                    {"\u2190"} Home
                  </button>
                  <img className="rpd-logo" src="/logo-mark.png" alt="VINdicated logo" />
                </div>
                <div className="rpd-laws-wrap">
                  <div className="rpd-laws-scroll" ref={scrollRef}>
                    {activeLaws.map((law, i) => (
                      <div
                        key={law.tag}
                        className="rpd-law-section"
                        data-index={i}
                        ref={(el) => { sectionRefs.current[i] = el; }}
                      >
                        {law.citation && <span className="rpd-law-citation">{law.citation}</span>}
                        <h2 className="rpd-law-title">{law.title}</h2>
                        {!revealed.has(i) && (
                          <div className="rpd-scroll-prompt">scroll for the rundown {"\u2193"}</div>
                        )}
                        <div className={`rpd-law-content ${revealed.has(i) ? "rpd-shown" : ""}`}>
                          <p className="rpd-plain-text">{law.plain}</p>
                          <hr className="rpd-rule" />
                          <div className="rpd-script-quote">
                            <span className="rpd-mark">{"\u201C"}</span>
                            <p>{law.script}{"\u201D"}</p>
                          </div>
                          <hr className="rpd-rule" />
                          <p className="rpd-escalation-text">{law.escalation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rpd-rail">
                    {activeLaws.map((law, i) => (
                      <button
                        key={law.tag}
                        className={i === currentLawIndex ? "rpd-current" : ""}
                        onClick={() => jumpTo(i)}
                      >
                        {law.tag.length > 6 ? law.tag.split("-")[0] : law.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
          <div className="rpd-home-indicator" />
        </div>
      </div>
    </div>
  );
}
