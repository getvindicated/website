import "server-only";
import { db } from "./db";
import { ensureSetup } from "./setup";
import { CHAPTER_SERVER, recipientNames } from "./chapter-server";
import { listScheduled } from "./schedule-server";
import { getSettings } from "./settings-server";
import { listLog } from "./changelog";
import { sendSummaries } from "./announce";
import type { BoardUser } from "./session";
import { UNASSIGNED } from "./static";
import type { BoardData } from "./types";

// Everything one chapter's hub shows, for the signed-in user. Members never
// receive tasks with no owner yet or admins-only announcements.
export async function loadBoard(user: BoardUser): Promise<BoardData> {
  await ensureSetup();
  const sql = db();
  const c = user.chapter;
  const admin = user.role === "admin";
  const [settings, changelog, sends, scheduled, rounds, members, assignments, submissions, socials, announcements, meetings] = await Promise.all([
    getSettings(c),
    admin ? listLog(c) : Promise.resolve([]),
    admin ? sendSummaries(c) : Promise.resolve([]),
    listScheduled(c),
    sql`SELECT id, round, due_date AS "dueDate", is_current AS "isCurrent", show_status AS "showStatus", note
        FROM board_rounds WHERE chapter = ${c} ORDER BY round DESC`,
    sql`SELECT id, name, first_name AS "firstName", role, team, also_team AS "alsoTeam", tier,
          is_lead AS "isLead", email, phone, is_hub_admin AS "hubAdmin"
        FROM board_members WHERE chapter = ${c} ORDER BY sort, id`,
    sql`SELECT id, round, person, person_role AS "personRole", task, proof_required AS proof,
          due_date AS "dueDate", status, status_note AS "statusNote"
        FROM board_assignments WHERE chapter = ${c} ${admin ? sql`` : sql`AND person <> ${UNASSIGNED}`}
        ORDER BY round DESC, sort, id`,
    sql`SELECT id, person, assignment_id AS "assignmentId", task_label AS "taskLabel", filenames,
          created_at AS "createdAt"
        FROM board_submissions WHERE chapter = ${c} ORDER BY created_at`,
    sql`SELECT id, date, time, title, location, kind, lead, status, cost, note
        FROM board_socials WHERE chapter = ${c} ORDER BY date, id`,
    sql`SELECT id, title, body, posted_on AS "postedOn", link_tab AS "linkTab", link_label AS "linkLabel",
          admins_only AS "adminsOnly"
        FROM board_announcements WHERE chapter = ${c} ${admin ? sql`` : sql`AND NOT admins_only`}
        ORDER BY sort, posted_on DESC, id DESC`,
    sql`SELECT id, date, title, summary, absent, recording_url AS "recordingUrl"
        FROM board_meetings WHERE chapter = ${c} ORDER BY date DESC, id DESC`,
  ]);
  const plain = <T,>(rows: unknown) => JSON.parse(JSON.stringify(rows)) as T;
  return {
    settings,
    changelog,
    sends,
    rounds: plain(rounds),
    scheduled,
    organizerEmail: admin ? CHAPTER_SERVER[c].organizer.email : null,
    recipients: recipientNames(c),
    members: plain(members),
    assignments: plain(assignments),
    submissions: plain(submissions),
    socials: plain(socials),
    announcements: plain(announcements),
    meetings: plain(meetings),
  };
}
