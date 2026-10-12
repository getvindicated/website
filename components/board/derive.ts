"use client";

import type { Assignment, BoardData, Member } from "@/lib/board/types";
import { CURRENT_ROUND, UNASSIGNED } from "@/lib/board/static";

export type PersonTasks = {
  person: string;
  role: string;
  items: Assignment[];
  due: string | null;
  submitted: boolean;
};

// Current-round tasks grouped by person, in the order they were added.
// Tasks with no owner yet are left out (see unassignedTasks).
export function currentRound(data: BoardData): PersonTasks[] {
  const map = new Map<string, PersonTasks>();
  for (const a of data.assignments) {
    if (a.round !== CURRENT_ROUND.round || a.person === UNASSIGNED) continue;
    let p = map.get(a.person);
    if (!p) {
      p = { person: a.person, role: a.personRole, items: [], due: a.dueDate, submitted: false };
      map.set(a.person, p);
    }
    p.items.push(a);
    if (a.status === "submitted" || a.status === "done") p.submitted = true;
  }
  for (const s of data.submissions) {
    const p = map.get(s.person);
    if (p && s.assignmentId && p.items.some((i) => i.id === s.assignmentId)) p.submitted = true;
  }
  return [...map.values()];
}

// Current-round tasks with no owner yet. Only admins receive these.
export const unassignedTasks = (data: BoardData) =>
  data.assignments.filter((a) => a.round === CURRENT_ROUND.round && a.person === UNASSIGNED);

export const inLeadership = (m: Member) => m.isLead || m.tier !== null;
