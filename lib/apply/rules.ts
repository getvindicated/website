// Board membership applications (the public /apply page and the hub's
// Applications tab). Shared by the form, the hub and the server, which
// checks everything again: nothing the browser says is trusted.

import { isEmail } from "@/lib/board/submit-rules";

export const STATUSES = ["new", "reviewing", "interview", "accepted", "declined"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  accepted: "Accepted",
  declined: "Declined",
};

// Year in school; labels are in the dictionaries (applyPage.form.years).
export const YEARS = ["1", "2", "3", "4", "5", "grad"] as const;
export type Year = (typeof YEARS)[number];
export const YEAR_LABELS: Record<Year, string> = { "1": "1st", "2": "2nd", "3": "3rd", "4": "4th", "5": "5th+", grad: "Grad" };

export const MAX_WORDS = 150;
export const MAX_POSITIONS = 3;
export const MAX_RESUME_BYTES = 2 * 1024 * 1024;
export const MAX_HOURS = 40;

// Words by the language's own rules, so Chinese (no spaces) counts words
// rather than whole sentences. The form and the server count the same way.
export function wordCount(text: string, locale = "en"): number {
  if (!text.trim()) return 0;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    let n = 0;
    for (const s of new Intl.Segmenter(locale, { granularity: "word" }).segment(text)) if (s.isWordLike) n++;
    return n;
  }
  return text.trim().split(/\s+/).length;
}

// Per-chapter settings admins edit on the Applications tab. Stored in
// board_settings under "applications". Positions are whatever admins type;
// none are built in.
export type ApplyConfig = {
  open: boolean;
  // Last day to apply (YYYY-MM-DD); applications close at the end of that
  // day, Pacific. Null: open until switched off.
  deadline: string | null;
  positions: string[];
  // Applications are grouped by term: one per email per chapter per term,
  // and "Delete all from past terms" keeps only this one.
  term: string;
};

// "Fall 2026" for the date given: Jan–May spring, Jun–Jul summer, else fall.
export function defaultTerm(d = new Date()): string {
  const m = d.getMonth();
  return `${m <= 4 ? "Spring" : m <= 6 ? "Summer" : "Fall"} ${d.getFullYear()}`;
}

export const defaultConfig = (): ApplyConfig => ({ open: false, deadline: null, positions: [], term: defaultTerm() });

const isIso = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

// Checks an admin's save. Returns the cleaned config or an error.
export function checkConfig(v: unknown): { ok: true; value: ApplyConfig } | { ok: false; error: string } {
  if (!v || typeof v !== "object") return { ok: false, error: "Check the form." };
  const c = v as Record<string, unknown>;
  if (typeof c.open !== "boolean") return { ok: false, error: "Check the form." };
  const deadline = c.deadline === null || c.deadline === "" ? null : c.deadline;
  if (deadline !== null && !isIso(deadline)) return { ok: false, error: "Pick a valid deadline, or leave it empty." };
  if (!Array.isArray(c.positions) || c.positions.length > 30 || !c.positions.every((p) => typeof p === "string" && p.trim() && p.trim().length <= 80)) {
    return { ok: false, error: "Each position needs a name (up to 80 characters)." };
  }
  const positions = c.positions.map((p: string) => p.trim());
  if (new Set(positions.map((p) => p.toLowerCase())).size !== positions.length) return { ok: false, error: "Two positions have the same name." };
  if (c.open && positions.length === 0) return { ok: false, error: "Add at least one position before opening applications." };
  if (typeof c.term !== "string" || !c.term.trim() || c.term.trim().length > 40) return { ok: false, error: "Name the term, like Fall 2026." };
  return { ok: true, value: { open: c.open, deadline: deadline as string | null, positions, term: c.term.trim() } };
}

// What the form sends (the resume travels separately as a file).
export type ApplicationInput = {
  chapter: string;
  positions: string[];
  name: string;
  email: string;
  phone: string;
  year: string;
  major: string;
  why: string;
  bring: string;
  hours: number;
  link: string;
  heard: string;
  commit: boolean;
};

