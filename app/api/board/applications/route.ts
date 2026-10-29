import { bad, guard, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";
import { getTeams } from "@/lib/board/settings-server";
import { checkConfig } from "@/lib/apply/rules";
import { closedReason, configId, getConfig, listApplications, listNotify, saveConfig } from "@/lib/apply/server";

// The hub's Applications tab (admins only; members get a 404 like any
// admin route). GET loads the chapter's settings, applications and "email me
// when they open" list; PUT saves the settings. Logged.

export async function GET(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const config = await getConfig(user.chapter);
  return Response.json(
    {
      config,
      closedReason: closedReason(config),
      applications: await listApplications(user.chapter),
      notify: await listNotify(user.chapter),
      teams: ["Executive", ...(await getTeams(user.chapter))],
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PUT(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const checked = checkConfig(await readJson(request));
  if (!checked.ok) return bad(checked.error);
  const c = checked.value;
  await db().begin(async (tx) => {
    const old = await configId(tx, user.chapter);
    const before = old ? await snapshot(tx, "board_settings", user.chapter, old) : null;
    const id = await saveConfig(tx, user.chapter, c);
    const after = await snapshot(tx, "board_settings", user.chapter, id);
    const was = (before?.value as { open?: boolean } | undefined)?.open ?? false;
    const summary = c.open !== was ? (c.open ? "Opened board applications" : "Closed board applications") : "Edited board application settings";
    await logEntry(tx, user, actorOf(request), "update", summary, [{ table: "board_settings", id, before, after }]);
  });
  return Response.json({ ok: true });
}
