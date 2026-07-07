"use server";

import { sendEmail } from "@/lib/brevo";

interface VolunteerFormData {
  name: string;
  email: string;
  chapter: string;
  role: string;
  hours: number;
  location: string;
  background: string;
  why: string;
  student: string;
}

// Chapter value -> who should get the notification email.
// Values must match the CHAPTERS options in app/[locale]/volunteer/page.tsx
// ("ucla", "ucberkeley", "ucsc").
const CHAPTER_RECIPIENTS: Record<string, { email: string; name: string }[]> = {
  ucla: [{ email: "getvindicated@outlook.com", name: "Rana Darwich" }],
  ucberkeley: [
    { email: "halimacherif@berkeley.edu", name: "Halima Cherif Hminat" },
    { email: "azzafar@berkeley.edu", name: "Ameerah Zafar" },
  ],
  ucsc: [
    { email: "asvinod@ucsc.edu", name: "Ashwin Vinod" },
    { email: "gsambee@ucsc.edu", name: "Gundeep Sambee" },
  ],
};

export async function submitVolunteerApplication(data: VolunteerFormData) {
  try {
    if (!data.name || !data.email || !data.role) {
      return { success: false, message: "Name, email, and role are required." };
    }

    // Falls back to the UCLA/Rana inbox for any unrecognized chapter value
    // so an application never silently goes nowhere.
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
      htmlContent: `
        <h2>New Volunteer Application</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Chapter:</strong> ${data.chapter}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Hours per week:</strong> ${data.hours}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Student/Recent Grad:</strong> ${data.student}</p>
        <p><strong>Background:</strong></p>
        <p>${data.background.replace(/\n/g, "<br>")}</p>
        <p><strong>Why VINdicated:</strong></p>
        <p>${data.why.replace(/\n/g, "<br>")}</p>
      `,
    });

    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [{ email: data.email, name: data.name }],
      subject: "We've received your volunteer application - VINdicated",
      htmlContent: `
        <p>Hi ${data.name.split(" ")[0] || "there"},</p>
        <p>Thank you for your interest in volunteering with VINdicated! We have received your application for the <strong>${data.role}</strong> role and will review it shortly.</p>
        <p>We'll be in touch within a few days.</p>
        <br>
        <p>Best regards,</p>
        <p>The VINdicated Team</p>
      `,
    });

    return { success: true, message: "Your application has been submitted successfully! Check your inbox for a confirmation email." };
  } catch (error) {
    console.error("Error submitting volunteer application:", error);
    return { success: false, message: "Failed to submit application. Please try again or email us directly at getvindicated@outlook.com." };
  }
}
