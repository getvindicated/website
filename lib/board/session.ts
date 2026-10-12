import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { ChapterId } from "./chapters";
import { CHAPTER_SERVER } from "./chapter-server";
import type { BoardRole } from "./roles";

// Password sign-in for the board hub. A correct password sets a signed
// cookie that holds the chapter, the role and an expiry. Each chapter has
// its own cookie and only checks its own passwords, so a Berkeley password
// never opens UCLA or the reverse. The cookie also carries a short
// fingerprint of the password it came from, so changing a password in
// Railway signs out everyone who used the old one.

export const SESSION_DAYS = 30;

export type BoardUser = { role: BoardRole; chapter: ChapterId };

const sha = (s: string) => createHash("sha256").update(s).digest();
const fingerprint = (chapter: ChapterId, password: string) =>
  sha(`board:${chapter}:${password}`).toString("base64url").slice(0, 12);

function secret(): string | null {
  const s = process.env.BOARD_SESSION_SECRET?.trim();
  return s && s.length >= 32 ? s : null;
}

function passwordFor(chapter: ChapterId, role: BoardRole): string | null {
  const env = CHAPTER_SERVER[chapter].passwords.find(([r]) => r === role)?.[1];
  const p = env ? process.env[env]?.trim() : "";
  return p ? p : null;
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

// Compares in constant time so the response time doesn't leak how much
// of a password matched.
const same = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

// Why sign-in can't work yet for a chapter, for the server log, or null.
export function setupProblem(chapter: ChapterId): string | null {
  if (!secret()) return "BOARD_SESSION_SECRET is missing or shorter than 32 characters.";
  const vars = CHAPTER_SERVER[chapter].passwords;
  if (!vars.some(([role]) => passwordFor(chapter, role))) {
    return `No ${chapter} board password is set (${vars.map(([, v]) => v).join(", ")}).`;
  }
  return null;
}

// Returns the role a password unlocks for this chapter, or null.
export function roleForPassword(chapter: ChapterId, attempt: string): BoardRole | null {
  let found: BoardRole | null = null;
  for (const [role] of CHAPTER_SERVER[chapter].passwords) {
    const p = passwordFor(chapter, role);
    // Keep comparing after a match so every attempt takes the same time.
    if (p && same(attempt, p) && !found) found = role;
  }
  return found;
}

export function createSession(chapter: ChapterId, role: BoardRole): string | null {
  const key = secret();
  const password = passwordFor(chapter, role);
  if (!key || !password) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const payload = Buffer.from(JSON.stringify({ c: chapter, r: role, e: exp, f: fingerprint(chapter, password) })).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

function readCookie(headers: Headers, name: string): string | null {
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(headers.get("cookie") ?? "");
  return m ? m[1] : null;
}

// The signed-in user of this chapter for this request, or null.
export function boardUser(headers: Headers, chapter: ChapterId): BoardUser | null {
  const key = secret();
  const token = readCookie(headers, CHAPTER_SERVER[chapter].cookie);
  if (!key || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload, key);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { c, r, e, f } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    // Sessions from before chapters existed have no `c` and were Berkeley's.
    if ((c ?? "berkeley") !== chapter) return null;
    if (!CHAPTER_SERVER[chapter].passwords.some(([role]) => role === r)) return null;
    if (typeof e !== "number" || e < Date.now() / 1000) return null;
    const password = passwordFor(chapter, r);
    if (!password) return null;
    const ok = f === fingerprint(chapter, password) || (c === undefined && f === sha(`board:${password}`).toString("base64url").slice(0, 12));
    return ok ? { role: r, chapter } : null;
  } catch {
    return null;
  }
}

export function sessionCookie(chapter: ChapterId, value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CHAPTER_SERVER[chapter].cookie}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}
