import "server-only";
import type { Invitee, ScheduledMeeting } from "./schedule";

// Builds the invite.ics attached to board meeting invites (RFC 5545 with
// iTIP methods, RFC 5546). The UID stays the same for the life of a meeting
// and SEQUENCE goes up with each change, so calendar apps update or remove
// the event they already have instead of adding another.

export const TZID = "America/Los_Angeles";

export const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0800",
  "TZOFFSETTO:-0700",
  "TZNAME:PDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0700",
  "TZOFFSETTO:-0800",
  "TZNAME:PST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// Shared with the public event calendar files (lib/events/ics.ts).
// Text values escape backslashes, semicolons, commas and newlines.
export const text = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// Parameter values (CN=) can't hold quotes; quote them when they have : ; or ,
const param = (s: string) => {
  const clean = s.replace(/"/g, "'");
  return /[:;,]/.test(clean) ? `"${clean}"` : clean;
};

// Lines longer than 75 octets continue on the next line after a space.
export function fold(line: string) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Don't split a multi-byte character.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74; // continuation lines start with a space
  }
  return parts.join("\r\n ");
}

export const local = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

// The UTC instant of a Pacific wall-clock time.
export function pacificToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm, ss = 0] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm, ss);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZID,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(guess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asPacific = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return new Date(guess + (guess - asPacific));
}

export const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export type Organizer = { name: string; email: string };

type Build = {
  method: "REQUEST" | "CANCEL";
  meeting: ScheduledMeeting;
  organizer: Organizer;
  attendees: Invitee[];
  hubUrl: string;
  // CANCEL of one date in a weekly series.
  onlyDate?: string;
};

export function buildIcs({ method, meeting: m, organizer, attendees, hubUrl, onlyDate }: Build): string {
  const weekday = DAYS[new Date(`${m.date}T12:00:00Z`).getUTCDay()];
  const date = onlyDate ?? m.date;
  const description = [m.notes, `Board hub: ${hubUrl}`].filter(Boolean).join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VINdicated//Board Hub//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${m.uid}`,
    `SEQUENCE:${m.sequence}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    ...(onlyDate ? [`RECURRENCE-ID;TZID=${TZID}:${local(onlyDate, m.startTime)}`] : []),
    `DTSTART;TZID=${TZID}:${local(date, m.startTime)}`,
    `DTEND;TZID=${TZID}:${local(date, m.endTime)}`,
    ...(m.weekly && m.until && !onlyDate
      ? [
          `RRULE:FREQ=WEEKLY;BYDAY=${weekday};UNTIL=${utcStamp(pacificToUtc(m.until, "23:59:59"))}`,
          ...(m.cancelledDates.length && method === "REQUEST"
            ? [`EXDATE;TZID=${TZID}:${m.cancelledDates.map((d) => local(d, m.startTime)).join(",")}`]
            : []),
        ]
      : []),
    `SUMMARY:${text(m.title)}`,
    ...(m.location ? [`LOCATION:${text(m.location)}`] : []),
    `DESCRIPTION:${text(description)}`,
    `ORGANIZER;CN=${param(organizer.name)}:mailto:${organizer.email}`,
    ...attendees.map(
      (a) => `ATTENDEE;CN=${param(a.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${a.email}`,
    ),
    `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
