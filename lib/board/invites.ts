import "server-only";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EmailTimeoutError, sendEmail } from "@/lib/brevo";
import { chapterConfig, type ChapterId } from "./chapters";
import { CHAPTER_SERVER, chapterSender } from "./chapter-server";
import { buildIcs } from "./ics";
import { longDate, monthDay, repeatText, shortDate, timeRange, whenShort, type Invitee, type ScheduledMeeting } from "./schedule";

// Sends board meeting invites through Brevo's HTTP API, like the other board
// email (Railway blocks outbound SMTP). Each email carries the event as an
// "invite.ics" attachment with METHOD:REQUEST or METHOD:CANCEL, the meeting's
// UID and SEQUENCE, so calendars add, update or remove the same event. The
// API has no field for an attachment's content type; Brevo sets it from the
// .ics extension.
//
// Railway variables: BREVO_API_KEY, and a sender: the chapter's "from" in
// chapter-server.ts, or BOARD_INVITE_FROM for a chapter without one.
//
// For local testing, BOARD_INVITE_OUTBOX=<folder> writes each API request
// there as a .json file (and the .ics next to it) instead of sending it.

export type InviteKind = "new" | "update" | "cancel" | "cancel-one";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// The Railway variables invites still need, or null.
export function inviteSetupProblem(chapter: ChapterId): string | null {
  if (process.env.BOARD_INVITE_OUTBOX) return null;
  const missing = process.env.BREVO_API_KEY?.trim() ? [] : ["BREVO_API_KEY"];
  if (!chapterSender(chapter, "")) missing.push("BOARD_INVITE_FROM");
  return missing.length ? `Invites aren't set up yet. Rana: add ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")} in Railway (see BOARD_SETUP.md).` : null;
}

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.getvindicated.org").replace(/\/$/, "");
export const hubUrl = (chapter: ChapterId) => `${siteUrl()}${chapterConfig(chapter).path}`;

function content(kind: InviteKind, m: ScheduledMeeting, first: string, organizer: string, hub: string, onlyDate?: string) {
  const when = whenShort(m);
  const subject =
    kind === "new"
      ? `Invitation: ${m.title} · ${when}`
      : kind === "update"
        ? `Updated invitation: ${m.title} · ${when}`
        : kind === "cancel-one"
          ? `Cancelled: ${m.title} · ${longDate(onlyDate!)}`
          : `Cancelled: ${m.title}`;
  const paras =
    kind === "new"
      ? [
          `You're invited to ${m.weekly ? `the ${m.title}, ${whenShort(m)}` : `the ${m.title} on ${when}`}. Tap Yes, Maybe or No above to add it to your calendar.`,
          ...(m.notes ? [m.notes] : []),
        ]
      : kind === "update"
        ? [`The ${m.title} changed. It's now ${when}${m.location ? ` at ${m.location}` : ""}. Your calendar updates on its own, so there's nothing to delete.`, ...(m.notes ? [m.notes] : [])]
        : kind === "cancel-one"
          ? [`No ${m.title} on ${longDate(onlyDate!)}. The rest of the series is unchanged.`]
          : [`The ${m.title} is cancelled. Your calendar removes it on its own.`];
  const day = onlyDate ?? m.date;
  const cancelled = kind === "cancel" || kind === "cancel-one";
  const row = (label: string, value: string) => `<p style="margin:0"><b>${label}:</b> ${esc(value)}</p>`;
  const html = `<div style="font:16px/1.55 Arial,Helvetica,sans-serif;color:#1d1a1f">
<table role="presentation" style="border:1px solid #dcd8df;border-collapse:collapse;margin:0 0 16px"><tr>
<td style="border-right:1px solid #dcd8df;text-align:center;padding:14px 12px;vertical-align:top">
<div style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#9533A5;font-weight:700">${esc(monthDay(day).split(" ")[0])}</div>
<div style="font-size:34px;line-height:1.1;font-weight:700">${esc(monthDay(day).split(" ")[1])}</div>
<div style="font-size:14px">${esc(shortDate(day).split(",")[0])}</div></td>
<td style="padding:14px 16px;vertical-align:top">
${cancelled ? `<p style="margin:0 0 6px;color:#a32a2a;font-weight:700">This event has been cancelled</p>` : ""}
<p style="margin:0 0 4px;font-size:19px;font-weight:700${cancelled ? ";text-decoration:line-through" : ""}">${esc(m.title)}</p>
${row("When", `${kind === "cancel-one" ? longDate(day) : m.weekly ? `${longDate(m.date)} and weekly` : longDate(m.date)} · ${timeRange(m.startTime, m.endTime)} (Pacific)`)}
${m.weekly && !onlyDate ? row("Repeats", repeatText(m)) : ""}
${m.location ? row("Where", m.location) : ""}
${row("Organizer", organizer)}
</td></tr></table>
<p>Hi ${esc(first)},</p>
${paras.map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
<p>Your tasks are on the board hub: <a href="${esc(hub)}">${esc(hub.replace(/^https?:\/\//, ""))}</a></p>
<p>${esc(organizer)}</p>
</div>`;
  const textBody = [`Hi ${first},`, ...paras, `Your tasks are on the board hub: ${hub}`, organizer].join("\n\n");
  return { subject, html, text: textBody };
}

