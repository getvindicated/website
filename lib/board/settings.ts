// Chapter content that admins edit on the page. Stored per chapter in the
// board_settings table; the defaults below (from chapters.ts) seed it.
// Shared by the server, which checks every value, and the editors.

import { chapterConfig, type ChapterConfig, type ChapterId, type Para, type TimelineWeek } from "./chapters";
import { TABS, type Tab } from "./types";

export type QuickLink = { label: string; text: string; href: string | null; tab: Tab | "" };
export type KeyDate = { date: string; text: string };
export type Photo = { src: string };
export type Projects = ChapterConfig["projects"];

export type Settings = {
  term: string;
  // "Sundays, 6–6:30pm". Shown in quick links, on Meetings and on My page.
  meetingTime: string;
  // Berkeley's deliverables rule; empty means no rule box.
  rule: string;
  teams: string[];
  quickLinks: QuickLink[];
  keyDates: KeyDate[];
  photos: Photo[];
  projects: Projects;
};
export type SettingKey = keyof Settings;
export const SETTING_KEYS: SettingKey[] = ["term", "meetingTime", "rule", "teams", "quickLinks", "keyDates", "photos", "projects"];

export const SETTING_LABELS: Record<SettingKey, string> = {
  term: "Subtitle",
  meetingTime: "Board meeting time",
  rule: "Rule text",
  teams: "Teams",
  quickLinks: "Quick links",
  keyDates: "Key dates",
  photos: "Photo row",
  projects: "Projects",
};

export function defaultSettings(chapter: ChapterId): Settings {
  const c = chapterConfig(chapter);
  const meeting = c.quickLinks.find((l) => l.label === "Board meetings");
  return {
    term: c.term,
    meetingTime: meeting?.text ?? "",
    rule: c.rule ?? "",
    teams: [...c.teams],
    quickLinks: c.quickLinks
      .filter((l) => l !== meeting)
      .map((l) => ({ label: l.label ?? "", text: l.text, href: l.href ?? null, tab: l.tab ?? "" })),
    keyDates: c.keyDates.map(([date, text]) => ({ date, text })),
    photos: c.photos.map((src) => ({ src })),
    projects: c.projects,
  };
}

// ---- checks (run on the server for every save) ----

type Ok<T> = { ok: true; value: T } | { ok: false; error: string };
const fail = (error: string) => ({ ok: false as const, error });
const isStr = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;
const isIso = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isUrl = (v: string) => /^https?:\/\/\S+$/.test(v);
const isPhotoSrc = (v: string) => /^\/board\/[\w/-]+\.(webp|png|jpe?g)$/.test(v) || /^\/api\/board\/photos\/\d+$/.test(v);

function paras(v: unknown): Para[] | null {
  if (!Array.isArray(v) || v.length > 20) return null;
  const out: Para[] = [];
  for (const p of v) {
    if (!p || typeof p !== "object" || !isStr(p.t, 3000) || (p.b !== undefined && !isStr(p.b, 200))) return null;
    out.push(p.b ? { b: p.b.trim(), t: p.t.trim() } : { t: p.t.trim() });
  }
  return out;
}

