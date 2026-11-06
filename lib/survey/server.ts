import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/board/db";
import { CHAPTER_IDS } from "@/lib/board/chapters";
import { boardUser, type BoardUser } from "@/lib/board/session";
import { QUESTIONS_VERSION, type Answers, type Demographics } from "./questions";
import type { SurveyRow } from "./stats";

export { surveyPublic } from "./flag";

// A hub admin of any chapter (they can preview the survey before launch,
// and their answers are saved as tests), or null.
export function surveyAdmin(headers: Headers): BoardUser | null {
  for (const chapter of CHAPTER_IDS) {
    const user = boardUser(headers, chapter);
    if (user?.role === "admin") return user;
  }
  return null;
}

// The page hands out a signed "started at" time with the form, so the API
// can tell how long someone took without trusting the browser's clock.
// The key is BOARD_SESSION_SECRET when set, else one made per server start
// (a restart then only means the page has to be reloaded).
let fallbackKey: string | null = null;
function key() {
  const s = process.env.BOARD_SESSION_SECRET?.trim();
  if (s && s.length >= 32) return `survey:${s}`;
  fallbackKey ??= randomBytes(32).toString("hex");
  return fallbackKey;
}
const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");

export function startToken(now = Date.now()) {
  const t = String(now);
  return `${t}.${sign(t)}`;
}

// Seconds since the token was handed out, or null when it's forged,
// malformed or more than a day old.
export function secondsSince(token: unknown, now = Date.now()): number | null {
  if (typeof token !== "string") return null;
  const [t, sig] = token.split(".");
  if (!/^\d{10,15}$/.test(t ?? "") || !sig) return null;
  const want = Buffer.from(sign(t));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  const s = (now - Number(t)) / 1000;
  return s >= 0 && s <= 24 * 3600 ? s : null;
}

export async function saveResponse(r: { locale: string; source: string | null; answers: Answers; demographics: Demographics; test: boolean }) {
  const sql = db();
  // Only the day is kept, never the time.
  const [row] = await sql`
    INSERT INTO survey_responses (questions_version, locale, source, answers, demographics, test)
    VALUES (${QUESTIONS_VERSION}, ${r.locale}, ${r.source}, ${sql.json(r.answers)}, ${sql.json(r.demographics as Record<string, string | string[]>)}, ${r.test})
    RETURNING id`;
  return row.id as number;
}

export async function listResponses(): Promise<SurveyRow[]> {
  const rows = await db()`
    SELECT id, created_at, questions_version, locale, source, answers, demographics, test
    FROM survey_responses ORDER BY created_at, id`;
  return rows.map((r) => ({
    id: r.id as number,
    createdAt: r.created_at as string,
    version: r.questions_version as number,
    locale: r.locale as string,
    source: (r.source as string | null) ?? null,
    answers: r.answers as Answers,
    demographics: r.demographics as Demographics,
    test: r.test as boolean,
  }));
}

export async function deleteTestResponses() {
  const rows = await db()`DELETE FROM survey_responses WHERE test RETURNING id`;
  return rows.length;
}