// Sends one email per recipient, each with the same .ics (all attendees
// listed). Returns who it reached and who it didn't. If Brevo times out, the
// rest aren't tried (they'd most likely hang too) and count as not reached.
export async function sendInvites(opts: {
  chapter: ChapterId;
  meeting: ScheduledMeeting;
  kind: InviteKind;
  recipients: Invitee[];
  // Everyone on the invite, for the ATTENDEE lines. Defaults to recipients.
  attendees?: Invitee[];
  onlyDate?: string;
}): Promise<{ sent: string[]; failed: string[] }> {
  const { chapter, meeting, kind, recipients, onlyDate } = opts;
  const config = chapterConfig(chapter);
  const org = CHAPTER_SERVER[chapter].organizer;
  const hub = hubUrl(chapter);
  const method = kind === "cancel" || kind === "cancel-one" ? "CANCEL" : "REQUEST";
  const ics = buildIcs({
    method,
    meeting,
    organizer: { name: `${org.short} (${config.title})`, email: org.email },
    attendees: opts.attendees ?? recipients,
    hubUrl: hub,
    onlyDate,
  });
  const sender = chapterSender(chapter, config.title) ?? { name: config.title, email: "board@getvindicated.org" };
  const outbox = process.env.BOARD_INVITE_OUTBOX;
  const attachment = [{ name: "invite.ics", content: Buffer.from(ics, "utf8").toString("base64") }];

  const sent: string[] = [];
  const failed: string[] = [];
  for (const [i, r] of recipients.entries()) {
    const first = r.name.split(/\s+/)[0] || r.name;
    const c = content(kind, meeting, first, org.short, hub, onlyDate);
    const mail = {
      sender,
      to: [{ name: r.name, email: r.email }],
      replyTo: { name: org.name, email: org.email },
      subject: c.subject,
      htmlContent: c.html,
      textContent: c.text,
      attachment,
    };
    try {
      if (outbox) {
        mkdirSync(outbox, { recursive: true });
        const base = join(outbox, `${Date.now()}-${i}-${kind}-${r.email}`);
        writeFileSync(`${base}.json`, JSON.stringify(mail, null, 2));
        writeFileSync(`${base}.ics`, ics);
      } else {
        await sendEmail(mail);
      }
      sent.push(r.email);
    } catch (e) {
      console.error(`[board] Invite to ${r.email} failed:`, e instanceof Error ? e.message : e);
      failed.push(r.email);
      if (e instanceof EmailTimeoutError) {
        failed.push(...recipients.slice(i + 1).map((x) => x.email));
        break;
      }
    }
  }
  console.log(`[board] ${kind} invite "${meeting.title}" (${chapter}): ${sent.length} sent, ${failed.length} failed.`);
  return { sent, failed };
}
