import "server-only";
import type postgres from "postgres";
import { db } from "./db";
import type { ChapterId } from "./chapters";
import { CHAPTER_IDS } from "./chapters";
import { SETTING_KEYS, defaultSettings, type SettingKey, type Settings } from "./settings";

type Sql = ReturnType<typeof db> | postgres.TransactionSql;

// Adds any missing setting for each chapter from its defaults. Run once at
// startup; existing values are never touched.
export async function seedSettings(sql: Sql) {
  for (const chapter of CHAPTER_IDS) {
    const defaults = defaultSettings(chapter);
    for (const key of SETTING_KEYS) {
      await sql`INSERT INTO board_settings (chapter, key, value)
        VALUES (${chapter}, ${key}, ${sql.json(defaults[key] as never)})
        ON CONFLICT (chapter, key) DO NOTHING`;
    }
  }
}

export async function getSettings(chapter: ChapterId, sql: Sql = db()): Promise<Settings> {
  const rows = await sql`SELECT key, value FROM board_settings WHERE chapter = ${chapter}`;
  const out = defaultSettings(chapter) as Record<string, unknown>;
  for (const r of rows) if ((SETTING_KEYS as string[]).includes(r.key)) out[r.key] = r.value;
  return out as Settings;
}

export async function getTeams(chapter: ChapterId, sql: Sql = db()): Promise<string[]> {
  return (await getSettings(chapter, sql)).teams;
}

// Saves one setting and returns its row id (for the change log).
export async function saveSetting(sql: Sql, chapter: ChapterId, key: SettingKey, value: unknown): Promise<number> {
  const [r] = await sql`INSERT INTO board_settings (chapter, key, value) VALUES (${chapter}, ${key}, ${sql.json(value as never)})
    ON CONFLICT (chapter, key) DO UPDATE SET value = EXCLUDED.value RETURNING id`;
  return r.id as number;
}

export async function settingId(sql: Sql, chapter: ChapterId, key: SettingKey): Promise<number | null> {
  const [r] = await sql`SELECT id FROM board_settings WHERE chapter = ${chapter} AND key = ${key}`;
  return r ? (r.id as number) : null;
}
