import { bad, guard, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import type { ChapterId } from "@/lib/board/chapters";
import { CHAPTER_SERVER } from "@/lib/board/chapter-server";
import { getTeams } from "@/lib/board/settings-server";
import { actorOf, logEntry, snapshotWhere, type Change } from "@/lib/board/changelog";
import type { BoardUser } from "@/lib/board/session";

type Row = {
  name: string;
  role: string;
  team: string;
  alsoTeam: string | null;
  tier: number | null;
  lead: boolean;
  email: string;
  phone: string;
};

// Loads the member list from the board-members.local.json file (the same
// format scripts/board-seed.mjs reads). Admin only. Refuses to run when
// members already exist unless `replace` is true.
export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) {
    console.warn(`[board] Member import refused (${user.status}).`);
    return user;
  }
  const res = await importMembers(request, user);
  if (!res.ok) console.warn(`[board] Member import (${user.chapter}) rejected (${res.status}).`);
  return res;
}

async function importMembers(request: Request, user: BoardUser): Promise<Response> {
  const chapter: ChapterId = user.chapter;
  const TEAMS = ["Executive", ...(await getTeams(chapter))];
  const body = await readJson(request);
  const list = body?.members;
  if (!Array.isArray(list) || list.length === 0) return bad("That file doesn't have a member list in it.");
  if (list.length > 200) return bad("That's more than 200 members. Check the file.");

  const rows: Row[] = [];
  for (const [i, m] of list.entries()) {
    const at = `Member ${i + 1}`;
    if (!m || typeof m !== "object") return bad(`${at} isn't in the right format.`);
    const str = (k: string, max: number) => (typeof m[k] === "string" ? m[k].trim().slice(0, max) : "");
    const name = str("name", 200);
    const team = str("team", 100);
    if (!name) return bad(`${at} has no name.`);
    if (!TEAMS.includes(team)) return bad(`${name} has an unknown team: "${team}".`);
    const also = str("alsoTeam", 100);
    rows.push({
      name,
      role: str("role", 200),
      team,
      alsoTeam: also && TEAMS.includes(also) ? also : null,
      tier: m.tier === 0 || m.tier === 1 ? m.tier : null,
      lead: m.lead === true,
      email: str("email", 200),
      phone: str("phone", 50),
    });
  }

  const sql = db();
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM board_members WHERE chapter = ${chapter}`;
  if (n > 0 && body?.replace !== true) {
    return bad("Members are already loaded. Replacing them would undo any edits made on the Board tab.", 409);
  }

  try {
    await sql.begin(async (tx) => {
      // Hub admins stay ticked across a re-import; the starting ones are ticked.
      const old = await tx`SELECT id, name, is_hub_admin FROM board_members WHERE chapter = ${chapter}`;
      const before = await snapshotWhere(tx, "board_members", chapter, old.map((r) => r.id));
      const admins = new Set([...CHAPTER_SERVER[chapter].hubAdmins, ...old.filter((r) => r.is_hub_admin).map((r) => r.name)]);
      await tx`DELETE FROM board_members WHERE chapter = ${chapter}`;
      const ids: number[] = [];
      for (const [i, r] of rows.entries()) {
        const [row] = await tx`INSERT INTO board_members (chapter, name, first_name, role, team, also_team, tier, is_lead, email, phone, sort, is_hub_admin)
          VALUES (${chapter}, ${r.name}, ${r.name.split(/\s+/)[0]}, ${r.role}, ${r.team}, ${r.alsoTeam}, ${r.tier}, ${r.lead}, ${r.email}, ${r.phone}, ${i}, ${admins.has(r.name)})
          RETURNING id`;
        ids.push(row.id);
      }
      const after = await snapshotWhere(tx, "board_members", chapter, ids);
      const changes: Change[] = [
        ...[...before.values()].map((b) => ({ table: "board_members", id: b.id as number, before: b, after: null })),
        ...[...after.values()].map((a) => ({ table: "board_members", id: a.id as number, before: null, after: a })),
      ];
      await logEntry(tx, user, actorOf(request), "bulk", `Imported ${rows.length} members${old.length ? `, replacing ${old.length}` : ""}`, changes);
    });
  } catch (e) {
    console.error("[board] Member import failed:", e);
    return bad("The members couldn't be saved. Try again; if it keeps happening, tell Claude.", 500);
  }
  console.log(`[board] Imported ${rows.length} ${chapter} members.`);
  return Response.json({ ok: true, count: rows.length });
}
