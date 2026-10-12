import "server-only";
import { TABLES, oneOf, type TableDef } from "./tables";
import type { BoardRole } from "./roles";

// Which roles may change each table through /api/board/[table]. UCLA has no
// socials role, so only its admins edit events.
const EDITORS: Record<keyof typeof TABLES, BoardRole[]> = {
  socials: ["admin", "socials"],
  assignments: ["admin"],
  announcements: ["admin"],
  meetings: ["admin"],
  members: ["admin"],
  rounds: ["admin"],
};

// What a row is called in the change log.
export const LABELS: Record<keyof typeof TABLES, string> = {
  socials: "event",
  assignments: "task",
  announcements: "announcement",
  meetings: "meeting",
  members: "member",
  rounds: "week",
};
export function describe(name: keyof typeof TABLES, row: Record<string, unknown> | null): string {
  if (!row) return LABELS[name];
  const v = row.title ?? row.name ?? row.task ?? (row.round !== undefined ? `round ${row.round}` : row.date);
  const s = typeof v === "string" || typeof v === "number" ? String(v) : "";
  return `${LABELS[name]} "${s.length > 60 ? `${s.slice(0, 58)}…` : s}"`;
}

export function editable(name: string, teams: string[]): { def: TableDef; roles: BoardRole[]; name: keyof typeof TABLES } | null {
  if (!Object.hasOwn(TABLES, name)) return null;
  const key = name as keyof typeof TABLES;
  let def: TableDef = TABLES[key];
  if (key === "members") {
    const all = ["Executive", ...teams];
    def = { ...def, fields: { ...def.fields, team: { column: "team", check: oneOf(all, "a team") } } };
  }
  return { def, roles: EDITORS[key], name: key };
}
// Members store a first name for matching assignments and submissions.
export function derived(name: string, body: Record<string, unknown>): Record<string, unknown> {
  if (name === "members" && typeof body.name === "string" && body.name.trim()) {
    return { first_name: body.name.trim().split(/\s+/)[0] };
  }
  return {};
}
