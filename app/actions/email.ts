"use server";

import { sendEmail } from "@/lib/brevo";
import { isBot, rateLimiter } from "@/lib/spam-guard";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  message: string;
  // Hidden honeypot field; real visitors leave it blank. Named to look
  // like an ordinary form field so it isn't obviously a trap.
  company?: string;
}

// 5 messages per IP per 10 minutes.
const limited = rateLimiter(10 * 60 * 1000, 5);

export async function submitContactForm(data: ContactFormData) {
  try {
    if (!data.email || !data.message) {
      return { success: false, error: "Email and message are required." };
    }

    // Bots fill in the honeypot. Report success without sending anything,
    // so the bot has no signal that it was caught.
    if (isBot(data.company ?? "")) {
      return { success: true };
    }

    if (await limited("contact")) {
      return { success: false, error: "Too many messages from here. Please wait a few minutes and try again." };
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

    // 2. Send auto-response to the user
    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [{ email: data.email, name: `${data.firstName} ${data.lastName}`.trim() }],
      subject: "We've received your message - VINdicated",
      htmlContent: `
        <p>Hi ${data.firstName || "there"},</p>
        <p>Thank you for reaching out to VINdicated! We have received your message regarding "<strong>${topicLabel}</strong>" and will get back to you as soon as possible.</p>
        <p>Here is a copy of your message:</p>
        <blockquote style="border-left: 4px solid #eee; padding-left: 10px; margin-left: 0; color: #555;">
          ${data.message.replace(/\n/g, "<br>")}
        </blockquote>
        <br>
        <p>Best regards,</p>
        <p>The VINdicated Team</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "Failed to send message. Please try again later." };
  }
}