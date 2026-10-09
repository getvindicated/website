import "server-only";
import { db } from "./db";
import type { BoardData } from "./types";

export async function loadBoard(): Promise<BoardData> {
  const sql = db();
  const [members, assignments, submissions, socials, announcements, meetings] = await Promise.all([
    sql`SELECT id, name, first_name AS "firstName", role, team, also_team AS "alsoTeam", tier,
          is_lead AS "isLead", email, phone
        FROM board_members ORDER BY sort, id`,
    sql`SELECT id, round, person, person_role AS "personRole", task, proof_required AS proof,
          due_date AS "dueDate", status, status_note AS "statusNote"
        FROM board_assignments ORDER BY round DESC, sort, id`,
    sql`SELECT id, person, assignment_id AS "assignmentId", task_label AS "taskLabel", filenames,
          created_at AS "createdAt"
        FROM board_submissions ORDER BY created_at`,
    sql`SELECT id, date, time, title, location, kind, lead, status, cost, note
        FROM board_socials ORDER BY date, id`,
    sql`SELECT id, title, body, posted_on AS "postedOn", link_tab AS "linkTab", link_label AS "linkLabel"
        FROM board_announcements ORDER BY sort, posted_on DESC, id DESC`,
    sql`SELECT id, date, title, summary, recording_url AS "recordingUrl"
        FROM board_meetings ORDER BY date DESC, id DESC`,
  ]);
  const plain = <T,>(rows: unknown) => JSON.parse(JSON.stringify(rows)) as T;
  return {
    members: plain(members),
    assignments: plain(assignments),
    submissions: plain(submissions),
    socials: plain(socials),
    announcements: plain(announcements),
    meetings: plain(meetings),
  };
}
