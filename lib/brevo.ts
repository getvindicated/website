import { BrevoClient } from "@getbrevo/brevo";

export const brevo = new BrevoClient({
	apiKey: process.env.BREVO_API_KEY!,
});

export async function sendEmail({
    subject,
    to,
    cc,
    htmlContent,
    sender,
    replyTo,
    attachment,
}: {
    subject: string;
    to: { email: string; name: string }[];
    cc?: { email: string; name: string }[];
    htmlContent: string;
    sender: { name: string; email: string };
    replyTo?: { email: string; name: string };
    attachment?: { name: string; content: string }[];
}) {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is missing");
    }

	try {
		return await brevo.transactionalEmails.sendTransacEmail({
			subject,
			to,
			...(cc && cc.length > 0 && { cc }),
			htmlContent: `<html><body>${htmlContent}</body></html>`,
			sender,
			...(replyTo && { replyTo }),
			...(attachment && attachment.length > 0 && { attachment }),
		});
	} catch (error: any) {
		console.error(
			"Brevo Error:",
			error?.response?.body || error?.message
		);
		throw error;
	}
}
