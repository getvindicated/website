import "server-only";
import type { ChapterId } from "./chapters";
import type { BoardRole } from "./roles";

// `short` is how the submit form names them: "Sent to Fiona and Will".
type Person = { email: string; name: string; short: string };
export type Sender = { name: string; email: string };

// Server-only chapter settings: which Railway variables hold each role's
// password, and where deliverable submissions are emailed. Change the
// recipients here; the submit route and form read them from this file.
export type ChapterServer = {
  cookie: string;
  // Who the chapter's emails come from (announcements, invites, submissions).
  // Must be a verified sender in Brevo. Null falls back to BOARD_INVITE_FROM.
  from: Sender | null;
  // The name public event emails (RSVP confirmations, reminders, location
  // updates) come from and are signed with. Same address as \`from\`.
  eventsFrom: string;
  // Members ticked as Hub admin when first loaded (for admins-only emails).
  // Admins change this on the Board tab afterwards.
  hubAdmins: string[];
  // Organizer of the chapter's calendar invites: RSVPs go to this address.
  organizer: Person;
  // Checked in this order, so a password shared by two roles gets the higher one.
  passwords: [BoardRole, string][];
  submissions: {
    subjectPrefix: string;
    to: Person[];
    cc: Person[];
    // Submitters on these teams also go to `techTo`.
    techTeams: string[];
    techTo: Person[];
  };
  // Who gets each new board application from the public /apply page.
  applications: { to: Person[]; cc: Person[] };
};

export const CHAPTER_SERVER: Record<ChapterId, ChapterServer> = {
  berkeley: {
    cookie: "board_session",
    from: { name: "Rana", email: "president@getvindicated.org" },
    eventsFrom: "VINdicated",
    hubAdmins: ["Rana Darwich"],
    organizer: { email: "ranadarwich05@gmail.com", name: "Rana Darwich", short: "Rana" },
    passwords: [
      ["admin", "BOARD_ADMIN_PASSWORD"],
      ["socials", "BOARD_SOCIALS_PASSWORD"],
      ["member", "BOARD_PASSWORD"],
    ],
    submissions: {
      subjectPrefix: "[VINdicated Board]",
      to: [{ email: "ranadarwich05@gmail.com", name: "Rana Darwich", short: "Rana" }],
      cc: [],
      techTeams: [],
      techTo: [],
    },
    applications: {
      to: [{ email: "ranadarwich05@gmail.com", name: "Rana Darwich", short: "Rana" }],
      cc: [],
    },
  },
  ucla: {
    cookie: "board_session_ucla",
    from: { name: "President Fiona", email: "vindicatedbruins@getvindicated.org" },
    eventsFrom: "VINdicated at UCLA",
    hubAdmins: ["Fiona Wangsawidjaja", "Will Prawira"],
    organizer: { email: "fionarhine@ucla.edu", name: "Fiona Wangsawidjaja", short: "Fiona" },
    passwords: [
      ["admin", "BOARD_UCLA_ADMIN_PASSWORD"],
      ["socials", "BOARD_UCLA_EVENTS_PASSWORD"],
      ["member", "BOARD_UCLA_PASSWORD"],
    ],
    submissions: {
      subjectPrefix: "[VINdicated UCLA]",
      to: [
        { email: "fionarhine@ucla.edu", name: "Fiona Wangsawidjaja", short: "Fiona" },
        { email: "prawira.j.william@gmail.com", name: "William Prawira", short: "Will" },
      ],
      cc: [{ email: "ranadarwich05@gmail.com", name: "Rana Darwich", short: "Rana" }],
      techTeams: ["App Dev", "Data"],
      techTo: [{ email: "rizwaanbana@ucla.edu", name: "Rizwaan Bana", short: "Rizwaan" }],
    },
    applications: {
      to: [
        { email: "fionarhine@ucla.edu", name: "Fiona Wangsawidjaja", short: "Fiona" },
        { email: "prawira.j.william@gmail.com", name: "William Prawira", short: "Will" },
      ],
      cc: [{ email: "ranadarwich05@gmail.com", name: "Rana Darwich", short: "Rana" }],
    },
  },
};

// The chapter's sender, else BOARD_INVITE_FROM ("Name <address>" or a bare
// address, which gets the chapter's title as its name), else null.
export function chapterSender(chapter: ChapterId, fallbackName: string): Sender | null {
  const own = CHAPTER_SERVER[chapter].from;
  if (own) return own;
  const env = process.env.BOARD_INVITE_FROM?.trim();
  if (!env) return null;
  const m = env.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim() || fallbackName, email: m[2].trim() } : { name: fallbackName, email: env };
}

// Who public event emails come from: the chapter's sending address under
// the chapter's name ("VINdicated", "VINdicated at UCLA"), not a person's.
export function eventSender(chapter: ChapterId): Sender | null {
  const s = chapterSender(chapter, CHAPTER_SERVER[chapter].eventsFrom);
  return s ? { name: CHAPTER_SERVER[chapter].eventsFrom, email: s.email } : null;
}

// Who a submission from someone on `team` goes to.
export function submissionRecipients(chapter: ChapterId, team: string) {
  const s = CHAPTER_SERVER[chapter].submissions;
  const tech = s.techTeams.includes(team);
  return { to: tech ? [...s.to, ...s.techTo] : s.to, cc: s.cc };
}

// Who a new board application goes to.
export function applicationRecipients(chapter: ChapterId) {
  return CHAPTER_SERVER[chapter].applications;
}

// Short names for the submit form, without email addresses.
export function recipientNames(chapter: ChapterId) {
  const s = CHAPTER_SERVER[chapter].submissions;
  return { base: s.to.map((p) => p.short), tech: s.techTo.map((p) => p.short), techTeams: s.techTeams };
}
