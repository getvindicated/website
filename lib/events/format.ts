// Date and time labels for events, in the page's language and always in
// Pacific time (where the events happen). Works on the server and in the
// browser.

const TZ = "America/Los_Angeles";

type Times = { startsAt: string; endsAt: string };

export type EventLabels = {
  dateLabel: string; // "Thursday, November 19"
  timeLabel: string; // "6:00 – 7:00 PM"
  month: string; // "Nov"
  day: string; // "19"
  short: string; // "Thursday, 6 PM"
};

const lang = (locale: string) => (locale === "zh-Hans" ? "zh-Hans-CN" : locale);

export function eventLabels(e: Times, locale: string): EventLabels {
  const start = new Date(e.startsAt);
  const end = new Date(e.endsAt);
  const l = lang(locale);
  const sameYear =
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric" }).format(start) ===
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric" }).format(new Date());
  const date = new Intl.DateTimeFormat(l, {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const time = new Intl.DateTimeFormat(l, { timeZone: TZ, hour: "numeric", minute: "2-digit" });
  const onTheHour = start.getUTCMinutes() === 0;
  return {
    dateLabel: date.format(start),
    timeLabel: time.formatRange(start, end),
    month: new Intl.DateTimeFormat(l, { timeZone: TZ, month: "short" }).format(start),
    day: new Intl.DateTimeFormat(l, { timeZone: TZ, day: "numeric" }).format(start),
    short: `${new Intl.DateTimeFormat(l, { timeZone: TZ, weekday: "long" }).format(start)}, ${new Intl.DateTimeFormat(l, {
      timeZone: TZ,
      hour: "numeric",
      ...(onTheHour ? {} : { minute: "2-digit" }),
    }).format(start)}`,
  };
}

// Google Calendar's "add event" link. The meeting link isn't public, so the
// details point people to their confirmation email for it.
export function googleCalendarUrl(e: Times & { title: string; description: string; online: boolean; address: string }, where: string, note: string, page: string) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.startsAt)}/${stamp(e.endsAt)}`,
    details: [e.description, e.online ? note : "", page].filter(Boolean).join("\n\n"),
    location: e.online ? where : e.address,
    ctz: TZ,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}
