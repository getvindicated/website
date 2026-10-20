import "server-only";
import { EmailTimeoutError } from "@/lib/brevo";
import { chapterConfig } from "@/lib/board/chapters";
import { CHAPTER_SERVER, chapterSender } from "@/lib/board/chapter-server";
import { deliver } from "@/lib/board/invites";
import { longDate, monthDay, shortDate, timeRange } from "@/lib/board/schedule";
import { buildEventIcs, eventUrl } from "./ics";
import type { FullEvent } from "./server";

// RSVP confirmations and "Send reminder to everyone" emails. They go out the
// same way as board invites (lib/board/invites.ts: SMTP on 2525, then the
// Brevo API, or the BOARD_INVITE_OUTBOX folder when testing), from the
// event's chapter sender, with the event's .ics. These emails are the only
// place the meeting link appears.

export type EmailKind = "confirm" | "reminder";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function content(kind: EmailKind, e: FullEvent, first: string) {
  const when = `${longDate(e.date)} · ${timeRange(e.startTime, e.endTime)} (Pacific)`;
  const subject = `${kind === "confirm" ? "You're in" : "Reminder"}: ${e.title} · ${shortDate(e.date)}, ${timeRange(e.startTime, e.endTime)}`;
  const link = e.online ? e.meetingLink : "";
  const where = e.online ? (link ? `Online, on Zoom: ${link}` : "Online, on Zoom") : e.address;
  const opening =
    kind === "confirm"
      ? `Thanks for your RSVP. You're registered for ${e.title}. It's free, and it's also in the calendar file attached to this email.`
      : `This is a reminder that ${e.title} is coming up: ${when}.`;
  const how = e.online
    ? link
      ? `Join on Zoom: ${link}`
      : "We'll email you the Zoom link before the event."
    : `It's in person at ${e.address}.`;
  const page = eventUrl(e.id);
  const row = (label: string, value: string, href?: string) =>
    `<p style="margin:0"><b>${label}:</b> ${href ? `<a href="${esc(href)}">${esc(value)}</a>` : esc(value)}</p>`;
  const [mon, day] = monthDay(e.date).split(" ");
  const html = `<div style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#1d1a1f">
<table role="presentation" style="border:1px solid #dcd8df;border-collapse:collapse;margin:0 0 16px"><tr>
<td style="border-right:1px solid #dcd8df;text-align:center;padding:14px 12px;vertical-align:top">
<div style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#9533A5;font-weight:700">${esc(mon)}</div>
<div style="font-size:34px;line-height:1.1;font-weight:700">${esc(day)}</div>
<div style="font-size:14px">${esc(shortDate(e.date).split(",")[0])}</div></td>
<td style="padding:14px 16px;vertical-align:top">
<p style="margin:0 0 4px;font-size:19px;font-weight:700">${esc(e.title)}</p>
${row("When", when)}
${link ? row("Where", "Online, on Zoom") + row("Zoom link", link, link) : row("Where", where)}
${e.hostName ? row("Host", e.hostTitle ? `${e.hostName}, ${e.hostTitle}` : e.hostName) : ""}
</td></tr></table>
<p>Hi ${esc(first)},</p>
<p>${esc(opening)}</p>
<p>${link ? `Join on Zoom: <a href="${esc(link)}">${esc(link)}</a>` : esc(how)}</p>
${e.description ? `<p>${esc(e.description)}</p>` : ""}
<p>Event details: <a href="${esc(page)}">${esc(page.replace(/^https?:\/\//, ""))}</a></p>
<p>VINdicated</p>
</div>`;
  const textBody = [`Hi ${first},`, opening, `When: ${when}`, `Where: ${where}`, how, e.description, `Event details: ${page}`, "VINdicated"]
    .filter(Boolean)
    .join("\n\n");
  return { subject, html, text: textBody };
}

// Sends one email per person. After an API timeout the rest aren't tried
// (they'd most likely hang too) and count as failed.
export async function sendEventEmails(
  e: FullEvent,
  kind: EmailKind,
  recipients: { name: string; email: string }[],
): Promise<{ sent: string[]; failed: string[] }> {
  const config = chapterConfig(e.chapter);
  const org = CHAPTER_SERVER[e.chapter].organizer;
  const sender = chapterSender(e.chapter, config.title) ?? { name: config.title, email: "board@getvindicated.org" };
  const ics = buildEventIcs(e, e.meetingLink || null);
  const state = { useSmtp: !!(process.env.BREVO_SMTP_LOGIN?.trim() && process.env.BREVO_SMTP_KEY?.trim()) };
  const sent: string[] = [];
  const failed: string[] = [];
  for (const [i, r] of recipients.entries()) {
    const first = r.name.trim().split(/\s+/)[0] || r.name;
    const c = content(kind, e, first);
    try {
      await deliver(
        {
          sender,
          to: r,
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
  console.log(`[events] ${kind} "${e.title}" (${e.chapter}): ${sent.length} sent, ${failed.length} failed.`);
  return { sent, failed };
}
