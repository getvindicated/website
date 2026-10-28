// Shared spam defenses for the public forms that send email (contact,
// volunteer application): a honeypot field plus per-IP rate limiting.
// Rate limits are kept in memory, which is enough for one Railway instance
// (same approach as the board login and events RSVP routes).

import { headers } from "next/headers";

export async function clientIp() {
	const h = await headers();
	return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

// A hidden field real visitors never see or fill in. Any value means a bot.
export const isBot = (honeypot: string) => honeypot.trim().length > 0;

export function rateLimiter(windowMs: number, max: number) {
	const recent = new Map<string, { n: number; since: number }>();
	return async function limited(scope: string) {
		const ip = `${scope}:${await clientIp()}`;
		const now = Date.now();
		const r = recent.get(ip);
		if (!r || now - r.since > windowMs) {
			recent.set(ip, { n: 1, since: now });
			return false;
		}
		r.n++;
		return r.n > max;
	};
}
