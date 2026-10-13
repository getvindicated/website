// Who can do what on the board hub. People sign in with a shared password
// for their chapter; which Railway variable holds which role's password is
// set per chapter in chapter-server.ts:
//   Berkeley  BOARD_ADMIN_PASSWORD (Rana), BOARD_SOCIALS_PASSWORD (socials
//             editor; no one yet, leave unset), BOARD_PASSWORD (everyone)
//   UCLA      BOARD_UCLA_ADMIN_PASSWORD (Fiona and Will),
//             BOARD_UCLA_EVENTS_PASSWORD (events editor), BOARD_UCLA_PASSWORD
// The "socials" role is called the events editor on UCLA's hub.

export type BoardRole = "admin" | "socials" | "member";

export const canEditSocials = (role: BoardRole) => role === "admin" || role === "socials";
export const isAdmin = (role: BoardRole) => role === "admin";
