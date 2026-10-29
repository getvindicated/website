import "server-only";
import { EmailTimeoutError } from "@/lib/brevo";
import { chapterConfig, type ChapterId } from "@/lib/board/chapters";
import { CHAPTER_SERVER, applicationRecipients, chapterSender, type Sender } from "@/lib/board/chapter-server";
import { deliver, hubUrl, inviteSetupProblem } from "@/lib/board/invites";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isRtl, isValidLocale, type Locale } from "@/lib/i18n/config";
import { YEAR_LABELS, type ApplicationInput, type Year } from "./rules";

// Board application emails. They go out like event emails (SMTP, then the
// Brevo API, or the BOARD_INVITE_OUTBOX folder when testing) from the
// chapter's sender:
// - the applicant's confirmation, in the language they applied in, with a
//   copy of their answers;
// - the chapter's notice to its applications recipients (chapter-server.ts),
//   in English, with the answers and a link to the application in the hub;
// - "Email applicant" messages admins write on the hub.
// Nothing is sent automatically when a status changes.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
const para = (s: string) => `<p>${esc(s).replace(/\n/g, "<br>")}</p>`;

const sender = (chapter: ChapterId): Sender =>
  chapterSender(chapter, chapterConfig(chapter).title) ?? { name: chapterConfig(chapter).title, email: "board@getvindicated.org" };
const organizer = (chapter: ChapterId) => {
  const o = CHAPTER_SERVER[chapter].organizer;
  return { name: o.name, email: o.email };
};
const smtpState = () => ({ useSmtp: !!(process.env.BREVO_SMTP_LOGIN?.trim() && process.env.BREVO_SMTP_KEY?.trim()) });

// The link admins follow from the notice.
export const applicationUrl = (chapter: ChapterId, id: number) => `${hubUrl(chapter)}?application=${id}#applications`;

type Answers = { label: string; value: string }[];

