import { bad, guard, readJson } from "@/lib/board/api";
import { chapterConfig } from "@/lib/board/chapters";
import { db } from "@/lib/board/db";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";
import { SETTING_KEYS, SETTING_LABELS, checkSetting, type SettingKey } from "@/lib/board/settings";
import { saveSetting, settingId } from "@/lib/board/settings-server";

// Saves one piece of chapter content (admins only) and logs it. Teams have
// their own route, because renaming or removing one moves members.
export async function PUT(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  const key = body?.key as SettingKey;
  if (!SETTING_KEYS.includes(key) || key === "teams") return bad("Check the form.");
  if (key === "rule" && chapterConfig(user.chapter).rule === null) return bad("This chapter has no rule text.");
  const checked = checkSetting(key, body?.value);
  if (!checked.ok) return bad(checked.error);
  await db().begin(async (tx) => {
    const oldId = await settingId(tx, user.chapter, key);
    const before = oldId ? await snapshot(tx, "board_settings", user.chapter, oldId) : null;
    const id = await saveSetting(tx, user.chapter, key, checked.value);
    const after = await snapshot(tx, "board_settings", user.chapter, id);
    await logEntry(tx, user, actorOf(request), "update", `Edited ${SETTING_LABELS[key].toLowerCase()}`, [{ table: "board_settings", id, before, after }]);
  });
  return Response.json({ ok: true });
}
