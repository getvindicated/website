import { isChapterId } from "@/lib/board/chapters";
import { isBot, rateLimiter } from "@/lib/spam-guard";
import { isValidLocale } from "@/lib/i18n/config";
import { getConfig, isOpen, saveApplication } from "@/lib/apply/server";
import { ensureSetup } from "@/lib/board/setup";
import { sendChapterNotice, sendConfirmation } from "@/lib/apply/email";
import { MAX_RESUME_BYTES, checkApplication, isPdf } from "@/lib/apply/rules";

// Board applications from the public /apply page. Everything is checked
// again here: the chapter must be open right now, and the answers, word
// limits, positions and resume must pass lib/apply/rules.ts. Errors are
// codes the form turns into messages in the visitor's language
// (applyPage.errors). Applying again with the same email for the same
// chapter and term updates that application.

// 8 applications per IP per 10 minutes.
const limited = rateLimiter(10 * 60 * 1000, 8);

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return fail("failed", 503);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("failed");
  }
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const locale = isValidLocale(get("locale")) ? get("locale") : "en";
  const chapter = get("chapter");

  // Bots fill in the hidden field: report success and save nothing.
  if (isBot(get("company"))) return Response.json({ ok: true, email: get("email").trim() });
  if (await limited("apply")) return fail("tooMany", 429);
  if (!isChapterId(chapter)) return fail("chapter", 422);

  await ensureSetup();
  const config = await getConfig(chapter);
  if (!isOpen(config)) return fail("closed", 409);

  const checked = checkApplication(
    {
      chapter,
      positions: form.getAll("positions").filter((p): p is string => typeof p === "string"),
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      year: get("year"),
      major: get("major"),
      why: get("why"),
      bring: get("bring"),
      hours: Number(get("hours")),
      link: get("link"),
      heard: get("heard"),
      commit: get("commit") === "yes",
    },
    config.positions,
    locale,
  );
  if (!checked.ok) return fail(checked.field, 422);

  let resume: { filename: string; data: Buffer } | null = null;
  const file = form.get("resume");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_RESUME_BYTES) return fail("resumeSize", 413);
    const data = Buffer.from(await file.arrayBuffer());
    if (!/\.pdf$/i.test(file.name) || !isPdf(data)) return fail("resumeType", 415);
    const filename = file.name.replace(/[\r\n"\\/]/g, " ").trim().slice(0, 120) || "resume.pdf";
    resume = { filename, data };
  }

  const a = checked.value;
  const { id, updated } = await saveApplication(chapter, config.term, a, locale, resume);
  const [mine, notice] = [
    await sendConfirmation(chapter, config.term, a, resume?.filename ?? "", locale, updated),
    await sendChapterNotice(chapter, id, config.term, a, resume?.filename ?? "", updated),
  ];
  if (!notice.ok) console.error(`[apply] The chapter wasn't told about application ${id}; it's still on the hub.`);
  // The reply never says whether this email had applied before, so it
  // can't be used to check who applied; their confirmation email says so.
  return Response.json({ ok: true, email: a.email, emailed: mine.ok }, { status: 201 });
}
