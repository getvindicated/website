import { sendEmail } from "@/lib/brevo";
import { bad, guard } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { chapterConfig } from "@/lib/board/chapters";
import { CHAPTER_SERVER, chapterSender, submissionRecipients } from "@/lib/board/chapter-server";
import { MAX_ATTACHMENT_BYTES, OTHER_TASK, TOO_BIG, hasLink, isEmail } from "@/lib/board/submit-rules";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Mail = Parameters<typeof sendEmail>[0];

// Without a Brevo key in local development, print the email instead of
// sending it. On the deployed site a missing key is an error.
async function deliver(mail: Mail) {
  if (!process.env.BREVO_API_KEY && process.env.NODE_ENV === "development") {
    console.log("[board] Email not sent (no BREVO_API_KEY in dev):", {
      subject: mail.subject,
      to: mail.to,
      cc: mail.cc,
      replyTo: mail.replyTo,
      attachments: mail.attachment?.map((a) => `${a.name} (${Math.round((a.content.length * 3) / 4)} bytes)`),
    });
    return;
  }
  await sendEmail(mail);
}

export async function POST(request: Request) {
  const user = await guard(request);
  if (user instanceof Response) return user;
  const chapter = user.chapter;
  const config = chapterConfig(chapter);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Check the form.");
  }
  const person = String(form.get("person") ?? "").trim();
  const assignment = String(form.get("assignment") ?? "").trim();
  const text = String(form.get("text") ?? "").trim();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const givenEmail = String(form.get("email") ?? "").trim();

  if (!person) return bad("Choose your name before submitting.");
  if (!assignment) return bad("Choose the assignment.");
  if (text.length > 20000) return bad("The notes are too long. Put the full write-up in a doc and paste the link.");
  // Berkeley needs proof (a file or a link); UCLA needs an update or a file.
  if (config.proofRequired ? files.length === 0 && !hasLink(text) : files.length === 0 && !text) {
    return bad(config.submit.needProof);
  }
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MAX_ATTACHMENT_BYTES) return bad(TOO_BIG, 413);

  const sql = db();
  const [member] = await sql`SELECT first_name, name, email, team FROM board_members
    WHERE chapter = ${chapter} AND first_name = ${person} LIMIT 1`;
  if (!member) return bad("Choose your name from the list.");
  // Everyone shares a password, so reply-to is the email on file for the
  // name they picked. With none on file the form asks for one, used only
  // for this email.
  const replyEmail = isEmail(member.email) ? member.email : isEmail(givenEmail) ? givenEmail : null;
  if (!replyEmail) return bad("Add your email so they can reply to you.");

  let assignmentId: number | null = null;
  let taskLabel = OTHER_TASK;
  let proof = "";
  if (assignment !== "other") {
    const id = Number(assignment);
    const [row] = Number.isInteger(id)
      ? await sql`SELECT id, task, proof_required FROM board_assignments
          WHERE chapter = ${chapter} AND id = ${id} AND person = ${person}`
      : [];
    if (!row) return bad("Choose one of your assignments.");
    assignmentId = row.id;
    taskLabel = row.task;
    proof = row.proof_required;
  }

  const attachment = await Promise.all(
    files.map(async (f) => ({
      name: f.name.replace(/[\r\n]/g, " ").slice(0, 200) || "file",
      content: Buffer.from(await f.arrayBuffer()).toString("base64"),
    })),
  );
  const shortTask = taskLabel.length > 90 ? `${taskLabel.slice(0, 88)}…` : taskLabel;

  const { to, cc } = submissionRecipients(chapter, member.team);
  const strip = (p: { email: string; name: string }) => ({ email: p.email, name: p.name });
  try {
    await deliver({
      sender: chapterSender(chapter, "VINdicated") ?? { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: to.map(strip),
      ...(cc.length ? { cc: cc.map(strip) } : {}),
      replyTo: { email: replyEmail, name: member.name },
      subject: `${CHAPTER_SERVER[chapter].submissions.subjectPrefix} ${person}: ${shortTask}`,
      attachment,
      htmlContent: `
        <h2>Board submission</h2>
        <p><strong>Name:</strong> ${esc(person)}</p>
        <p><strong>Team:</strong> ${esc(member.team)}</p>
        <p><strong>Signed in with:</strong> the ${esc(config.roleLabels[user.role] ?? user.role)} password</p>
        <p><strong>Assignment:</strong> ${esc(taskLabel)}</p>
        ${proof ? `<p><strong>Proof needed:</strong> ${esc(proof)}</p>` : ""}
        <p><strong>Files:</strong> ${attachment.length ? attachment.map((a) => esc(a.name)).join(", ") : "none"}</p>
        <p><strong>Notes:</strong></p>
        <p>${text ? esc(text).replace(/\n/g, "<br>") : "(none)"}</p>
      `,
    });
  } catch {
    return bad(`The email didn't go through. Try again, or send it to ${config.contact} directly.`, 502);
  }

  await sql.begin(async (tx) => {
    await tx`INSERT INTO board_submissions (chapter, person, assignment_id, task_label, submitter_email, body, filenames)
      VALUES (${chapter}, ${person}, ${assignmentId}, ${taskLabel}, ${replyEmail}, ${text}, ${attachment.map((a) => a.name)})`;
    if (config.weekly) {
      // UCLA keeps one status per person: a submission marks their week.
      await tx`UPDATE board_assignments SET status = 'submitted'
        WHERE chapter = ${chapter} AND person = ${person} AND status = 'pending'
          AND round = (SELECT round FROM board_rounds WHERE chapter = ${chapter} AND is_current)`;
    } else if (assignmentId) {
      await tx`UPDATE board_assignments SET status = 'submitted' WHERE id = ${assignmentId} AND status = 'pending'`;
    }
  });

  return Response.json({ ok: true, files: attachment.length, to: to.map((p) => p.short) }, { status: 201 });
}
