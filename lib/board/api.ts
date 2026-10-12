import "server-only";
import { boardUser, type BoardUser } from "./session";
import type { BoardRole } from "./roles";
import { isChapterId, type ChapterId } from "./chapters";
import { ensureSetup } from "./setup";

export const notFound = () => new Response("Not found", { status: 404 });
export const bad = (message: string, status = 400) => Response.json({ error: message }, { status });

// The chapter a board API request is for: ?chapter=ucla, else Berkeley.
export function chapterOf(request: Request): ChapterId | null {
  const c = new URL(request.url).searchParams.get("chapter") ?? "berkeley";
  return isChapterId(c) ? c : null;
}

// Returns the signed-in user of the request's chapter, or a 404 Response
// when there's no valid session for that chapter or the user lacks one of
// the allowed roles. Every read and write is then scoped to user.chapter.
export async function guard(
  request: Request,
  allowed?: BoardRole[],
): Promise<BoardUser | Response> {
  const chapter = chapterOf(request);
  if (!chapter) return notFound();
  const user = boardUser(request.headers, chapter);
  if (!user) return notFound();
  if (allowed && !allowed.includes(user.role)) return notFound();
  if (!process.env.DATABASE_URL) return bad("The board's database isn't connected yet.", 503);
  await ensureSetup();
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
