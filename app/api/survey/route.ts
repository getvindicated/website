import { headers } from "next/headers";
import { isBot, rateLimiter } from "@/lib/spam-guard";
import { isValidLocale } from "@/lib/i18n/config";
import { ensureSetup } from "@/lib/board/setup";
import { MIN_SECONDS, cleanAnswers, cleanDemographics, cleanSource } from "@/lib/survey/questions";
import { saveResponse, secondsSince, surveyAdmin, surveyPublic } from "@/lib/survey/server";

// Answers from the public /survey page. Anonymous: nothing that could
// identify someone is stored. The IP address is only used here, in
// memory, for the rate limit. Everything is checked again on the server:
// every 1–5 item answered and in range, the hidden spam field empty, and
// at least MIN_SECONDS since the page handed out the form. Before launch
// (SURVEY_PUBLIC) only hub admins can send answers, and theirs are saved
// as tests. Errors are codes the page turns into messages.

// 5 submissions per IP per hour.
const limited = rateLimiter(60 * 60 * 1000, 5);

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const admin = surveyAdmin(await headers()) !== null;
  if (!surveyPublic() && !admin) return new Response("Not found", { status: 404 });
  if (!process.env.DATABASE_URL) return fail("failed", 503);

  let body: Record<string, unknown>;
  try {
    const b = await request.json();
    if (!b || typeof b !== "object" || Array.isArray(b)) return fail("failed");
    body = b as Record<string, unknown>;
  } catch {
    return fail("failed");
  }

  // Bots fill in the hidden field: report success and save nothing.
  if (isBot(typeof body.company === "string" ? body.company : "")) return Response.json({ ok: true });
  if (await limited("survey")) return fail("tooMany", 429);

  const answers = cleanAnswers(body.answers);
  if (!answers) return fail("missing", 422);
  const took = secondsSince(body.started);
  if (took === null) return fail("expired", 422);
  if (took < MIN_SECONDS) return fail("tooFast", 422);

  await ensureSetup();
  await saveResponse({
    locale: typeof body.locale === "string" && isValidLocale(body.locale) ? body.locale : "en",
    source: cleanSource(body.source),
    answers,
    demographics: cleanDemographics(body.demographics),
    test: admin,
  });
  return Response.json({ ok: true });
}
