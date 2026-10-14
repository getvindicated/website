// Shapes shared by the /board server code and its client components.

import type { Audience } from "./audience";
import type { ScheduledMeeting } from "./schedule";
import type { Settings } from "./settings";

export type Member = {
  id: number;
  name: string;
  firstName: string;
  role: string;
  team: string;
  alsoTeam: string | null;
  tier: number | null;
  isLead: boolean;
  email: string;
  phone: string;
  hubAdmin: boolean;
};

export type AssignmentStatus = "pending" | "submitted" | "done" | "missing" | "excused";

// A round (Berkeley) or week (UCLA) of deliverables.
export type Round = {
  id: number;
  round: number;
  dueDate: string;
  isCurrent: boolean;
  showStatus: boolean;
  note: string;
};

export type Assignment = {
  id: number;
  round: number;
  person: string;
  personRole: string;
  task: string;
  proof: string;
  dueDate: string | null;
  status: AssignmentStatus;
  statusNote: string;
};

export type Submission = {
  id: number;
  person: string;
  assignmentId: number | null;
  taskLabel: string;
  filenames: string[];
  createdAt: string;
};

export type SocialKind = "b" | "o" | "org";

export type Social = {
  id: number;
  date: string;
  time: string;
  title: string;
  location: string;
  kind: SocialKind;
  lead: string;
  status: string;
  cost: string;
  note: string;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  postedOn: string;
  linkTab: string;
  linkLabel: string;
  audience: Audience;
};

export type Meeting = {
  id: number;
  date: string;
  title: string;
  summary: string;
  absent: string;
  recordingUrl: string;
};

// One admin change (Changes tab).
export type LogEntry = {
  id: number;
  at: string;
  role: string;
  actor: string;
  action: string;
  summary: string;
  // "table:id" of each row it touched, for the "changed again later" warning.
  touches: string[];
  diffs: { table: string; id: number; kind: "added" | "removed" | "changed"; fields: { name: string; before: string; after: string }[] }[];
  restorable: boolean;
};

// An announcement's latest email: how many it reached and who it didn't.
// `audience` is what the send was addressed to ("Leads only").
export type SendSummary = { announcementId: number; at: string; kind: string; audience: string; sent: number; failed: { name: string; email: string }[] };

export type BoardData = {
  settings: Settings;
  // Admins only (empty for members).
  changelog: LogEntry[];
  sends: SendSummary[];
  rounds: Round[];
  // Meetings scheduled with calendar invites.
  scheduled: ScheduledMeeting[];
  // Admins only: prefills "Send me a test invite".
  organizerEmail: string | null;
  // Who this browser picked on My page ("Viewing as"), or null. Members see
  // announcements addressed to that person.
  viewerId: number | null;
  // First names of who a submission goes to: everyone, and the extra
  // people for submitters on `techTeams`.
  recipients: { base: string[]; tech: string[]; techTeams: string[] };
  members: Member[];
  assignments: Assignment[];
  submissions: Submission[];
  socials: Social[];
  announcements: Announcement[];
  meetings: Meeting[];
};

export const TABS = ["me", "home", "board", "projects", "assignments", "socials", "meetings", "changes"] as const;
export type Tab = (typeof TABS)[number];
