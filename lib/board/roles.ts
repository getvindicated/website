// Who can do what on /board. People sign in with one of three passwords,
// all set as environment variables in Railway:
//   BOARD_PASSWORD          everyone on the board: view and submit
//   BOARD_SOCIALS_PASSWORD  socials editor (Pierce): also add/edit/delete socials
//   BOARD_ADMIN_PASSWORD    admin (Rana): edit everything

// Where assignment submissions are emailed.
export const SUBMISSIONS_INBOX = { email: "ranadarwich05@gmail.com", name: "Rana Darwich" };

export type BoardRole = "admin" | "socials" | "member";

export const ROLE_LABEL: Record<BoardRole, string> = {
  admin: "admin",
  socials: "socials editor",
  member: "board member",
};

// Checked in this order, so a password shared by two roles gets the higher one.
export const ROLE_PASSWORD_ENV: [BoardRole, string][] = [
  ["admin", "BOARD_ADMIN_PASSWORD"],
  ["socials", "BOARD_SOCIALS_PASSWORD"],
  ["member", "BOARD_PASSWORD"],
];

export const canEditSocials = (role: BoardRole) => role === "admin" || role === "socials";
export const isAdmin = (role: BoardRole) => role === "admin";
