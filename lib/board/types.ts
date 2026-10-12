// Shapes shared by the /board server code and its client components.

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
};

export type AssignmentStatus = "pending" | "submitted" | "done" | "missing" | "excused";

// A round (Berkeley) or week (UCLA) of deliverables.
export type Round = {
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
  adminsOnly: boolean;
};

export type Meeting = {
  id: number;
  date: string;
  title: string;
  summary: string;
  absent: string;
  recordingUrl: string;
};

export type BoardData = {
  rounds: Round[];
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

export const TABS = ["me", "home", "board", "projects", "assignments", "socials", "meetings"] as const;
export type Tab = (typeof TABS)[number];
