"use client";

import type { Assignment, AssignmentStatus, BoardData, Member } from "@/lib/board/types";
import { UNASSIGNED } from "@/lib/board/static";

export type PersonTasks = {
  person: string;
  role: string;
  items: Assignment[];
  due: string | null;
  submitted: boolean;
  // UCLA: one status per person. With mixed task statuses, the least done.
  status: AssignmentStatus;
};

const ORDER: AssignmentStatus[] = ["pending", "missing", "excused", "submitted", "done"];

// A round's tasks grouped by person, in the order they were added. Tasks
// with no owner yet are left out (see unassignedTasks).
export function roundTasks(data: BoardData, round: number | null): PersonTasks[] {
  const map = new Map<string, PersonTasks>();
  for (const a of data.assignments) {
    if (a.round !== round || a.person === UNASSIGNED) continue;
    let p = map.get(a.person);
    if (!p) {
      p = { person: a.person, role: a.personRole, items: [], due: a.dueDate, submitted: false, status: a.status };
      map.set(a.person, p);
    }
    p.items.push(a);
    if (a.status === "submitted" || a.status === "done") p.submitted = true;
    if (ORDER.indexOf(a.status) < ORDER.indexOf(p.status)) p.status = a.status;
  }
  for (const s of data.submissions) {
    const p = map.get(s.person);
    if (p && s.assignmentId && p.items.some((i) => i.id === s.assignmentId)) p.submitted = true;
  }
  return [...map.values()];
}

// Tasks with no owner yet in a round. Only admins receive these.
export const unassignedTasks = (data: BoardData, round: number | null) =>
  data.assignments.filter((a) => a.round === round && a.person === UNASSIGNED);

export const inLeadership = (m: Member) => m.isLead || m.tier !== null;
