import * as brevo from "@getbrevo/brevo";

// initialize once
const apiInstance = new brevo.TransactionalEmailsApi();
if (process.env.BREVO_API_KEY) {
    apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
    );
}

export async function sendEmail({
    subject,
    to,
    htmlContent,
    sender,
    replyTo,
}: {
    subject: string;
    to: { email: string; name: string }[];
    htmlContent: string;
    sender: { name: string; email: string };
    replyTo?: { email: string; name: string };
}) {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is missing");
    }

    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = subject;
    smtpEmail.to = to;
    smtpEmail.htmlContent = `<html><body>${htmlContent}</body></html>`;
    smtpEmail.sender = sender;
    if (replyTo) smtpEmail.replyTo = replyTo;

    // return promise directly, or catch and log then throw
    try {
        return await apiInstance.sendTransacEmail(smtpEmail);
    } catch (error: any) {
        console.error("Brevo Error:", error.response?.body || error.message);
        throw error;
    }
}