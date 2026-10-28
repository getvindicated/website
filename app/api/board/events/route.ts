import { randomUUID } from "node:crypto";
import { bad, guard, readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry, snapshot } from "@/lib/board/changelog";
import { listAdminEvents } from "@/lib/events/server";
import { parseEvent } from "@/lib/events/admin";

// The hub's Events tab (admins only): this chapter's public events with
// their RSVPs, and creating a new one. Every change goes in the change log.
export async function GET(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  return Response.json({ events: await listAdminEvents(user.chapter) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  if (!body) return bad("Check the form.");
  const cols = await parseEvent(body, user.chapter);
  if ("error" in cols) return bad(cols.error);
  const sql = db();
  const id = await sql.begin(async (tx) => {
    const [row] = await tx`INSERT INTO board_events ${tx({
      ...cols,
      translations: tx.json(cols.translations as never),
      chapter: user.chapter,
      uid: `${user.chapter}-${randomUUID()}@getvindicated.org`,
    })} RETURNING id`;
    const after = await snapshot(tx, "board_events", user.chapter, row.id);
    await logEntry(tx, user, actorOf(request), "create", `Added the event "${cols.title}"`, [
      { table: "board_events", id: row.id, before: null, after },
    ]);
    return row.id as number;
  });
  return Response.json({ ok: true, id }, { status: 201 });
}
