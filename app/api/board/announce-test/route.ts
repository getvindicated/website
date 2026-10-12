import { bad, guard, readJson } from "@/lib/board/api";
import { announceSetupProblem, sendAnnouncement } from "@/lib/board/announce";
import { isEmail } from "@/lib/board/submit-rules";

// "Send me a test": emails an announcement draft to one address the admin
// typed in. Nothing is saved.
export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const problem = announceSetupProblem(user.chapter);
  if (problem) return bad(problem, 503);
  const body = await readJson(request);
  const to = typeof body?.to === "string" ? body.to.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 300) : "";
  const text = typeof body?.body === "string" ? body.body.trim().slice(0, 4000) : "";
  if (!isEmail(to)) return bad("Add the email to send the test to.");
  if (!title) return bad("Add a title first.");
  const [r] = await sendAnnouncement(user.chapter, { title, body: text, adminsOnly: false }, [{ name: to, email: to }], body?.update === true);
  return r.ok ? Response.json({ ok: true }) : bad("The test didn't go through. Check the address and try again.", 502);
}
