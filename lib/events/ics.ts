import "server-only";
import { TZID, VTIMEZONE, fold, local, text, utcStamp } from "@/lib/board/ics";

// Calendar files for public events (METHOD:PUBLISH: an event to add, with
// no Yes / Maybe / No). The emailed one carries the meeting link; the one
// the page offers for download doesn't, since anyone can fetch it.

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.getvindicated.org").replace(/\/$/, "");
export const eventUrl = (id: number, locale = "en") => `${siteUrl()}/${locale}/events#event-${id}`;

export type IcsEvent = {
  id: number;
  uid: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  online: boolean;
  address: string;
  hostName: string;
  description: string;
};

export function buildEventIcs(e: IcsEvent, meetingLink: string | null): string {
  const where = e.online ? meetingLink || "Online, on Zoom" : e.address;
  const join = e.online
    ? meetingLink
      ? `Join: ${meetingLink}`
      : "The Zoom link is in your RSVP confirmation email."
    : "";
  const description = [e.description, e.hostName && `Host: ${e.hostName}`, join, eventUrl(e.id)].filter(Boolean).join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VINdicated//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    "SEQUENCE:0",
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART;TZID=${TZID}:${local(e.date, e.startTime)}`,
    `DTEND;TZID=${TZID}:${local(e.date, e.endTime)}`,
    `SUMMARY:${text(e.title)}`,
    ...(where ? [`LOCATION:${text(where)}`] : []),
    `DESCRIPTION:${text(description)}`,
    `URL:${eventUrl(e.id)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
