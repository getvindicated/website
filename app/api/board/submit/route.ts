import { sendEmail } from "@/lib/brevo";
import { bad, guard } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { SUBMISSIONS_INBOX } from "@/lib/board/roles";
import { MAX_ATTACHMENT_BYTES, NEED_PROOF, OTHER_TASK, TOO_BIG, hasLink } from "@/lib/board/submit-rules";

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

  if (!person) return bad("Choose your name before submitting.");
  if (!assignment) return bad("Choose the assignment.");
  if (text.length > 20000) return bad("The notes are too long. Put the full write-up in a doc and paste the link.");
  if (files.length === 0 && !hasLink(text)) return bad(NEED_PROOF);
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MAX_ATTACHMENT_BYTES) return bad(TOO_BIG, 413);

  const sql = db();
  const [member] = await sql`SELECT first_name FROM board_members WHERE first_name = ${person} LIMIT 1`;
  if (!member) return bad("Choose your name from the list.");

  let assignmentId: number | null = null;
  let taskLabel = OTHER_TASK;
  let proof = "";
  if (assignment !== "other") {
    const id = Number(assignment);
    const [row] = Number.isInteger(id)
      ? await sql`SELECT id, task, proof_required FROM board_assignments WHERE id = ${id} AND person = ${person}`
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

  try {
    await deliver({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [SUBMISSIONS_INBOX],
      replyTo: { email: user.email, name: person },
      subject: `[VINdicated Board] ${person}: ${shortTask}`,
      attachment,
      htmlContent: `
        <h2>Board submission</h2>
        <p><strong>Name:</strong> ${esc(person)}</p>
        <p><strong>Signed in as:</strong> ${esc(user.email)}</p>
        <p><strong>Assignment:</strong> ${esc(taskLabel)}</p>
        ${proof ? `<p><strong>Proof needed:</strong> ${esc(proof)}</p>` : ""}
        <p><strong>Files:</strong> ${attachment.length ? attachment.map((a) => esc(a.name)).join(", ") : "none"}</p>
        <p><strong>Notes:</strong></p>
        <p>${text ? esc(text).replace(/\n/g, "<br>") : "(none)"}</p>
      `,
    });
  } catch {
    return bad("The email didn't go through. Try again, or send your proof to Rana directly.", 502);
  }

  await sql.begin(async (tx) => {
    await tx`INSERT INTO board_submissions (person, assignment_id, task_label, submitter_email, body, filenames)
      VALUES (${person}, ${assignmentId}, ${taskLabel}, ${user.email}, ${text}, ${attachment.map((a) => a.name)})`;
    if (assignmentId) {
      await tx`UPDATE board_assignments SET status = 'submitted' WHERE id = ${assignmentId} AND status = 'pending'`;
    }
  });

  return Response.json({ ok: true, files: attachment.length }, { status: 201 });
}
