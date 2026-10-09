import "server-only";
import { db } from "./db";
import { TABS } from "./types";

// Editable /board tables: which JSON fields map to which columns, and how
// each value is checked. Used by the create/update/delete API routes.

type Check = (v: unknown) => { ok: true; value: unknown } | { ok: false; error: string };

const text = (max = 2000): Check => (v) =>
  typeof v === "string" && v.trim().length <= max
    ? { ok: true, value: v.trim() }
    : { ok: false, error: "Text is too long." };
const required = (label: string, max = 500): Check => (v) =>
  typeof v === "string" && v.trim() && v.trim().length <= max
    ? { ok: true, value: v.trim() }
    : { ok: false, error: `Add ${label}.` };
const date = (label: string): Check => (v) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))
    ? { ok: true, value: v }
    : { ok: false, error: `Add ${label}.` };
const optionalDate: Check = (v) =>
  v === "" || v === null ? { ok: true, value: null } : date("a valid date")(v);
const oneOf = (values: readonly string[], label: string): Check => (v) =>
  typeof v === "string" && values.includes(v) ? { ok: true, value: v } : { ok: false, error: `Choose ${label}.` };
const url: Check = (v) =>
  typeof v === "string" && (v.trim() === "" || /^https?:\/\/\S+$/.test(v.trim()))
    ? { ok: true, value: v.trim() }
    : { ok: false, error: "Links must start with http:// or https://." };
const int = (min: number, max: number): Check => (v) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max
    ? { ok: true, value: v }
    : { ok: false, error: "Check the numbers." };
const optionalTier: Check = (v) =>
  v === null || v === "" ? { ok: true, value: null } : int(0, 1)(typeof v === "string" ? Number(v) : v);
const bool: Check = (v) => (typeof v === "boolean" ? { ok: true, value: v } : { ok: false, error: "Check the form." });

type Field = { column: string; check: Check; onCreate?: unknown };
export type TableDef = { table: string; fields: Record<string, Field> };

export const TABLES = {
  socials: {
    table: "board_socials",
    fields: {
      title: { column: "title", check: required("a name") },
      date: { column: "date", check: date("a date") },
      time: { column: "time", check: text(100), onCreate: "" },
      location: { column: "location", check: text(300), onCreate: "" },
      kind: { column: "kind", check: oneOf(["b", "x", "o", "org"], "a type"), onCreate: "b" },
      lead: { column: "lead", check: text(200), onCreate: "" },
      status: { column: "status", check: oneOf(["", "Idea", "Planning", "Confirmed", "Completed"], "a status"), onCreate: "Idea" },
      cost: { column: "cost", check: text(300), onCreate: "" },
      note: { column: "note", check: text(), onCreate: "" },
    },
  },
  assignments: {
    table: "board_assignments",
    fields: {
      round: { column: "round", check: int(1, 50) },
      person: { column: "person", check: required("a person", 100) },
      personRole: { column: "person_role", check: text(200), onCreate: "" },
      task: { column: "task", check: required("the task") },
      proof: { column: "proof_required", check: text(500), onCreate: "" },
      dueDate: { column: "due_date", check: optionalDate, onCreate: null },
      status: { column: "status", check: oneOf(["pending", "submitted", "done", "missing"], "a status"), onCreate: "pending" },
      statusNote: { column: "status_note", check: text(300), onCreate: "" },
    },
  },
  announcements: {
    table: "board_announcements",
    fields: {
      title: { column: "title", check: required("a title") },
      body: { column: "body", check: text(4000), onCreate: "" },
      postedOn: { column: "posted_on", check: date("a date") },
      linkTab: { column: "link_tab", check: oneOf(["", ...TABS], "a tab"), onCreate: "" },
      linkLabel: { column: "link_label", check: text(100), onCreate: "" },
    },
  },
  meetings: {
    table: "board_meetings",
    fields: {
      date: { column: "date", check: date("the meeting date") },
      title: { column: "title", check: required("a title", 200), onCreate: "Board meeting" },
      summary: { column: "summary", check: text(4000), onCreate: "" },
      recordingUrl: { column: "recording_url", check: url, onCreate: "" },
    },
  },
  members: {
    table: "board_members",
    fields: {
      name: { column: "name", check: required("a name", 200) },
      role: { column: "role", check: text(200), onCreate: "" },
      team: { column: "team", check: oneOf(["Executive", "Data", "Software", "Research & Legal", "Outreach"], "a team") },
      alsoTeam: { column: "also_team", check: (v) => (v === "" || v === null ? { ok: true, value: null } : text(100)(v)), onCreate: null },
      tier: { column: "tier", check: optionalTier, onCreate: null },
      isLead: { column: "is_lead", check: bool, onCreate: false },
      email: { column: "email", check: text(200), onCreate: "" },
      phone: { column: "phone", check: text(50), onCreate: "" },
    },
  },
} satisfies Record<string, TableDef>;

type Result = { ok: true; id: number } | { ok: false; error: string; status: number };

function collect(
  def: TableDef,
  body: Record<string, unknown>,
  creating: boolean,
): { error: string } | { row: Record<string, unknown> } {
  const row: Record<string, unknown> = {};
  for (const [key, f] of Object.entries(def.fields)) {
    if (key in body) {
      const r = f.check(body[key]);
      if (!r.ok) return { error: r.error };
      row[f.column] = r.value;
    } else if (creating) {
      if (f.onCreate !== undefined) {
        row[f.column] = f.onCreate;
      } else {
        const r = f.check(undefined);
        if (!r.ok) return { error: r.error };
        row[f.column] = r.value;
      }
    }
  }
  return { row };
}

export async function createRow(def: TableDef, body: Record<string, unknown>, extra: Record<string, unknown> = {}): Promise<Result> {
  const c = collect(def, body, true);
  if ("error" in c) return { ok: false, error: c.error, status: 400 };
  const sql = db();
  const [r] = await sql`INSERT INTO ${sql(def.table)} ${sql({ ...c.row, ...extra })} RETURNING id`;
  return { ok: true, id: r.id as number };
}

export async function updateRow(def: TableDef, id: number, body: Record<string, unknown>, extra: Record<string, unknown> = {}): Promise<Result> {
  const c = collect(def, body, false);
  if ("error" in c) return { ok: false, error: c.error, status: 400 };
  const row = { ...c.row, ...extra };
  if (Object.keys(row).length === 0) return { ok: false, error: "Nothing to change.", status: 400 };
  const sql = db();
  const rows = await sql`UPDATE ${sql(def.table)} SET ${sql(row)} WHERE id = ${id} RETURNING id`;
  return rows.length ? { ok: true, id } : { ok: false, error: "Not found", status: 404 };
}

export async function deleteRow(def: TableDef, id: number): Promise<Result> {
  const sql = db();
  const rows = await sql`DELETE FROM ${sql(def.table)} WHERE id = ${id} RETURNING id`;
  return rows.length ? { ok: true, id } : { ok: false, error: "Not found", status: 404 };
}
