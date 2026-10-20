import "server-only";
import type postgres from "postgres";
import { db } from "./db";
import type { BoardUser } from "./session";
import type { LogEntry } from "./types";

// The admin change log. Every admin write records each row it touched as it
// was before and after, so "Restore previous version" can put it back.
// Entries are per chapter and only that chapter's admins can see them.

type Sql = postgres.Sql | postgres.TransactionSql;
type Row = Record<string, unknown>;
export type Change = { table: string; id: number; before: Row | null; after: Row | null };

// Tables whose rows can be logged and restored.
const RESTORABLE = new Set([
  "board_members",
  "board_assignments",
  "board_socials",
  "board_announcements",
  "board_meetings",
  "board_rounds",
  "board_settings",
  "board_events",
]);

const plain = (r: unknown) => JSON.parse(JSON.stringify(r)) as Row;

export async function snapshot(sql: Sql, table: string, chapter: string, id: number): Promise<Row | null> {
  if (!RESTORABLE.has(table)) throw new Error(`Not a logged table: ${table}`);
  const [row] = await sql`SELECT * FROM ${sql(table)} WHERE id = ${id} AND chapter = ${chapter}`;
  return row ? plain(row) : null;
}

// Snapshots of many rows at once (bulk actions).
export async function snapshotWhere(sql: Sql, table: string, chapter: string, ids: number[]): Promise<Map<number, Row>> {
  if (!RESTORABLE.has(table)) throw new Error(`Not a logged table: ${table}`);
  if (!ids.length) return new Map();
  const rows = await sql`SELECT * FROM ${sql(table)} WHERE chapter = ${chapter} AND id IN ${sql(ids)}`;
  return new Map(rows.map((r) => [r.id as number, plain(r)]));
}

// The name an admin typed in (sent with each request), if any. Self-reported.
export function actorOf(request: Request): string {
  const raw = request.headers.get("x-board-actor") ?? "";
  try {
    return decodeURIComponent(raw).replace(/[\r\n]/g, " ").trim().slice(0, 60);
  } catch {
    return "";
  }
}

export async function logEntry(
  sql: Sql,
  user: BoardUser,
  actor: string,
  action: "create" | "update" | "delete" | "bulk" | "restore" | "note",
  summary: string,
  changes: Change[],
) {
  // Drop changes that didn't change anything.
  const real = changes.filter((c) => JSON.stringify(c.before) !== JSON.stringify(c.after));
  if (action !== "note" && real.length === 0) return null;
  const [r] = await sql`INSERT INTO board_changelog (chapter, role, actor, action, summary, changes)
    VALUES (${user.chapter}, ${user.role}, ${actor}, ${action}, ${summary.slice(0, 300)}, ${sql.json(real as never)})
    RETURNING id`;
  return r.id as number;
}

// Puts a row back the way it was: deletes it, updates it, or re-creates it
// with its old id.
async function put(tx: Sql, table: string, chapter: string, id: number, row: Row | null) {
  if (!row) {
    await tx`DELETE FROM ${tx(table)} WHERE id = ${id} AND chapter = ${chapter}`;
    return;
  }
  const values: Row = { ...row };
  if (table === "board_settings") values.value = tx.json(row.value as never);
  const [exists] = await tx`SELECT 1 FROM ${tx(table)} WHERE id = ${id} AND chapter = ${chapter}`;
  if (exists) {
    const { id: _id, ...rest } = values;
    void _id;
    await tx`UPDATE ${tx(table)} SET ${tx(rest)} WHERE id = ${id} AND chapter = ${chapter}`;
  } else {
    await tx`INSERT INTO ${tx(table)} ${tx(values)}`;
  }
}

// Restores what an entry changed to how it was before, as a new entry.
export async function restoreEntry(user: BoardUser, actor: string, entryId: number): Promise<{ error: string } | { id: number | null }> {
  const sql = db();
  return sql.begin(async (tx) => {
    const [entry] = await tx`SELECT id, summary, changes FROM board_changelog WHERE id = ${entryId} AND chapter = ${user.chapter}`;
    if (!entry) return { error: "That change isn't in this chapter's log." };
    const changes = entry.changes as Change[];
    if (!changes.length) return { error: "This change can't be restored." };
    const undone: Change[] = [];
    for (const c of [...changes].reverse()) {
      if (!RESTORABLE.has(c.table)) continue;
      const now = await snapshot(tx, c.table, user.chapter, c.id);
      await put(tx, c.table, user.chapter, c.id, c.before);
      const after = await snapshot(tx, c.table, user.chapter, c.id);
      undone.push({ table: c.table, id: c.id, before: now, after });
    }
    // Keep serial ids ahead of rows re-created with their old ids.
    for (const t of new Set(changes.map((c) => c.table))) {
      await tx`SELECT setval(pg_get_serial_sequence(${t}, 'id'), GREATEST((SELECT max(id) FROM ${tx(t)}), 1))`;
    }
    const id = await logEntry(tx, user, actor, "restore", `Restored: ${entry.summary}`, undone);
    return { id };
  });
}



const show = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v));

export async function listLog(chapter: string, limit = 200): Promise<LogEntry[]> {
  const sql = db();
  const rows = await sql`SELECT id, at, role, actor, action, summary, changes FROM board_changelog
    WHERE chapter = ${chapter} ORDER BY id DESC LIMIT ${limit}`;
  return rows.map((r) => {
    const changes = r.changes as Change[];
    return {
      id: r.id,
      at: new Date(r.at).toISOString(),
      role: r.role,
      actor: r.actor,
      action: r.action,
      summary: r.summary,
      touches: changes.map((c) => `${c.table}:${c.id}`),
      restorable: changes.length > 0,
      diffs: changes.slice(0, 30).map((c) => {
        const kind = !c.before ? "added" : !c.after ? "removed" : "changed";
        const keys = new Set([...Object.keys(c.before ?? {}), ...Object.keys(c.after ?? {})]);
        const fields = [...keys]
          .filter((k) => !["id", "chapter", "sort"].includes(k) && show(c.before?.[k]) !== show(c.after?.[k]))
          .map((k) => ({ name: k, before: show(c.before?.[k]).slice(0, 300), after: show(c.after?.[k]).slice(0, 300) }));
        return { table: c.table, id: c.id, kind, fields: kind === "changed" ? fields : [] };
      }),
    };
  });
}

// Logs a bulk change to rows of several tables: pass each table's ids with
// their snapshots from before; rows are re-read for "after".
export async function logRows(
  sql: Sql,
  user: BoardUser,
  actor: string,
  summary: string,
  before: { table: string; rows: Map<number, Row>; ids: number[] }[],
) {
  const changes: Change[] = [];
  for (const b of before) {
    const after = await snapshotWhere(sql, b.table, user.chapter, b.ids);
    for (const id of b.ids) changes.push({ table: b.table, id, before: b.rows.get(id) ?? null, after: after.get(id) ?? null });
  }
  return logEntry(sql, user, actor, "bulk", summary, changes);
}
