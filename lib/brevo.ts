import * as brevo from "@getbrevo/brevo";

// 在函数外部初始化一次即可
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

    // 直接返回 promise，或者在此捕获记录日志后再抛出
    try {
        return await apiInstance.sendTransacEmail(smtpEmail);
    } catch (error: any) {
        console.error("Brevo Error:", error.response?.body || error.message);
        throw error;
    }
}