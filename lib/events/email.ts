import "server-only";
import { EmailTimeoutError } from "@/lib/brevo";
import { chapterConfig } from "@/lib/board/chapters";
import { CHAPTER_SERVER, chapterSender } from "@/lib/board/chapter-server";
import { deliver } from "@/lib/board/invites";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isRtl, isValidLocale, type Locale } from "@/lib/i18n/config";
import type { EventsPageDict } from "@/lib/i18n/dictionary";
import { eventLabels } from "./format";
import { buildEventIcs, eventUrl, type IcsLabels } from "./ics";
import { getFullEvent, type FullEvent } from "./server";

// RSVP confirmations and "Send reminder to everyone" emails. They go out the
// same way as board invites (lib/board/invites.ts: SMTP on 2525, then the
// Brevo API, or the BOARD_INVITE_OUTBOX folder when testing), from the
// event's chapter sender, with the event's .ics. Each person gets them in
// the language they RSVPed in (eventsPage.email in the dictionaries). These
// emails are the only place the meeting link appears.

export type EmailKind = "confirm" | "reminder";
export type Recipient = { name: string; email: string; locale?: string };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

export const icsLabels = (d: EventsPageDict): IcsLabels => ({
  online: d.online,
  linkNote: d.done.calendarNote,
  host: d.email.host,
  join: d.email.join,
});

function content(kind: EmailKind, e: FullEvent, d: EventsPageDict, locale: string, first: string) {
  const m = d.email;
  const l = eventLabels(e, locale);
  const when = `${l.dateLabel} · ${fill(d.time, { time: l.timeLabel })}`;
  const subject = fill(kind === "confirm" ? m.confirmSubject : m.reminderSubject, { title: e.title, when: `${l.short}` });
  const link = e.online ? e.meetingLink : "";
  const where = e.online ? d.online : e.address;
  const opening = fill(kind === "confirm" ? m.confirmBody : m.reminderBody, { title: e.title, when });
  const how = e.online ? (link ? fill(m.join, { link }) : m.linkLater) : fill(m.inPerson, { address: e.address });
  const page = eventUrl(e.id, locale);
  const row = (label: string, value: string, href?: string) =>
    `<p style="margin:0"><b>${esc(label)}:</b> ${href ? `<a href="${esc(href)}">${esc(value)}</a>` : esc(value)}</p>`;
  const dir = isRtl(locale as Locale) ? "rtl" : "ltr";
  const html = `<div dir="${dir}" style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#1d1a1f">
<table role="presentation" style="border:1px solid #dcd8df;border-collapse:collapse;margin:0 0 16px"><tr>
<td style="border-inline-end:1px solid #dcd8df;text-align:center;padding:14px 12px;vertical-align:top">
<div style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#9533A5;font-weight:700">${esc(l.month)}</div>
<div style="font-size:34px;line-height:1.1;font-weight:700">${esc(l.day)}</div></td>
<td style="padding:14px 16px;vertical-align:top">
<p style="margin:0 0 4px;font-size:19px;font-weight:700">${esc(e.title)}</p>
${row(m.when, when)}
${row(m.where, where)}
${link ? row(m.zoomLink, link, link) : ""}
${e.hostName ? row(m.host, e.hostTitle ? `${e.hostName}, ${e.hostTitle}` : e.hostName) : ""}
</td></tr></table>
<p>${esc(fill(m.hi, { name: first }))}</p>
<p>${esc(opening)}</p>
<p>${link ? esc(m.join).replace("{link}", `<a href="${esc(link)}">${esc(link)}</a>`) : esc(how)}</p>
${e.description ? `<p>${esc(e.description)}</p>` : ""}
<p>${esc(m.details).replace("{link}", `<a href="${esc(page)}">${esc(page.replace(/^https?:\/\//, ""))}</a>`)}</p>
<p>${esc(m.signoff)}</p>
</div>`;
  const textBody = [
    fill(m.hi, { name: first }),
    opening,
    `${m.when}: ${when}`,
    `${m.where}: ${where}`,
    how,
    e.description,
    fill(m.details, { link: page }),
    m.signoff,
  ]
    .filter(Boolean)
    .join("\n\n");
  return { subject, html, text: textBody };
}

// Sends one email per person, each in their language. After an API timeout
// the rest aren't tried (they'd most likely hang too) and count as failed.
export async function sendEventEmails(
  eventId: number,
  kind: EmailKind,
  recipients: Recipient[],
): Promise<{ sent: string[]; failed: string[] }> {
  const base = await getFullEvent(eventId);
  if (!base) return { sent: [], failed: recipients.map((r) => r.email) };
  const config = chapterConfig(base.chapter);
  const org = CHAPTER_SERVER[base.chapter].organizer;
  const sender = chapterSender(base.chapter, config.title) ?? { name: config.title, email: "board@getvindicated.org" };
  const state = { useSmtp: !!(process.env.BREVO_SMTP_LOGIN?.trim() && process.env.BREVO_SMTP_KEY?.trim()) };
  // One copy of the event and its wording per language.
  const cache = new Map<string, { e: FullEvent; d: EventsPageDict; ics: string }>();
  const forLocale = async (raw = "en") => {
    const locale = isValidLocale(raw) ? raw : "en";
    if (!cache.has(locale)) {
      const e = (await getFullEvent(eventId, locale)) ?? base;
      const d = (await getDictionary(locale as Locale)).eventsPage;
      cache.set(locale, { e, d, ics: buildEventIcs(e, e.meetingLink || null, icsLabels(d), locale) });
    }
    return { locale, ...cache.get(locale)! };
  };

  const sent: string[] = [];
  const failed: string[] = [];
  for (const [i, r] of recipients.entries()) {
    const { locale, e, d, ics } = await forLocale(r.locale);
    const first = r.name.trim().split(/\s+/)[0] || r.name;
    const c = content(kind, e, d, locale, first);
    try {
      await deliver(
        {
          sender,
          to: { name: r.name, email: r.email },
          replyTo: { name: org.name, email: org.email },
          subject: c.subject,
          text: c.text,
          html: c.html,
          ics: { method: "PUBLISH", filename: "event.ics", content: ics },
        },
        state,
        `${i}-event-${kind}-${r.email}`,
      );
      sent.push(r.email);
    } catch (err) {
      console.error(`[events] ${kind} email to ${r.email} failed:`, err instanceof Error ? err.message : err);
      failed.push(r.email);
      if (err instanceof EmailTimeoutError) {
        failed.push(...recipients.slice(i + 1).map((x) => x.email));
        break;
      }
    }
  }
  console.log(`[events] ${kind} "${base.title}" (${base.chapter}): ${sent.length} sent, ${failed.length} failed.`);
  return { sent, failed };
}
