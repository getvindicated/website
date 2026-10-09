// Shared by the submit form and the /api/board/submit route.

// Brevo caps a whole transactional email at 20 MB, and attachments are
// base64-encoded (about 4/3 the size), so keep the raw files under 14 MB.
export const MAX_ATTACHMENT_BYTES = 14 * 1024 * 1024;

export const TOO_BIG =
  "Those files are too large to email (14 MB total). Upload them to Google Drive and paste the share link in the notes instead.";

export const NEED_PROOF = "Add proof: attach a file or paste a link to your post, doc or PR.";

export const hasLink = (text: string) => /https?:\/\/\S+/.test(text);

export const OTHER_TASK = "Other / general update";
