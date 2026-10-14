// Sends one email through Brevo's transactional API (POST /v3/smtp/email).
// Every email the site sends goes through here: board invites,
// announcements and submissions, and the volunteer and contact forms.
//
// Each call gives up after EMAIL_TIMEOUT_MS, so a slow or blocked request
// ends in an error instead of leaving the page waiting.

export const EMAIL_TIMEOUT_MS = 15_000;

// Thrown when Brevo doesn't answer in time. Callers stop sending the rest
// of a batch on this, since the next call would most likely hang too.
export class EmailTimeoutError extends Error {
	constructor() {
		super(`The email service didn't answer within ${EMAIL_TIMEOUT_MS / 1000} seconds.`);
		this.name = "EmailTimeoutError";
	}
}

type Person = { email: string; name: string };

export async function sendEmail({
	subject,
	to,
	cc,
	htmlContent,
	textContent,
	sender,
	replyTo,
	attachment,
}: {
	subject: string;
	to: Person[];
	cc?: Person[];
	htmlContent: string;
	textContent?: string;
	sender: { name: string; email: string };
	replyTo?: Person;
	// Base64 content; Brevo picks the content type from the name's extension.
	attachment?: { name: string; content: string }[];
}) {
	const apiKey = process.env.BREVO_API_KEY?.trim();
	if (!apiKey) {
		throw new Error("BREVO_API_KEY is missing");
	}

	let res: Response;
	try {
		res = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
			body: JSON.stringify({
				sender,
				to,
				...(cc && cc.length > 0 && { cc }),
				...(replyTo && { replyTo }),
				subject,
				htmlContent: `<html><body>${htmlContent}</body></html>`,
				...(textContent && { textContent }),
				...(attachment && attachment.length > 0 && { attachment }),
			}),
			signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
		});
	} catch (error) {
		if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
			console.error("Brevo Error: timed out", { subject });
			throw new EmailTimeoutError();
		}
		console.error("Brevo Error:", error instanceof Error ? error.message : error);
		throw error;
	}

	const body = await res.json().catch(() => null);
	if (!res.ok) {
		const message = (body && typeof body.message === "string" && body.message) || `HTTP ${res.status}`;
		console.error("Brevo Error:", res.status, body);
		throw new Error(`Brevo rejected the email: ${message}`);
	}
	return body as { messageId?: string } | null;
}
