// Who can do what on /board. Emails are compared lowercase.
// Everyone who gets through Cloudflare Access can view and submit.

export const BOARD_ADMINS = ["ranadarwich05@gmail.com"];

export const SOCIALS_EDITORS = ["pierce.kosobayashi@berkeley.edu"];

// Where assignment submissions are emailed.
export const SUBMISSIONS_INBOX = { email: "ranadarwich05@gmail.com", name: "Rana Darwich" };

export type BoardRole = "admin" | "socials" | "member";

export function roleFor(email: string): BoardRole {
  const e = email.trim().toLowerCase();
  if (BOARD_ADMINS.includes(e)) return "admin";
  if (SOCIALS_EDITORS.includes(e)) return "socials";
  return "member";
}

export const canEditSocials = (role: BoardRole) => role === "admin" || role === "socials";
export const isAdmin = (role: BoardRole) => role === "admin";
