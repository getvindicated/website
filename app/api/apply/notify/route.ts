import { isChapterId } from "@/lib/board/chapters";
import { readJson } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { ensureSetup } from "@/lib/board/setup";
import { isEmail } from "@/lib/board/submit-rules";
import { isValidLocale } from "@/lib/i18n/config";
import { isBot, rateLimiter } from "@/lib/spam-guard";

// "Email me when they open" on the closed /apply page: saves an email for a
// chapter. Only admins see the list (hub, Applications tab). Saving the same
// email again for the same chapter is a no-op.

const limited = rateLimiter(10 * 60 * 1000, 10);
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return fail("failed", 503);
  const body = await readJson(request);
  if (!body) return fail("failed");
  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  if (isBot(str("company", 200))) return Response.json({ ok: true });
  if (await limited("apply-notify")) return fail("tooMany", 429);
  const chapter = str("chapter", 20);
  const email = str("email", 254).toLowerCase();
  const locale = isValidLocale(str("locale", 10)) ? str("locale", 10) : "en";
  if (!isChapterId(chapter)) return fail("chapter", 422);
  if (!isEmail(email)) return fail("email", 422);
  await ensureSetup();
  const sql = db();
  await sql`INSERT INTO board_application_notify (chapter, email, locale) VALUES (${chapter}, ${email}, ${locale})
    ON CONFLICT (chapter, lower(email)) DO NOTHING`;
  return Response.json({ ok: true });
}
