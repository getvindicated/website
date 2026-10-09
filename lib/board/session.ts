import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { ROLE_PASSWORD_ENV, type BoardRole } from "./roles";

// Password sign-in for /board. A correct password sets a signed cookie
// that holds the role and an expiry. The cookie also carries a short
// fingerprint of the password it came from, so changing a password in
// Railway signs out everyone who used the old one.

export const SESSION_COOKIE = "board_session";
export const SESSION_DAYS = 30;

export type BoardUser = { role: BoardRole };

const sha = (s: string) => createHash("sha256").update(s).digest();
const fingerprint = (password: string) => sha(`board:${password}`).toString("base64url").slice(0, 12);

function secret(): string | null {
  const s = process.env.BOARD_SESSION_SECRET?.trim();
  return s && s.length >= 32 ? s : null;
}

function passwordFor(role: BoardRole): string | null {
  const env = ROLE_PASSWORD_ENV.find(([r]) => r === role)?.[1];
  const p = env ? process.env[env]?.trim() : "";
  return p ? p : null;
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

// Compares in constant time so the response time doesn't leak how much
// of a password matched.
const same = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

// Returns the role a password unlocks, or null.
export function roleForPassword(attempt: string): BoardRole | null {
  let found: BoardRole | null = null;
  for (const [role] of ROLE_PASSWORD_ENV) {
    const p = passwordFor(role);
    // Keep comparing after a match so every attempt takes the same time.
    if (p && same(attempt, p) && !found) found = role;
  }
  return found;
}

export function createSession(role: BoardRole): string | null {
  const key = secret();
  const password = passwordFor(role);
  if (!key || !password) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const payload = Buffer.from(JSON.stringify({ r: role, e: exp, f: fingerprint(password) })).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

function readCookie(headers: Headers): string | null {
  const m = new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`).exec(headers.get("cookie") ?? "");
  return m ? m[1] : null;
}

// The signed-in board user for this request, or null.
export function boardUser(headers: Headers): BoardUser | null {
  const key = secret();
  const token = readCookie(headers);
  if (!key || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload, key);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { r, e, f } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (r !== "admin" && r !== "socials" && r !== "member") return null;
    if (typeof e !== "number" || e < Date.now() / 1000) return null;
    const password = passwordFor(r);
    if (!password || f !== fingerprint(password)) return null;
    return { role: r };
  } catch {
    return null;
  }
}

export function sessionCookie(value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}
