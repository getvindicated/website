"use server";

import { sendEmail } from "@/lib/brevo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/lib/i18n/config";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
import { isBot, rateLimiter } from "@/lib/spam-guard";

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  chapter: string;
  role: string;
  hours: number;
  location: string;
  background: string;
  why: string;
  student: string;
  resume?: { filename: string; base64: string };
  // The role as the visitor saw it, for their confirmation email.
  roleLabel?: string;
  // Hidden honeypot field; real visitors leave it blank. Named to look
  // like an ordinary form field so it isn't obviously a trap.
  company?: string;
}

// 5 applications per IP per 10 minutes.
const limited = rateLimiter(10 * 60 * 1000, 5);

// Chapter value -> who should get the notification email.
// Values must match the CHAPTERS options in app/[locale]/volunteer/page.tsx
// ("ucla", "ucberkeley", "ucsc").
const CHAPTER_RECIPIENTS: Record<string, { email: string; name: string }[]> = {
  ucla: [
    { email: "fionarhine@ucla.edu", name: "Fiona Wangsawidjaja" },
    { email: "prawira.j.william@gmail.com", name: "William Prawira" },
    { email: "rizwaanbana@g.ucla.edu", name: "Rizwaan Bana" },
  ],
  // Rana is already CC'd on every non-UCLA application (see ccRana below).
  ucberkeley: [{ email: "noiritgc@gmail.com", name: "Noirit Ghosh Choudhuri" }],
  ucsc: [
    { email: "asvinod@ucsc.edu", name: "Ashwin Vinod" },
    { email: "gsambee@ucsc.edu", name: "Gundeep Sambee" },
  ],
};

// Returns a result code; the form shows the matching message in the
// visitor's language. Their confirmation email is in that language too.
export async function submitVolunteerApplication(
  data: VolunteerFormData,
  locale = "en",
): Promise<{ success: boolean; code: "sent" | "missing" | "tooMany" | "failed" }> {
  try {
    if (!data.name || !data.email || !data.role) {
      return { success: false, code: "missing" };
    }

    // Bots fill in the honeypot. Report success without sending anything,
    // so the bot has no signal that it was caught.
    if (isBot(data.company ?? "")) {
      return { success: true, code: "sent" };
    }

    if (await limited("volunteer")) {
      return { success: false, code: "tooMany" };
    }

    // Falls back to the UCLA chapter leads for any unrecognized chapter
    // value so an application never silently goes nowhere.
    const recipients = CHAPTER_RECIPIENTS[data.chapter] ?? CHAPTER_RECIPIENTS.ucla;

    // Rana gets CC'd on every application regardless of chapter, so she
    // has visibility across all three chapters as Executive Director.
    // ranadarwich05@gmail.com is CC'd on every application too (including
    // UCLA's), as a backup inbox alongside the outlook.com address.
    // Remove/edit this block if that's not what you want.
    const ccRana = [
      ...(data.chapter !== "ucla"
        ? [{ email: "getvindicated@outlook.com", name: "Rana Darwich" }]
        : []),
      { email: "ranadarwich05@gmail.com", name: "Rana Darwich" },
    ];

    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: recipients,
      cc: ccRana,
      subject: `New Volunteer Application: ${data.role}`,
      replyTo: { email: data.email, name: data.name },
      attachment: data.resume
        ? [{ name: data.resume.filename, content: data.resume.base64 }]
        : undefined,
      htmlContent: `
        <h2>New Volunteer Application</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Chapter:</strong> ${data.chapter}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Hours per week:</strong> ${data.hours}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Student/Recent Grad:</strong> ${data.student}</p>
        <p><strong>Background:</strong></p>
        <p>${data.background.replace(/\n/g, "<br>")}</p>
        <p><strong>Why VINdicated:</strong></p>
        <p>${data.why.replace(/\n/g, "<br>")}</p>
        <p><strong>Resume:</strong> ${data.resume ? "attached (" + data.resume.filename + ")" : "not provided"}</p>
      `,
    });

    const e = (await getDictionary((isValidLocale(locale) ? locale : "en") as Locale)).joinPage.emails;
    const first = data.name.split(" ")[0] || e.friend;
    // Some languages leave `friend` empty and just drop the name.
    const hi = first ? e.hi.replace("{name}", first) : e.hi.replace(/[\s,،]*\{name\}/, "");
    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [{ email: data.email, name: data.name }],
      subject: e.apply.subject,
      htmlContent: `
        <div dir="${locale === "fa" || locale === "ar-EG" ? "rtl" : "ltr"}">
        <p>${esc(hi)}</p>
        <p>${esc(e.apply.body).replace("{role}", `<strong>${esc(data.roleLabel || data.role)}</strong>`)}</p>
        <p>${esc(e.apply.next)}</p>
        <br>
        <p>${esc(e.signoff)}</p>
        <p>${esc(e.team)}</p>
        </div>
      `,
    });

    return { success: true, code: "sent" };
  } catch (error) {
    console.error("Error submitting volunteer application:", error);
    return { success: false, code: "failed" };
  }
}
