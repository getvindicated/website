import "server-only";
import { boardUser, type BoardUser } from "./session";
import type { BoardRole } from "./roles";

export const notFound = () => new Response("Not found", { status: 404 });
export const bad = (message: string, status = 400) => Response.json({ error: message }, { status });

// Returns the signed-in user, or a 404 Response when there's no valid
// session or the user lacks one of the allowed roles.
export async function guard(
  request: Request,
  allowed?: BoardRole[],
): Promise<BoardUser | Response> {
  const user = boardUser(request.headers);
  if (!user) return notFound();
  if (allowed && !allowed.includes(user.role)) return notFound();
  return user;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// Picks string fields from a JSON body, trimmed. Missing fields are skipped,
// so PATCH requests only touch what was sent.
export function strings<K extends string>(body: Record<string, unknown>, keys: readonly K[]) {
  const out: Partial<Record<K, string>> = {};
  for (const k of keys) {
    const v = body[k];
    if (typeof v === "string") out[k] = v.trim();
  }
  return out;
}

export const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function idFrom(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
