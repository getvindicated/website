"use server";

import { sendEmail } from "@/lib/brevo";

export interface VolunteerApplicationData {
  name: string;
  email: string;
  role: string;
  hours: number;
  location: string;
  background: string;
  why: string;
  student: string;
}

export async function submitVolunteerApplication(
  data: VolunteerApplicationData
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Send notification to admin (getvindicated@outlook.com)
    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [{ email: "getvindicated@outlook.com", name: "VINdicated Team" }],
      subject: `New Volunteer Application: ${data.role}`,
      replyTo: { email: data.email, name: data.name },
      htmlContent: `
        <h2>New Volunteer Application</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Hours Available per Week:</strong> ${data.hours}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Student / Recent Grad:</strong> ${data.student}</p>
        <p><strong>Relevant Background:</strong></p>
        <p>${data.background.replace(/\n/g, "<br>")}</p>
        <p><strong>Why VINdicated:</strong></p>
        <p>${data.why.replace(/\n/g, "<br>")}</p>
      `,
    });

    // 2. Send confirmation auto-reply to the applicant
    await sendEmail({
      sender: { email: "getvindicated@outlook.com", name: "VINdicated" },
      to: [{ email: data.email, name: data.name }],
      subject: "We've received your application - VINdicated",
      htmlContent: `
        <p>Hi ${data.name || "there"},</p>
        <p>Thank you for applying to volunteer with VINdicated! We have received your application for the <strong>${data.role}</strong> role and will be in touch within a few days.</p>
        <p>Here is a summary of what you submitted:</p>
        <ul>
          <li><strong>Role:</strong> ${data.role}</li>
          <li><strong>Hours available per week:</strong> ${data.hours}</li>
          <li><strong>Location:</strong> ${data.location}</li>
          <li><strong>Student / Recent Grad:</strong> ${data.student}</li>
        </ul>
        <br>
        <p>Best regards,</p>
        <p>The VINdicated Team</p>
      `,
    });

    return { success: true, message: "Application submitted successfully!" };
  } catch (error) {
    console.error("Error submitting volunteer application:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
