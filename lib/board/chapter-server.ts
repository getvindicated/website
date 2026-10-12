import "server-only";
import type { ChapterId } from "./chapters";
import type { BoardRole } from "./roles";

// `short` is how the submit form names them: "Sent to Fiona and Will".
type Person = { email: string; name: string; short: string };

// Server-only chapter settings: which Railway variables hold each role's
// password, and where deliverable submissions are emailed. Change the
// recipients here; the submit route and form read them from this file.
export type ChapterServer = {
  cookie: string;
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
};

export const CHAPTER_SERVER: Record<ChapterId, ChapterServer> = {
  berkeley: {
    cookie: "board_session",
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
  },
  ucla: {
    cookie: "board_session_ucla",
    passwords: [
      ["admin", "BOARD_UCLA_ADMIN_PASSWORD"],
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
      techTo: [{ email: "rizwaanbana@g.ucla.edu", name: "Rizwaan Bana", short: "Rizwaan" }],
    },
  },
};

// Who a submission from someone on `team` goes to.
export function submissionRecipients(chapter: ChapterId, team: string) {
  const s = CHAPTER_SERVER[chapter].submissions;
  const tech = s.techTeams.includes(team);
  return { to: tech ? [...s.to, ...s.techTo] : s.to, cc: s.cc };
}

// Short names for the submit form, without email addresses.
export function recipientNames(chapter: ChapterId) {
  const s = CHAPTER_SERVER[chapter].submissions;
  return { base: s.to.map((p) => p.short), tech: s.techTo.map((p) => p.short), techTeams: s.techTeams };
}
