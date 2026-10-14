// Scheduled board meetings (calendar invites): dates and wording shared by
// the server, which builds the invite emails, and the Meetings tab.

export type Invitee = { name: string; email: string };

export type ScheduledMeeting = {
  id: number;
  uid: string;
  sequence: number;
  title: string;
  date: string; // first meeting, YYYY-MM-DD (Pacific time)
  startTime: string; // HH:MM, 24-hour
  endTime: string;
  location: string;
  notes: string;
  weekly: boolean;
  until: string | null; // last possible date of a weekly series
  invitees: Invitee[];
  audience: string; // "Whole board", "Data team", "5 people"
  cancelledDates: string[];
  // Invites that have gone through; 0 means none ever did.
  invitesSent: number;
};

const toDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const toIso = (d: Date) => d.toISOString().slice(0, 10);

export const addDays = (iso: string, n: number) => {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
};

const dayFmt = (iso: string, o: Intl.DateTimeFormatOptions) => toDate(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...o });

// Every date the meeting happens on, skipping cancelled ones.
export function occurrences(m: Pick<ScheduledMeeting, "date" | "weekly" | "until" | "cancelledDates">): string[] {
  if (!m.weekly || !m.until) return m.cancelledDates.includes(m.date) ? [] : [m.date];
  const out: string[] = [];
  for (let d = m.date; d <= m.until && out.length < 60; d = addDays(d, 7)) {
    if (!m.cancelledDates.includes(d)) out.push(d);
  }
  return out;
}

export const upcomingDates = (m: ScheduledMeeting, today: string) => occurrences(m).filter((d) => d >= today);
export const pastDates = (m: ScheduledMeeting, today: string) => occurrences(m).filter((d) => d < today);

// "6:00pm", "6:30pm"; "6–6:30pm" for a range in the same half of the day.
function clock(t: string) {
  const [h, min] = t.split(":").map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return { text: min ? `${h12}:${String(min).padStart(2, "0")}` : String(h12), half: h < 12 ? "am" : "pm" };
}
export function timeRange(start: string, end: string) {
  const a = clock(start);
  const b = clock(end);
  return a.half === b.half ? `${a.text}–${b.text}${b.half}` : `${a.text}${a.half}–${b.text}${b.half}`;
}

export const weekdayName = (iso: string) => dayFmt(iso, { weekday: "long" });
export const shortDate = (iso: string) => dayFmt(iso, { weekday: "short", month: "short", day: "numeric" });
export const longDate = (iso: string) => dayFmt(iso, { weekday: "long", month: "short", day: "numeric" });
export const monthDay = (iso: string) => dayFmt(iso, { month: "short", day: "numeric" });

// "Sundays 6–6:30pm" or "Sun, Oct 18 · 6–6:30pm".
export function whenShort(m: Pick<ScheduledMeeting, "date" | "weekly" | "startTime" | "endTime">) {
  const t = timeRange(m.startTime, m.endTime);
  return m.weekly ? `${weekdayName(m.date)}s ${t}` : `${shortDate(m.date)} · ${t}`;
}

// "Weekly on Sunday, until Nov 22".
export const repeatText = (m: Pick<ScheduledMeeting, "date" | "weekly" | "until">) =>
  m.weekly && m.until ? `Weekly on ${weekdayName(m.date)}, until ${monthDay(m.until)}` : "";
