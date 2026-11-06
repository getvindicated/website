// The VINdicated Car Confidence Survey: every item, its stable id and
// version, the sections, the background questions and the scoring. The
// page, the API and the hub's Survey tab all read from here.
//
// WORDING: the item text is exactly the approved "Vindisurvey Questions"
// draft (questions_version 1). The translations are under
// surveyPage.items in lib/i18n/dictionaries/*.json; English there must
// match `text` here. WORDING_APPROVED gates launch: while false, the survey
// stays admin-only even if SURVEY_PUBLIC is "true".
//
// Changing wording later: give the item a new `version`. Its answers are
// then stored under a new key (see answerKey), so old and new answers never
// mix. Bump QUESTIONS_VERSION whenever any item changes.

export const WORDING_APPROVED = true;
export const QUESTIONS_VERSION = 1;

export const SECTIONS = ["breakdown", "buying", "repair", "fair", "about"] as const;
export type SectionId = (typeof SECTIONS)[number];

// The three areas people get a score for on the results screen.
export const SCORED = ["breakdown", "buying", "repair"] as const;
export type ScoredSection = (typeof SCORED)[number];

export type Item = {
  id: string;
  version: number;
  section: Exclude<SectionId, "about">;
  text: string;
  // For "People of my gender/race…" items: the "I expect…" item it follows
  // (shown indented right under it).
  pairOf?: string;
};

export const ITEMS: Item[] = [
  // If your car breaks down
  { id: "breakdown_1", version: 1, section: "breakdown", text: "If my car broke down on the road, I am confident that I could handle the situation." },
  { id: "breakdown_2", version: 1, section: "breakdown", text: "If my car broke down on the road, I am confident that I could get assistance." },
  { id: "breakdown_3", version: 1, section: "breakdown", text: "If my car broke down on the road, I am confident that I could diagnose the problem." },
  { id: "breakdown_4", version: 1, section: "breakdown", text: "If my car broke down on the road at night or in an unfamiliar area, I am confident that I could handle the situation." },
  // Buying a car
  { id: "buying_1", version: 1, section: "buying", text: "I am confident in researching and identifying a car that fits my needs." },
  { id: "buying_2", version: 1, section: "buying", text: "I am confident in researching and identifying a car that fits my budget." },
  { id: "buying_3", version: 1, section: "buying", text: "I am confident in navigating potential loans and financing a car." },
  { id: "buying_4", version: 1, section: "buying", text: "I am confident in finding a dealership that fits my situation (buying a new car, buying a used car, buying a specific model, etc.)." },
  { id: "buying_5", version: 1, section: "buying", text: "I am confident in negotiating the price of a car at a dealership." },
  { id: "buying_6", version: 1, section: "buying", text: "I am confident in spotting a fair price for the car I am buying." },
  { id: "buying_7", version: 1, section: "buying", text: "I am confident in spotting when a salesperson is misleading me." },
  // Getting a repair
  { id: "repair_1", version: 1, section: "repair", text: "I am confident that I could find a reputable mechanic." },
  { id: "repair_2", version: 1, section: "repair", text: "I am confident that I could explain a car problem to a mechanic." },
  { id: "repair_3", version: 1, section: "repair", text: "I am confident that I could tell if the mechanic is giving me a fair quote." },
  { id: "repair_4", version: 1, section: "repair", text: "I am confident that I could decide whether to get the repair the mechanic recommends." },
  { id: "repair_5", version: 1, section: "repair", text: "I am confident that I could identify what repairs I actually need." },
  { id: "repair_6", version: 1, section: "repair", text: "I am confident that I could say no to a mechanic service I don't need." },
  // Being treated fairly: each "I expect…" item, then its partner.
  { id: "fair_1a", version: 1, section: "fair", text: "When buying a car, I expect to be treated respectfully by the salesperson." },
  { id: "fair_1b", version: 1, section: "fair", pairOf: "fair_1a", text: "People of my gender/race are treated respectfully by the salesperson when buying a car." },
  { id: "fair_2a", version: 1, section: "fair", text: "When buying a car, I expect to be given honest prices." },
  { id: "fair_2b", version: 1, section: "fair", pairOf: "fair_2a", text: "People of my gender/race are given honest prices when buying a car." },
  { id: "fair_3a", version: 1, section: "fair", text: "When getting a repair, I expect to be quoted a fair price by the mechanic." },
  { id: "fair_3b", version: 1, section: "fair", pairOf: "fair_3a", text: "People of my gender/race are quoted a fair price by mechanics when getting a repair." },
  { id: "fair_4a", version: 1, section: "fair", text: "I expect to be treated respectfully by roadside assistance." },
  { id: "fair_4b", version: 1, section: "fair", pairOf: "fair_4a", text: "People of my gender/race are treated respectfully by roadside assistance." },
];

