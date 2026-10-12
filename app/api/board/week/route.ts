import { bad, guard, isDate, readJson } from "@/lib/board/api";
import { chapterConfig } from "@/lib/board/chapters";
import { db } from "@/lib/board/db";
import { actorOf, logRows, snapshotWhere } from "@/lib/board/changelog";

// Weekly deliverables (UCLA): admins change the current week's due date,
// or start a new week.

async function weeklyAdmin(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  if (!chapterConfig(user.chapter).weekly) return bad("This chapter doesn't use weeks.", 404);
  return user;
}

export async function PATCH(request: Request) {
  const user = await weeklyAdmin(request);
  if (user instanceof Response) return user;
  const body = await readJson(request);
  const due = body?.dueDate;
  if (!isDate(due)) return bad("Choose a due date.");
  const sql = db();
  await sql.begin(async (tx) => {
    const [cur] = await tx`SELECT id, round FROM board_rounds WHERE chapter = ${user.chapter} AND is_current`;
    if (!cur) return;
    const taskIds = (await tx`SELECT id FROM board_assignments WHERE chapter = ${user.chapter} AND round = ${cur.round}`).map((r) => r.id as number);
    const rounds = await snapshotWhere(tx, "board_rounds", user.chapter, [cur.id]);
    const tasks = await snapshotWhere(tx, "board_assignments", user.chapter, taskIds);
    await tx`UPDATE board_rounds SET due_date = ${due} WHERE id = ${cur.id}`;
    await tx`UPDATE board_assignments SET due_date = ${due} WHERE chapter = ${user.chapter} AND round = ${cur.round}`;
    await logRows(tx, user, actorOf(request), `Changed this week's due date to ${due}`, [
      { table: "board_rounds", rows: rounds, ids: [cur.id] },
      { table: "board_assignments", rows: tasks, ids: taskIds },
    ]);
  });
  return Response.json({ ok: true });
}

// Archives the current week and starts the next one, due a week after the
// old due date. Tasks of anyone not marked Submitted or Excused carry over.
export async function POST(request: Request) {
  const user = await weeklyAdmin(request);
  if (user instanceof Response) return user;
  const sql = db();
  const c = user.chapter;
  const next = await sql.begin(async (tx) => {
    const [cur] = await tx`SELECT id, round, due_date FROM board_rounds WHERE chapter = ${c} AND is_current FOR UPDATE`;
    if (!cur) return null;
    const oldRounds = await snapshotWhere(tx, "board_rounds", c, [cur.id]);
    const [{ max }] = await tx`SELECT max(round)::int AS max FROM board_rounds WHERE chapter = ${c}`;
    const round = max + 1;
    const [{ due }] = await tx`SELECT to_char(${cur.due_date}::date + 7, 'YYYY-MM-DD') AS due`;
    await tx`UPDATE board_rounds SET is_current = false WHERE chapter = ${c}`;
    const [added] = await tx`INSERT INTO board_rounds (chapter, round, due_date, is_current, note)
      VALUES (${c}, ${round}, ${due}, true, '') RETURNING id`;
    const carried = await tx`INSERT INTO board_assignments (chapter, round, person, person_role, task, proof_required, due_date, status, sort)
      SELECT chapter, ${round}, person, person_role, task, proof_required, ${due}, 'pending', sort
      FROM board_assignments
      WHERE chapter = ${c} AND round = ${cur.round}
        AND person NOT IN (
          SELECT person FROM board_assignments
          WHERE chapter = ${c} AND round = ${cur.round} AND status IN ('submitted', 'done', 'excused')
        )
      ORDER BY sort, id
      RETURNING id`;
    await logRows(tx, user, actorOf(request), `Started a new week, due ${due}, carrying over ${carried.length} tasks`, [
      { table: "board_rounds", rows: oldRounds, ids: [cur.id, added.id] },
      { table: "board_assignments", rows: new Map(), ids: carried.map((r) => r.id as number) },
    ]);
    return { round, due };
  });
  return next ? Response.json({ ok: true, ...next }, { status: 201 }) : bad("There's no current week to archive.");
}
