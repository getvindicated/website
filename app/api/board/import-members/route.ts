import { bad, guard, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";

const TEAMS = ["Executive", "Data", "Software", "Research & Legal", "Outreach"];

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
  const res = await importMembers(request);
  if (!res.ok) console.warn(`[board] Member import rejected (${res.status}).`);
  return res;
}

async function importMembers(request: Request): Promise<Response> {

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
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM board_members`;
  if (n > 0 && body?.replace !== true) {
    return bad("Members are already loaded. Replacing them would undo any edits made on the Board tab.", 409);
  }

  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM board_members`;
      for (const [i, r] of rows.entries()) {
        await tx`INSERT INTO board_members (name, first_name, role, team, also_team, tier, is_lead, email, phone, sort)
          VALUES (${r.name}, ${r.name.split(/\s+/)[0]}, ${r.role}, ${r.team}, ${r.alsoTeam}, ${r.tier}, ${r.lead}, ${r.email}, ${r.phone}, ${i})`;
      }
    });
  } catch (e) {
    console.error("[board] Member import failed:", e);
    return bad("The members couldn't be saved. Try again; if it keeps happening, tell Claude.", 500);
  }
  console.log(`[board] Imported ${rows.length} members.`);
  return Response.json({ ok: true, count: rows.length });
}