function answersHtml(rows: Answers) {
  return `<table role="presentation" style="border-collapse:collapse;margin:0 0 16px">${rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:700;white-space:nowrap">${esc(r.label)}</td><td style="padding:6px 0;vertical-align:top">${esc(r.value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;
}
const answersText = (rows: Answers) => rows.map((r) => `${r.label}:\n${r.value}`).join("\n\n");

type Sent = { ok: boolean; error?: string };

async function send(chapter: ChapterId, mail: Omit<Parameters<typeof deliver>[0], "sender">, tag: string): Promise<Sent> {
  const problem = inviteSetupProblem(chapter);
  if (problem) {
    console.error(`[apply] Email not sent: ${problem}`);
    return { ok: false, error: problem };
  }
  try {
    await deliver({ ...mail, sender: sender(chapter) }, smtpState(), tag);
    return { ok: true };
  } catch (e) {
    console.error(`[apply] Email "${mail.subject}" failed:`, e instanceof Error ? e.message : e);
    return { ok: false, error: e instanceof EmailTimeoutError ? e.message : "The email didn't go through. Try again." };
  }
}

// The applicant's confirmation, with a copy of everything they sent.
export async function sendConfirmation(
  chapter: ChapterId,
  term: string,
  a: ApplicationInput,
  resumeName: string,
  rawLocale: string,
  updated: boolean,
): Promise<Sent> {
  const locale = (isValidLocale(rawLocale) ? rawLocale : "en") as Locale;
  const d = (await getDictionary(locale)).applyPage;
  const f = d.form;
  const m = d.email;
  const chapterName = d.chapters[chapter as keyof typeof d.chapters] ?? chapterConfig(chapter).title;
  const first = a.name.split(/\s+/)[0] || a.name;
  const rows: Answers = [
    { label: f.chapter, value: chapterName },
    { label: f.positions, value: a.positions.join(", ") },
    { label: f.name, value: a.name },
    { label: f.email, value: a.email },
    { label: f.phone, value: a.phone || m.none },
    { label: f.year, value: f.years[a.year as keyof typeof f.years] ?? a.year },
    { label: f.major, value: a.major },
    { label: f.why, value: a.why },
    { label: f.bring, value: a.bring },
    { label: f.hours, value: String(a.hours) },
    { label: m.resume, value: resumeName || m.none },
    { label: f.link, value: a.link || m.none },
    { label: f.heard, value: a.heard || m.none },
  ];
  const opening = fill(m.body, { chapter: chapterName, term });
  const dir = isRtl(locale) ? "rtl" : "ltr";
  const html = `<div dir="${dir}" style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#1d1a1f">
${para(fill(m.hi, { name: first }))}
${para(opening)}
${updated ? para(m.updated) : ""}
<p style="margin:20px 0 8px;font-size:18px;font-weight:700;color:#9533A5">${esc(m.copy)}</p>
${answersHtml(rows)}
${para(m.signoff)}
</div>`;
  const text = [fill(m.hi, { name: first }), opening, updated ? m.updated : "", `${m.copy}\n\n${answersText(rows)}`, m.signoff].filter(Boolean).join("\n\n");
  return send(
    chapter,
    { to: { name: a.name, email: a.email }, replyTo: organizer(chapter), subject: fill(m.subject, { chapter: chapterName }), html, text },
    `apply-confirm-${a.email}`,
  );
}

// The chapter's notice: one email to its applications recipients (cc'd
// where set), with the answers and a link to the application in the hub.
export async function sendChapterNotice(chapter: ChapterId, id: number, term: string, a: ApplicationInput, resumeName: string, updated: boolean): Promise<Sent> {
  const { to, cc } = applicationRecipients(chapter);
  if (!to.length) return { ok: false, error: "No one is set to get applications." };
  const strip = (p: { name: string; email: string }) => ({ name: p.name, email: p.email });
  const link = applicationUrl(chapter, id);
  const rows: Answers = [
    { label: "Positions", value: a.positions.join(", ") },
    { label: "Name", value: a.name },
    { label: "Email", value: a.email },
    { label: "Phone", value: a.phone || "—" },
    { label: "Year", value: YEAR_LABELS[a.year as Year] ?? a.year },
    { label: "Major", value: a.major },
    { label: "Why join the board", value: a.why },
    { label: "What they'd bring", value: a.bring },
    { label: "Hours per week", value: String(a.hours) },
    { label: "Resume", value: resumeName ? `${resumeName} (download it on the hub)` : "None" },
    { label: "LinkedIn / portfolio", value: a.link || "—" },
    { label: "Heard about us", value: a.heard || "—" },
    { label: "Term", value: term },
  ];
  const intro = updated
    ? `${a.name} applied again for ${term}, so their application was updated with these answers.`
    : `${a.name} applied to the ${chapterConfig(chapter).title} board for ${term}.`;
  const html = `<div style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#1d1a1f">
${para(intro)}
${answersHtml(rows)}
<p><a href="${esc(link)}">Open the application in the board hub</a> (admins only) to download the resume, add notes or change its status.</p>
</div>`;
  const text = [intro, answersText(rows), `Open it in the board hub (admins only): ${link}`].join("\n\n");
  const prefix = CHAPTER_SERVER[chapter].submissions.subjectPrefix;
  return send(
    chapter,
    {
      to: to.map(strip),
      cc: cc.map(strip),
      replyTo: { name: a.name, email: a.email },
      subject: `${prefix} ${updated ? "Updated board application" : "Board application"}: ${a.name} (${a.positions.join(", ")})`,
      html,
      text,
    },
    `apply-notice-${id}`,
  );
}

// A message an admin wrote on the hub. Replies go to the chapter organizer.
export async function sendApplicantEmail(chapter: ChapterId, to: { name: string; email: string }, subject: string, body: string, id: number): Promise<Sent> {
  const html = `<div style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#1d1a1f">${body
    .split(/\n{2,}/)
    .map(para)
    .join("\n")}</div>`;
  return send(chapter, { to, replyTo: organizer(chapter), subject, html, text: body }, `apply-message-${id}`);
}