// The field a problem is in. The form shows the matching message from the
// dictionary (applyPage.errors).
export type InputError = "chapter" | "positions" | "name" | "email" | "phone" | "year" | "major" | "why" | "bring" | "hours" | "link" | "heard" | "commit";

// Adds https:// to "linkedin.com/in/…" and checks it's a web link.
export function cleanLink(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "";
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    return /^https?:$/.test(u.protocol) && u.hostname.includes(".") && withScheme.length <= 300 ? withScheme : null;
  } catch {
    return null;
  }
}

// Checks one application against the chapter's open positions. Returns the
// cleaned values, or the first field that's wrong.
export function checkApplication(
  input: ApplicationInput,
  openPositions: string[],
  locale: string,
): { ok: true; value: ApplicationInput } | { ok: false; field: InputError } {
  const t = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");
  const positions = Array.isArray(input.positions) ? [...new Set(input.positions.filter((p) => typeof p === "string"))] : [];
  if (positions.length < 1 || positions.length > MAX_POSITIONS || !positions.every((p) => openPositions.includes(p))) return { ok: false, field: "positions" };
  const name = t(input.name, 120);
  if (!name) return { ok: false, field: "name" };
  const email = t(input.email, 254).toLowerCase();
  if (!isEmail(email)) return { ok: false, field: "email" };
  const phone = t(input.phone, 40);
  if (phone && !/^[\d\s()+.-]{7,40}$/.test(phone)) return { ok: false, field: "phone" };
  if (!(YEARS as readonly string[]).includes(input.year)) return { ok: false, field: "year" };
  const major = t(input.major, 120);
  if (!major) return { ok: false, field: "major" };
  const why = t(input.why, 3000);
  if (!why || wordCount(why, locale) > MAX_WORDS) return { ok: false, field: "why" };
  const bring = t(input.bring, 3000);
  if (!bring || wordCount(bring, locale) > MAX_WORDS) return { ok: false, field: "bring" };
  const hours = Number(input.hours);
  if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS) return { ok: false, field: "hours" };
  const link = cleanLink(t(input.link, 300));
  if (link === null) return { ok: false, field: "link" };
  const heard = t(input.heard, 300);
  if (input.commit !== true) return { ok: false, field: "commit" };
  return {
    ok: true,
    value: { chapter: input.chapter, positions, name, email, phone, year: input.year, major, why, bring, hours, link, heard, commit: true },
  };
}

// A PDF starts with "%PDF-".
export const isPdf = (bytes: Uint8Array) =>
  bytes.length > 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;

// One application as the hub sees it (no resume bytes).
export type AdminApplication = {
  id: number;
  term: string;
  name: string;
  email: string;
  phone: string;
  year: string;
  major: string;
  positions: string[];
  why: string;
  bring: string;
  hours: number;
  link: string;
  heard: string;
  locale: string;
  resumeName: string;
  hasResume: boolean;
  status: Status;
  notes: string;
  memberId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type NotifySignup = { id: number; email: string; locale: string; createdAt: string };

// The emails "Email applicant" starts from. Admins edit them before sending.
export const EMAIL_TEMPLATES = {
  interview: {
    label: "Interview",
    subject: "Your VINdicated board application: let's talk",
    body: "Hi {first},\n\nThanks for applying to be {position} on VINdicated's {chapter} board. We'd love to meet you for a short interview (about 20 minutes).\n\nWhich of these times work for you? [add times]\n\nTalk soon,\n{sender}",
  },
  accepted: {
    label: "Accepted",
    subject: "Welcome to the VINdicated board!",
    body: "Hi {first},\n\nCongratulations! We'd like you to join VINdicated's {chapter} board as {position}.\n\nNext steps: [add the first meeting, Slack invite, etc.]\n\nWelcome aboard,\n{sender}",
  },
  declined: {
    label: "Declined",
    subject: "Your VINdicated board application",
    body: "Hi {first},\n\nThank you for applying to VINdicated's {chapter} board. We had many strong applicants this term and can't offer you a board position this time.\n\nWe'd still love to have you involved: you can volunteer with us anytime at getvindicated.org/join, and we hope you'll apply again next term.\n\nBest,\n{sender}",
  },
} as const;
export type TemplateKey = keyof typeof EMAIL_TEMPLATES;