function projects(v: unknown): Ok<Projects> {
  if (!v || typeof v !== "object") return fail("Check the projects.");
  const p = v as Record<string, unknown>;
  const groups: Projects["groups"] = [];
  if (!Array.isArray(p.groups) || p.groups.length > 20) return fail("Check the project groups.");
  for (const g of p.groups) {
    if (!g || !isStr(g.group, 100) || !g.group.trim() || !Array.isArray(g.items) || g.items.length > 40) return fail("Each project group needs a name.");
    const items: [string, string?][] = [];
    for (const it of g.items) {
      if (!Array.isArray(it) || !isStr(it[0], 200) || !it[0].trim() || (it[1] !== undefined && !isStr(it[1], 100))) return fail("Each project needs a name.");
      items.push(it[1] ? [it[0].trim(), it[1].trim()] : [it[0].trim()]);
    }
    groups.push({ group: g.group.trim(), items });
  }
  const sections: Projects["sections"] = [];
  if (!Array.isArray(p.sections) || p.sections.length > 20) return fail("Check the project descriptions.");
  for (const s of p.sections) {
    if (!s || !isStr(s.title, 200) || !s.title.trim() || !Array.isArray(s.cols) || s.cols.length > 2) return fail("Each project description needs a title.");
    const cols = s.cols.map(paras);
    if (cols.some((c: Para[] | null) => !c)) return fail("Check the project description text.");
    if (s.credit !== undefined && !isStr(s.credit, 300)) return fail("The credit line is too long.");
    sections.push({ title: s.title.trim(), cols: cols as Para[][], ...(s.credit?.trim() ? { credit: s.credit.trim() } : {}) });
  }
  const t = p.timeline as Record<string, unknown> | undefined;
  if (!t || !isStr(t.title, 200) || !Array.isArray(t.tracks) || !t.tracks.every((x) => isStr(x, 50) && x.trim()) || !Array.isArray(t.weeks) || t.weeks.length > 30) {
    return fail("Check the timeline.");
  }
  const weeks: TimelineWeek[] = [];
  for (const [i, w] of (t.weeks as Record<string, unknown>[]).entries()) {
    if (!w || !isIso(w.start) || !isIso(w.end) || (w.end as string) < (w.start as string)) return fail(`Week ${i + 1} needs a start and end date.`);
    if (!isStr(w.label, 60) || !isStr(w.goal, 300) || !Array.isArray(w.items)) return fail(`Check week ${i + 1}.`);
    const items: [string, string][] = [];
    for (const it of w.items as unknown[]) {
      if (!Array.isArray(it) || !isStr(it[0], 50) || !isStr(it[1], 500)) return fail(`Check week ${i + 1}.`);
      if (it[1].trim()) items.push([it[0], it[1].trim()]);
    }
    weeks.push({ n: i + 1, start: w.start as string, end: w.end as string, label: (w.label as string).trim(), goal: (w.goal as string).trim(), items });
  }
  const graceDays = typeof t.graceDays === "number" && t.graceDays >= 0 && t.graceDays <= 3 ? t.graceDays : 0;
  return { ok: true, value: { groups, sections, timeline: { title: (t.title as string).trim(), tracks: (t.tracks as string[]).map((x) => x.trim()), weeks, graceDays } } };
}

export function checkSetting(key: SettingKey, v: unknown): Ok<unknown> {
  switch (key) {
    case "term":
      return isStr(v, 200) && v.trim() ? { ok: true, value: v.trim() } : fail("Add a subtitle.");
    case "meetingTime":
      return isStr(v, 120) ? { ok: true, value: v.trim() } : fail("The meeting time is too long.");
    case "rule":
      return isStr(v, 2000) ? { ok: true, value: v.trim() } : fail("The rule is too long.");
    case "teams": {
      if (!Array.isArray(v) || v.length > 20 || !v.every((t) => isStr(t, 60) && t.trim())) return fail("Each team needs a name.");
      const names = v.map((t: string) => t.trim());
      if (names.includes("Executive")) return fail("Executive is always there; pick another name.");
      if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) return fail("Two teams have the same name.");
      return { ok: true, value: names };
    }
    case "quickLinks": {
      if (!Array.isArray(v) || v.length > 30) return fail("Check the quick links.");
      const out: QuickLink[] = [];
      for (const l of v) {
        if (!l || !isStr(l.text, 200) || !l.text.trim() || !isStr(l.label ?? "", 100)) return fail("Each quick link needs its text.");
        const href = typeof l.href === "string" && l.href.trim() ? l.href.trim() : null;
        if (href && !isUrl(href)) return fail(`"${l.text}": links must start with http:// or https://.`);
        const tab = (TABS as readonly string[]).includes(l.tab) ? (l.tab as Tab) : "";
        out.push({ label: (l.label ?? "").trim(), text: l.text.trim(), href, tab });
      }
      return { ok: true, value: out };
    }
    case "keyDates": {
      if (!Array.isArray(v) || v.length > 40) return fail("Check the key dates.");
      const out: KeyDate[] = [];
      for (const d of v) {
        if (!d || !isIso(d.date) || !isStr(d.text, 300) || !d.text.trim()) return fail("Each key date needs a date and text.");
        out.push({ date: d.date, text: d.text.trim() });
      }
      return { ok: true, value: out };
    }
    case "photos": {
      if (!Array.isArray(v) || v.length > 12 || !v.every((p) => p && typeof p.src === "string" && isPhotoSrc(p.src))) return fail("Check the photos.");
      return { ok: true, value: v.map((p) => ({ src: p.src })) };
    }
    case "projects":
      return projects(v);
  }
}
