import "server-only";
import { randomUUID } from "node:crypto";
import { EmailTimeoutError, sendEmail } from "@/lib/brevo";
import { chapterConfig, type ChapterId } from "./chapters";
import { CHAPTER_SERVER, chapterSender } from "./chapter-server";
import { db } from "./db";
import { hubUrl } from "./invites";
import { isEmail } from "./submit-rules";
import type { SendSummary } from "./types";

// Announcement emails: one email per person through the Brevo API, so no
// one sees anyone else's address. From the chapter's sender (or
// BOARD_INVITE_FROM), reply-to the chapter's organizer.

export type AnnouncementMail = { title: string; body: string; adminsOnly: boolean };
type Person = { name: string; email: string };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const chapterTag = (chapter: ChapterId) => (chapter === "ucla" ? "[VINdicated UCLA]" : "[VINdicated Berkeley]");

// The Railway variables announcement emails still need, or null.
export function announceSetupProblem(chapter: ChapterId): string | null {
  if (!process.env.BREVO_API_KEY && process.env.NODE_ENV === "development") return null;
  const missing = [
    ...(process.env.BREVO_API_KEY?.trim() ? [] : ["BREVO_API_KEY"]),
    ...(chapterSender(chapter, "") ? [] : ["BOARD_INVITE_FROM"]),
  ];
  return missing.length ? `Announcement emails aren't set up yet. Rana: add ${missing.join(" and ")} in Railway (see BOARD_SETUP.md).` : null;
}

// Everyone an announcement emails: all members with an email on file, or
// only the Hub admins for an admins-only one. Plus who has no email.
export async function announcementRecipients(chapter: ChapterId, adminsOnly: boolean) {
  const rows = await db()`SELECT name, email FROM board_members
    WHERE chapter = ${chapter} ${adminsOnly ? db()`AND is_hub_admin` : db()``} ORDER BY sort, id`;
  return {
    to: rows.filter((r) => isEmail(r.email.trim())).map((r) => ({ name: r.name as string, email: r.email.trim() as string })),
    missing: rows.filter((r) => !isEmail(r.email.trim())).map((r) => r.name as string),
  };
}

function message(chapter: ChapterId, a: AnnouncementMail, update: boolean, first: string) {
  const hub = hubUrl(chapter);
  const subject = `${update ? "Updated: " : ""}${chapterTag(chapter)} ${a.title}`;
  const html = `<div style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#1d1a1f">
<p>Hi ${esc(first)},</p>
${update ? "<p>An announcement on the board hub was updated:</p>" : ""}
<p style="font-size:19px;font-weight:700;margin:0 0 8px">${esc(a.title)}</p>
${a.body ? `<p>${esc(a.body).replace(/\n/g, "<br>")}</p>` : ""}
<p>See it on the board hub: <a href="${esc(hub)}">${esc(hub.replace(/^https?:\/\//, ""))}</a></p>
<p>${esc(CHAPTER_SERVER[chapter].organizer.short)}</p>
</div>`;
  return { subject, html };
}

// Sends to each person separately. Returns who it reached and who it didn't.
export async function sendAnnouncement(chapter: ChapterId, a: AnnouncementMail, people: Person[], update: boolean) {
  const org = CHAPTER_SERVER[chapter].organizer;
  const title = chapterConfig(chapter).title;
  const sender = chapterSender(chapter, title) ?? { name: title, email: "board@getvindicated.org" };
  const results: (Person & { ok: boolean; error: string })[] = [];
  for (const [i, p] of people.entries()) {
    const m = message(chapter, a, update, p.name.split(/\s+/)[0] || p.name);
    const mail = {
      sender,
      to: [{ email: p.email, name: p.name }],
      replyTo: { email: org.email, name: org.name },
      subject: m.subject,
      htmlContent: m.html,
    };
    try {
      if (!process.env.BREVO_API_KEY && process.env.NODE_ENV === "development") {
        console.log("[board] Announcement not sent (no BREVO_API_KEY in dev):", { subject: mail.subject, to: p.email });
      } else {
        await sendEmail(mail);
      }
      results.push({ ...p, ok: true, error: "" });
    } catch (e) {
      const error = e instanceof Error ? e.message.slice(0, 300) : "Send failed";
      console.error(`[board] Announcement to ${p.email} failed:`, error);
      results.push({ ...p, ok: false, error });
      // Brevo isn't answering: don't wait 15 seconds for each of the rest.
      if (e instanceof EmailTimeoutError) {
        results.push(...people.slice(i + 1).map((x) => ({ ...x, ok: false, error })));
        break;
      }
    }
  }
  return results;
}

// Records one send (post, update or retry) for the admin view.
export async function recordSends(chapter: ChapterId, announcementId: number, kind: string, results: { name: string; email: string; ok: boolean; error: string }[]) {
  const sql = db();
  const batch = randomUUID();
  for (const r of results) {
    await sql`INSERT INTO board_announcement_sends (chapter, announcement_id, batch, kind, email, name, ok, error)
      VALUES (${chapter}, ${announcementId}, ${batch}, ${kind}, ${r.email}, ${r.name}, ${r.ok}, ${r.error})`;
  }
}


// For each announcement, its latest send and who still hasn't got it.
export async function sendSummaries(chapter: ChapterId): Promise<SendSummary[]> {
  const rows = await db()`SELECT announcement_id, batch, kind, email, name, ok, at FROM board_announcement_sends
    WHERE chapter = ${chapter} ORDER BY at`;
  const by = new Map<number, SendSummary & { batches: Map<string, { ok: string[]; failed: Person[]; at: string; kind: string }> }>();
  for (const r of rows) {
    const s = by.get(r.announcement_id) ?? { announcementId: r.announcement_id, at: "", kind: "", sent: 0, failed: [], batches: new Map() };
    const b = s.batches.get(r.batch) ?? { ok: [], failed: [], at: new Date(r.at).toISOString(), kind: r.kind };
    if (r.ok) b.ok.push(r.email);
    else b.failed.push({ name: r.name, email: r.email });
    s.batches.set(r.batch, b);
    by.set(r.announcement_id, s);
  }
  return [...by.values()].map((s) => {
    // The latest post or update, plus any retries after it.
    const batches = [...s.batches.values()];
    const startIdx = batches.map((b) => b.kind).lastIndexOf(batches.filter((b) => b.kind !== "retry").at(-1)?.kind ?? "post");
    const recent = batches.slice(Math.max(0, startIdx));
    const reached = new Set(recent.flatMap((b) => b.ok));
    const failed = new Map<string, Person>();
    for (const b of recent) for (const f of b.failed) if (!reached.has(f.email)) failed.set(f.email, f);
    return { announcementId: s.announcementId, at: recent[0].at, kind: recent[0].kind, sent: reached.size, failed: [...failed.values()] };
  });
}
