// Totals and averages for the hub's Survey tab, from the stored responses.
// Pure functions, so the API, the CSV and the tests share them.

import { DEMOGRAPHICS, ITEMS, SELF_TEXT, answerKey, itemsIn, type Answers, type DemoKey, type Demographics } from "./questions";

export type SurveyRow = {
  id: number;
  createdAt: string;
  version: number;
  locale: string;
  source: string | null;
  answers: Answers;
  demographics: Demographics;
  test: boolean;
};

export type Filter = { from: string; to: string; source: string; includeTest: boolean };

// Groups smaller than this are never shown in a split.
export const MIN_GROUP = 5;
// "No source" in the source filter and counts.
export const NO_SOURCE = "(none)";

const isDay = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function readFilter(url: URL): Filter {
  const p = url.searchParams;
  return {
    from: isDay(p.get("from")) ? (p.get("from") as string) : "",
    to: isDay(p.get("to")) ? (p.get("to") as string) : "",
    source: (p.get("source") ?? "").slice(0, 40),
    includeTest: p.get("test") === "1",
  };
}

export const matches = (r: SurveyRow, f: Filter) =>
  (f.includeTest || !r.test) &&
  (!f.from || r.createdAt >= f.from) &&
  (!f.to || r.createdAt <= f.to) &&
  (!f.source || (r.source ?? NO_SOURCE) === f.source);

const round1 = (n: number) => Math.round(n * 100) / 100;

export type ItemStat = { n: number; avg: number | null; dist: number[] };

function itemStat(rows: SurveyRow[], key: string): ItemStat {
  const dist = [0, 0, 0, 0, 0];
  let sum = 0;
  let n = 0;
  for (const r of rows) {
    const v = r.answers[key];
    if (Number.isInteger(v) && v >= 1 && v <= 5) {
      dist[v - 1]++;
      sum += v;
      n++;
    }
  }
  return { n, avg: n ? round1(sum / n) : null, dist };
}

// The average of someone's answers in a section, or null.
function personAvg(r: SurveyRow, keys: string[]) {
  const vals = keys.map((k) => r.answers[k]).filter((v) => Number.isInteger(v) && v >= 1 && v <= 5);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

// Sections as averaged on the dashboard. Fair treatment is split into what
// people expect for themselves and what they think happens to people like
// them.
export const DASH_SECTIONS = ["breakdown", "buying", "repair", "fairExpect", "fairOthers"] as const;
export type DashSection = (typeof DASH_SECTIONS)[number];
const SECTION_KEYS: Record<DashSection, string[]> = {
  breakdown: itemsIn("breakdown").map(answerKey),
  buying: itemsIn("buying").map(answerKey),
  repair: itemsIn("repair").map(answerKey),
  fairExpect: itemsIn("fair").filter((i) => !i.pairOf).map(answerKey),
  fairOthers: itemsIn("fair").filter((i) => i.pairOf).map(answerKey),
};

function sectionAvgs(rows: SurveyRow[]): Record<DashSection, number | null> {
  const out = {} as Record<DashSection, number | null>;
  for (const s of DASH_SECTIONS) {
    const avgs = rows.map((r) => personAvg(r, SECTION_KEYS[s])).filter((v): v is number => v !== null);
    out[s] = avgs.length ? round1(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null;
  }
  return out;
}

// Monday of the week a day falls in.
export function weekOf(day: string) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

const counts = (keys: string[]) => {
  const m = new Map<string, number>();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
};

// The values a response counts under for a split. Multi-choice questions
// count someone under each option they picked; skipped counts as "skipped".
export function groupsOf(r: SurveyRow, by: DemoKey): string[] {
  const v = r.demographics[by];
  const list = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
  return list.length ? list : ["skipped"];
}

export type GroupStat = { key: string; n: number; sections: Record<DashSection, number | null> } | { key: string; hidden: true };

export function split(rows: SurveyRow[], by: DemoKey): GroupStat[] {
  const order = [...DEMOGRAPHICS[by].options, "skipped"] as string[];
  return order.flatMap((key): GroupStat[] => {
    const members = rows.filter((r) => groupsOf(r, by).includes(key));
    if (!members.length) return [];
    // Small groups could point to one person: no count, no averages.
    if (members.length < MIN_GROUP) return [{ key, hidden: true as const }];
    return [{ key, n: members.length, sections: sectionAvgs(members) }];
  });
}

export function stats(all: SurveyRow[], f: Filter) {
  const rows = all.filter((r) => matches(r, f));
  return {
    total: rows.length,
    tests: all.filter((r) => r.test).length,
    perWeek: counts(rows.map((r) => weekOf(r.createdAt))).sort((a, b) => a.key.localeCompare(b.key)),
    bySource: counts(rows.map((r) => r.source ?? NO_SOURCE)),
    bySchool: counts(rows.map((r) => r.demographics.student ?? "skipped")),
    sources: [...new Set(all.map((r) => r.source ?? NO_SOURCE))].sort(),
    sections: sectionAvgs(rows),
    items: Object.fromEntries(ITEMS.map((i) => [i.id, itemStat(rows, answerKey(i))])) as Record<string, ItemStat>,
    splits: Object.fromEntries((Object.keys(DEMOGRAPHICS) as DemoKey[]).map((k) => [k, split(rows, k)])) as Record<DemoKey, GroupStat[]>,
  };
}
export type SurveyStats = ReturnType<typeof stats>;

// One row per response, item ids as columns. Formula-safe, with a BOM so
// Excel reads it as UTF-8.
export function responsesCsv(rows: SurveyRow[]) {
  const cell = (v: string) => {
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const demo = Object.keys(DEMOGRAPHICS) as DemoKey[];
  const head = [
    "response_id",
    "date",
    "questions_version",
    "language",
    "source",
    "test",
    ...ITEMS.map(answerKey),
    ...demo.flatMap((k) => (SELF_TEXT[k] ? [k, `${k}_self`] : [k])),
  ];
  const lines = rows.map((r) => [
    String(r.id),
    r.createdAt,
    String(r.version),
    r.locale,
    r.source ?? "",
    r.test ? "yes" : "no",
    ...ITEMS.map((i) => String(r.answers[answerKey(i)] ?? "")),
    ...demo.flatMap((k) => {
      const v = r.demographics[k];
      const shown = Array.isArray(v) ? v.join("; ") : (v ?? "");
      return SELF_TEXT[k] ? [shown, (r.demographics[`${k}Self` as keyof Demographics] as string | undefined) ?? ""] : [shown];
    }),
  ]);
  return "﻿" + [head, ...lines].map((l) => l.map(cell).join(",")).join("\r\n") + "\r\n";
}
