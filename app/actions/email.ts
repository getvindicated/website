"use server";

import { sendEmail } from "@/lib/brevo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/lib/i18n/config";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
import { isBot, rateLimiter } from "@/lib/spam-guard";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  // The topic as the visitor saw it, for their copy of the message.
  topicLabel?: string;
  message: string;
  // Hidden honeypot field; real visitors leave it blank. Named to look
  // like an ordinary form field so it isn't obviously a trap.
  company?: string;
}

// 5 messages per IP per 10 minutes.
const limited = rateLimiter(10 * 60 * 1000, 5);

// Returns a result code; the form shows the matching message in the
// visitor's language, and their copy of the message is in that language.
export async function submitContactForm(
  data: ContactFormData,
  locale = "en",
): Promise<{ success: boolean; code: "sent" | "missing" | "tooMany" | "failed" }> {
  try {
    if (!data.email || !data.message) {
      return { success: false, code: "missing" };
    }

    // Bots fill in the honeypot. Report success without sending anything,
    // so the bot has no signal that it was caught.
    if (isBot(data.company ?? "")) {
      return { success: true, code: "sent" };
    }

    if (await limited("contact")) {
      return { success: false, code: "tooMany" };
    }

    const topicLabel = data.topic || "General Inquiry";

    // 1. Send notification to admin (getvindicated@outlook.com)
    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [{ email: "getvindicated@outlook.com", name: "VINdicated Team" }],
      subject: `New Contact Form Submission: ${topicLabel}`,
      replyTo: { email: data.email, name: `${data.firstName} ${data.lastName}`.trim() },
      htmlContent: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Topic:</strong> ${topicLabel}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // 2. Send auto-response to the user, in the language they used
    const e = (await getDictionary((isValidLocale(locale) ? locale : "en") as Locale)).joinPage.emails;
    const first = data.firstName || e.friend;
    // Some languages leave `friend` empty and just drop the name.
    const hi = first ? e.hi.replace("{name}", first) : e.hi.replace(/[\s,،]*\{name\}/, "");
    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [{ email: data.email, name: `${data.firstName} ${data.lastName}`.trim() }],
      subject: e.contact.subject,
      htmlContent: `
        <div dir="${locale === "fa" || locale === "ar-EG" ? "rtl" : "ltr"}">
        <p>${esc(hi)}</p>
        <p>${esc(e.contact.body).replace("{topic}", `<strong>${esc(data.topicLabel || topicLabel)}</strong>`)}</p>
        <p>${esc(e.contact.copy)}</p>
        <blockquote style="border-left: 4px solid #eee; padding-left: 10px; margin-left: 0; color: #555;">
          ${esc(data.message).replace(/\n/g, "<br>")}
        </blockquote>
        <br>
        <p>${esc(e.signoff)}</p>
        <p>${esc(e.team)}</p>
        </div>
      `,
    });

    return { success: true, code: "sent" };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, code: "failed" };
  }
}