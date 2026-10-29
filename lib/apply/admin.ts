import "server-only";
import { STATUSES, STATUS_LABELS, YEAR_LABELS, type AdminApplication, type Status, type Year } from "./rules";

// Hub-side helpers for board applications: the list filters (shared by the
// tab and "Download CSV") and the CSV itself. No resumes or reviewer notes
// in the CSV.

export type Filter = { status: Status | ""; position: string };

export function readFilter(url: URL): Filter {
  const s = url.searchParams.get("status") ?? "";
  return { status: (STATUSES as readonly string[]).includes(s) ? (s as Status) : "", position: (url.searchParams.get("position") ?? "").slice(0, 80) };
}

export const matches = (a: AdminApplication, f: Filter) => (!f.status || a.status === f.status) && (!f.position || a.positions.includes(f.position));

export function applicationsCsv(rows: AdminApplication[]) {
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
    ["Name", "Email", "Phone", "Positions", "Year", "Major", "Hours per week", "Why join the board", "What they'd bring", "LinkedIn / portfolio", "Heard about us", "Status", "Term", "Submitted (Pacific)", "Last updated (Pacific)"],
    ...rows.map((a) => [
      a.name,
      a.email,
      a.phone,
      a.positions.join("; "),
      YEAR_LABELS[a.year as Year] ?? a.year,
      a.major,
      String(a.hours),
      a.why,
      a.bring,
      a.link,
      a.heard,
      STATUS_LABELS[a.status] ?? a.status,
      a.term,
      when(a.createdAt),
      when(a.updatedAt),
    ]),
  ];
  // BOM so Excel reads it as UTF-8.
  return "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n") + "\r\n";
}
