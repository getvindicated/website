import "server-only";
import { TABLES, oneOf, type TableDef } from "./tables";
import type { BoardRole } from "./roles";
import { chapterConfig, type ChapterId } from "./chapters";

// Which roles may change each table through /api/board/[table]. UCLA has no
// socials role, so only its admins edit events.
const EDITORS: Record<keyof typeof TABLES, BoardRole[]> = {
  socials: ["admin", "socials"],
  assignments: ["admin"],
  announcements: ["admin"],
  meetings: ["admin"],
  members: ["admin"],
};

export function editable(name: string, chapter: ChapterId): { def: TableDef; roles: BoardRole[]; name: keyof typeof TABLES } | null {
  if (!Object.hasOwn(TABLES, name)) return null;
  const key = name as keyof typeof TABLES;
  let def: TableDef = TABLES[key];
  if (key === "members") {
    const teams = ["Executive", ...chapterConfig(chapter).teams];
    def = { ...def, fields: { ...def.fields, team: { column: "team", check: oneOf(teams, "a team") } } };
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
