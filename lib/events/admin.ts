import "server-only";
import { db } from "@/lib/board/db";
import { isDate } from "@/lib/board/api";

// Checks an event sent by the hub's Events form (admins). Returns the
// database columns, or an error to show.

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export type EventColumns = {
  title: string;
  tag: string;
  date: string;
  start_time: string;
  end_time: string;
  online: boolean;
  meeting_link: string;
  address: string;
  host_name: string;
  host_title: string;
  description: string;
  flyer_id: number | null;
  show_count: boolean;
};

export async function parseEvent(body: Record<string, unknown>, chapter: string): Promise<EventColumns | { error: string }> {
  const s = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const title = s("title");
  const tag = s("tag");
  const date = s("date");
  const start = s("startTime");
  const end = s("endTime");
  const online = body.online !== false;
  const link = s("meetingLink");
  const address = s("address");
  if (!title) return { error: "Add a title." };
  if (title.length > 200) return { error: "Make the title shorter." };
  if (tag.length > 80) return { error: "Make the tag shorter." };
  if (!isDate(date)) return { error: "Pick the date." };
  if (!TIME.test(start) || !TIME.test(end)) return { error: "Add a start and end time." };
  if (end <= start) return { error: "The end time has to be after the start time." };
  if (online && link && (!/^https?:\/\/\S+$/i.test(link) || link.length > 500)) {
    return { error: "The meeting link should start with https://" };
  }
  if (!online && !address) return { error: "Add the address, or switch it to online." };
  if (address.length > 300) return { error: "Make the address shorter." };
  if (s("hostName").length > 100 || s("hostTitle").length > 200) return { error: "Make the host's name or title shorter." };
  if (s("description").length > 2000) return { error: "Make the description shorter." };

  let flyer: number | null = null;
  if (body.flyerId !== null && body.flyerId !== undefined && body.flyerId !== "") {
    const n = Number(body.flyerId);
    if (!Number.isInteger(n) || n <= 0) return { error: "Upload the flyer again." };
    const [p] = await db()`SELECT 1 FROM board_photos WHERE id = ${n} AND chapter = ${chapter}`;
    if (!p) return { error: "Upload the flyer again." };
    flyer = n;
  }
  return {
    title,
    tag,
    date,
    start_time: start,
    end_time: end,
    online,
    meeting_link: online ? link : "",
    address: online ? "" : address,
    host_name: s("hostName"),
    host_title: s("hostTitle"),
    description: s("description"),
    flyer_id: flyer,
    show_count: body.showCount === true,
  };
}

// CSV of an event's RSVPs. Cells that a spreadsheet would run as a formula
// get a leading apostrophe.
export function rsvpCsv(rows: { name: string; email: string; school: string; question: string; optIn: boolean; at: string }[]) {
  const cell = (v: string) => {
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const when = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(iso));
  const lines = [
    ["Name", "Email", "School or affiliation", "Question for the host", "Email about future events", "RSVP time (Pacific)"],
    ...rows.map((r) => [r.name, r.email, r.school, r.question, r.optIn ? "Yes" : "No", when(r.at)]),
  ];
  // BOM so Excel reads it as UTF-8.
  return "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n") + "\r\n";
}
