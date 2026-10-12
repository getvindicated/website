import { bad, guard, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logRows, snapshotWhere } from "@/lib/board/changelog";
import { checkSetting } from "@/lib/board/settings";
import { getTeams, saveSetting, settingId } from "@/lib/board/settings-server";

// Adds, renames or removes a team (admins only). Renaming moves its members
// with it; removing a team that has members needs `moveTo`, the team they
// go to. One change log entry covers the team list and every member moved.
export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  const action = body?.action;
  const team = typeof body?.team === "string" ? body.team.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const moveTo = typeof body?.moveTo === "string" ? body.moveTo.trim() : "";
  const c = user.chapter;

  const result = await db().begin(async (tx) => {
    const teams = await getTeams(c, tx);
    let next: string[];
    let summary: string;
    if (action === "add") {
      next = [...teams, name];
      summary = `Added the ${name} team`;
    } else if (action === "rename") {
      if (!teams.includes(team)) return "That team doesn't exist.";
      next = teams.map((t) => (t === team ? name : t));
      summary = `Renamed the ${team} team to ${name}`;
    } else if (action === "remove") {
      if (!teams.includes(team)) return "That team doesn't exist.";
      next = teams.filter((t) => t !== team);
      summary = `Removed the ${team} team`;
    } else return "Check the form.";
    const checked = checkSetting("teams", next);
    if (!checked.ok) return checked.error;

    // Members on (or also leading) the team.
    const affected = await tx`SELECT id, team, also_team FROM board_members
      WHERE chapter = ${c} AND (team = ${team} OR also_team = ${team})`;
    const onTeam = affected.filter((m) => m.team === team);
    if (action === "remove" && onTeam.length) {
      if (!moveTo || moveTo === team || !["Executive", ...next].includes(moveTo)) {
        return `${onTeam.length} ${onTeam.length === 1 ? "person is" : "people are"} on ${team}. Choose the team to move them to first.`;
      }
      summary += `, moving ${onTeam.length} to ${moveTo}`;
    }
    const memberIds = action === "add" ? [] : affected.map((m) => m.id as number);
    const members = await snapshotWhere(tx, "board_members", c, memberIds);
    const settingRow = await settingId(tx, c, "teams");
    const settingBefore = settingRow ? await snapshotWhere(tx, "board_settings", c, [settingRow]) : new Map();

    const id = await saveSetting(tx, c, "teams", checked.value);
    if (action === "rename") {
      await tx`UPDATE board_members SET team = ${name} WHERE chapter = ${c} AND team = ${team}`;
      await tx`UPDATE board_members SET also_team = ${name} WHERE chapter = ${c} AND also_team = ${team}`;
    } else if (action === "remove") {
      if (onTeam.length) await tx`UPDATE board_members SET team = ${moveTo} WHERE chapter = ${c} AND team = ${team}`;
      await tx`UPDATE board_members SET also_team = NULL WHERE chapter = ${c} AND also_team = ${team}`;
    }
    await logRows(tx, user, actorOf(request), summary, [
      { table: "board_settings", rows: settingBefore, ids: [id] },
      { table: "board_members", rows: members, ids: memberIds },
    ]);
    return null;
  });
  return result ? bad(result) : Response.json({ ok: true });
}