export const TOTAL_ITEMS = ITEMS.length;

// Where an item's answer is stored: the id, plus the version from 2 on.
export const answerKey = (i: Item) => (i.version === 1 ? i.id : `${i.id}.v${i.version}`);
export const ANSWER_KEYS = ITEMS.map(answerKey);

export const itemsIn = (s: SectionId) => ITEMS.filter((i) => i.section === s);

// Background questions. All optional. Option ids are stored, never labels.
export const DEMOGRAPHICS = {
  experience: { multi: true, options: ["license", "own", "bought", "dealer", "repair", "breakdown", "none"] },
  gender: { multi: false, options: ["woman", "man", "nonbinary", "self", "no_say"] },
  race: { multi: true, options: ["aian", "asian", "black", "hispanic", "mena", "nhpi", "white", "self", "no_say"] },
  age: { multi: false, options: ["18_20", "21_24", "25_34", "35_54", "55_plus", "no_say"] },
  student: { multi: false, options: ["ucb", "ucla", "ucsc", "other_school", "not_student", "no_say"] },
} as const;
export type DemoKey = keyof typeof DEMOGRAPHICS;
export const DEMO_KEYS = Object.keys(DEMOGRAPHICS) as DemoKey[];
// Options that come with a "self-describe" text box.
export const SELF_TEXT: Partial<Record<DemoKey, string>> = { gender: "self", race: "self" };
export const SELF_MAX = 60;

export type Demographics = {
  experience?: string[];
  gender?: string;
  genderSelf?: string;
  race?: string[];
  raceSelf?: string;
  age?: string;
  student?: string;
};

export type Answers = Record<string, number>;

export const SCALE = [1, 2, 3, 4, 5] as const;
// Real people can't read 25 items and answer them faster than this.
export const MIN_SECONDS = 40;

const isScore = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5;

// The Likert ids that are missing or out of range, in survey order.
export const unanswered = (answers: Record<string, unknown>, items: Item[] = ITEMS) =>
  items.filter((i) => !isScore(answers[answerKey(i)])).map((i) => i.id);

// Checks answers from the browser: every item exactly once, 1–5, nothing
// else. Returns the clean copy or null.
export function cleanAnswers(raw: unknown): Answers | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (Object.keys(r).some((k) => !ANSWER_KEYS.includes(k))) return null;
  if (unanswered(r).length) return null;
  return Object.fromEntries(ANSWER_KEYS.map((k) => [k, r[k] as number]));
}

// Keeps only known options and short self-describe text. Anything odd is
// dropped (every background question is optional).
export function cleanDemographics(raw: unknown): Demographics {
  const r = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: Demographics = {};
  for (const key of DEMO_KEYS) {
    const { multi, options } = DEMOGRAPHICS[key];
    const ok = (v: unknown): v is string => typeof v === "string" && (options as readonly string[]).includes(v);
    if (multi) {
      const list = Array.isArray(r[key]) ? [...new Set((r[key] as unknown[]).filter(ok))] : [];
      if (list.length) (out as Record<string, unknown>)[key] = list;
    } else if (ok(r[key])) {
      (out as Record<string, unknown>)[key] = r[key];
    }
    const self = SELF_TEXT[key];
    const chose = multi ? ((out as Record<string, unknown>)[key] as string[] | undefined)?.includes(self ?? "") : (out as Record<string, unknown>)[key] === self;
    const text = r[`${key}Self`];
    if (self && chose && typeof text === "string" && text.trim()) {
      (out as Record<string, unknown>)[`${key}Self`] = text.replace(/\s+/g, " ").trim().slice(0, SELF_MAX);
    }
  }
  return out;
}

// Where someone came from: ?src=ucsc, instagram, workshop… Lowercase
// letters, digits, - and _ only, else nothing.
export function cleanSource(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  return /^[a-z0-9_-]{1,40}$/.test(s) ? s : null;
}

// Section averages for the results screen, out of 5, to one decimal.
export function scores(answers: Answers): Record<ScoredSection, number> {
  const avg = (s: ScoredSection) => {
    const vals = itemsIn(s).map((i) => answers[answerKey(i)]).filter(isScore);
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  };
  return { breakdown: avg("breakdown"), buying: avg("buying"), repair: avg("repair") };
}

// The area to work on: the lowest score (first in survey order on a tie).
export const lowest = (s: Record<ScoredSection, number>): ScoredSection => SCORED.reduce((lo, k) => (s[k] < s[lo] ? k : lo), SCORED[0]);

// The Learning Resources guide each area's tip points to.
export const GUIDE: Record<ScoredSection, string> = {
  breakdown: "/inspection",
  buying: "/documents",
  repair: "/fraud",
};
