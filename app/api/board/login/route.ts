import { createSession, roleForPassword, sessionCookie, SESSION_DAYS } from "@/lib/board/session";

// Wrong-password limit per IP: 10 tries per 15 minutes. Kept in memory,
// which is enough for one Railway instance.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const fails = new Map<string, { n: number; since: number }>();

function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && now - rec.since > WINDOW_MS) fails.delete(ip);
  if ((fails.get(ip)?.n ?? 0) >= MAX_FAILS) {
    return Response.json({ error: "Too many tries. Wait 15 minutes and try again." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    /* treated as a wrong password */
  }

  const role = password ? roleForPassword(password) : null;
  const token = role ? createSession(role) : null;
  if (!role || !token) {
    const r = fails.get(ip) ?? { n: 0, since: now };
    fails.set(ip, { n: r.n + 1, since: r.since });
    return Response.json({ error: "That password isn't right." }, { status: 401 });
  }

  fails.delete(ip);
  return Response.json(
    { ok: true },
    { headers: { "set-cookie": sessionCookie(token, SESSION_DAYS * 86400) } },
  );
}
