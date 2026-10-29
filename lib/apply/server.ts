import "server-only";
import type postgres from "postgres";
import { db } from "@/lib/board/db";
import { ensureSetup } from "@/lib/board/setup";
import { CHAPTER_IDS, type ChapterId } from "@/lib/board/chapters";
import { pacificToUtc } from "@/lib/board/ics";
import { defaultConfig, type AdminApplication, type ApplicationInput, type ApplyConfig, type NotifySignup, type Status } from "./rules";

// Board applications: each chapter's open/closed settings, and the
// applications and "email me when they open" signups admins review on the
// hub. Applicant data only ever leaves through admin-only hub routes and the
// emails in ./email.ts.

type Sql = ReturnType<typeof db> | postgres.TransactionSql;
type Row = Record<string, unknown>;

const KEY = "applications";

export async function getConfig(chapter: ChapterId, sql: Sql = db()): Promise<ApplyConfig> {
  const [r] = await sql`SELECT value FROM board_settings WHERE chapter = ${chapter} AND key = ${KEY}`;
  return r ? { ...defaultConfig(), ...(r.value as Partial<ApplyConfig>) } : defaultConfig();
}

export async function configId(sql: Sql, chapter: ChapterId): Promise<number | null> {
  const [r] = await sql`SELECT id FROM board_settings WHERE chapter = ${chapter} AND key = ${KEY}`;
  return r ? (r.id as number) : null;
}

// Saves a chapter's settings and returns the row id (for the change log).
export async function saveConfig(sql: Sql, chapter: ChapterId, value: ApplyConfig): Promise<number> {
  const [r] = await sql`INSERT INTO board_settings (chapter, key, value) VALUES (${chapter}, ${KEY}, ${sql.json(value as never)})
    ON CONFLICT (chapter, key) DO UPDATE SET value = EXCLUDED.value RETURNING id`;
  return r.id as number;
}

// The moment applications stop: midnight Pacific after the deadline day.
export function closesAt(deadline: string): Date {
  const [y, m, d] = deadline.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const iso = next.toISOString().slice(0, 10);
  return pacificToUtc(iso, "00:00");
}

export const isOpen = (c: ApplyConfig, now = new Date()) =>
  c.open && c.positions.length > 0 && (!c.deadline || now < closesAt(c.deadline));

// Why a chapter isn't taking applications, for the hub.
export function closedReason(c: ApplyConfig, now = new Date()): "off" | "deadline" | "positions" | null {
  if (!c.open) return "off";
  if (!c.positions.length) return "positions";
  if (c.deadline && now >= closesAt(c.deadline)) return "deadline";
  return null;
}

// What the public page may know about a chapter: whether it's open, until
// when, and its open positions.
export type PublicChapter = { id: ChapterId; open: boolean; deadline: string | null; positions: string[] };

export async function publicChapters(now = new Date()): Promise<PublicChapter[]> {
  await ensureSetup();
  const out: PublicChapter[] = [];
  for (const id of CHAPTER_IDS) {
    const c = await getConfig(id);
    const open = isOpen(c, now);
    out.push({ id, open, deadline: open ? c.deadline : null, positions: open ? c.positions : [] });
  }
  return out;
}

// Saves an application. The same email, chapter and term updates the one
// already there (keeping its status and notes) instead of adding another.
// A new resume replaces the old one; none keeps it.
export async function saveApplication(
  chapter: ChapterId,
  term: string,
  a: ApplicationInput,
  locale: string,
  resume: { filename: string; data: Buffer } | null,
): Promise<{ id: number; updated: boolean }> {
  const sql = db();
  return sql.begin(async (tx) => {
    const [old] = await tx`SELECT id, resume_id FROM board_applications
      WHERE chapter = ${chapter} AND term = ${term} AND lower(email) = ${a.email} FOR UPDATE`;
    let resumeId: number | null = (old?.resume_id as number | null) ?? null;
    let resumeName: string | null = null;
    if (resume) {
      const [f] = await tx`INSERT INTO board_application_files (chapter, filename, data)
        VALUES (${chapter}, ${resume.filename}, ${resume.data}) RETURNING id`;
      if (resumeId) await tx`DELETE FROM board_application_files WHERE id = ${resumeId} AND chapter = ${chapter}`;
      resumeId = f.id as number;
      resumeName = resume.filename;
    }
    const fields = {
      name: a.name,
      email: a.email,
      phone: a.phone,
      year: a.year,
      major: a.major,
      positions: a.positions,
      why: a.why,
      bring: a.bring,
      hours: a.hours,
      link: a.link,
      heard: a.heard,
      locale,
      resume_id: resumeId,
      ...(resumeName !== null ? { resume_name: resumeName } : {}),
    };
    if (old) {
      await tx`UPDATE board_applications SET ${tx({ ...fields, updated_at: new Date() })} WHERE id = ${old.id}`;
      return { id: old.id as number, updated: true };
    }
    const [r] = await tx`INSERT INTO board_applications ${tx({ ...fields, chapter, term })} RETURNING id`;
    return { id: r.id as number, updated: false };
  });
}

export function toAdmin(r: Row): AdminApplication {
  return {
    id: r.id as number,
    term: r.term as string,
    name: r.name as string,
    email: r.email as string,
    phone: r.phone as string,
    year: r.year as string,
    major: r.major as string,
    positions: r.positions as string[],
    why: r.why as string,
    bring: r.bring as string,
    hours: r.hours as number,
    link: r.link as string,
    heard: r.heard as string,
    locale: r.locale as string,
    resumeName: r.resume_name as string,
    hasResume: r.resume_id !== null,
    status: r.status as Status,
    notes: r.notes as string,
    memberId: (r.member_id as number | null) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

// Every column but the resume reference's file, newest first.
export async function listApplications(chapter: ChapterId, sql: Sql = db()): Promise<AdminApplication[]> {
  const rows = await sql`SELECT * FROM board_applications WHERE chapter = ${chapter} ORDER BY created_at DESC, id DESC`;
  return rows.map(toAdmin);
}

export async function getApplication(chapter: ChapterId, id: number, sql: Sql = db()): Promise<AdminApplication | null> {
  const [r] = await sql`SELECT * FROM board_applications WHERE chapter = ${chapter} AND id = ${id}`;
  return r ? toAdmin(r) : null;
}

export async function listNotify(chapter: ChapterId, sql: Sql = db()): Promise<NotifySignup[]> {
  const rows = await sql`SELECT id, email, locale, created_at FROM board_application_notify WHERE chapter = ${chapter} ORDER BY created_at`;
  return rows.map((r) => ({ id: r.id, email: r.email, locale: r.locale, createdAt: new Date(r.created_at).toISOString() }));
}

// Deletes applications and their resumes. Returns how many went.
export async function deleteApplications(sql: Sql, chapter: ChapterId, ids: number[]): Promise<number> {
  if (!ids.length) return 0;
  const rows = await sql`DELETE FROM board_applications WHERE chapter = ${chapter} AND id IN ${sql(ids)} RETURNING resume_id`;
  const files = rows.map((r) => r.resume_id as number | null).filter((x): x is number => x !== null);
  if (files.length) await sql`DELETE FROM board_application_files WHERE chapter = ${chapter} AND id IN ${sql(files)}`;
  return rows.length;
}
