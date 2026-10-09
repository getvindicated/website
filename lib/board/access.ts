import { createRemoteJWKSet, jwtVerify } from "jose";
import { roleFor, type BoardRole } from "./roles";

// Cloudflare Access puts a signed JWT on every request it lets through.
// We verify it against the team's public certs and the application's
// audience tag. Anything missing or invalid is treated as "not here":
// callers return 404.

export type BoardUser = { email: string; role: BoardRole };

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function keys(teamDomain: string) {
  jwks ??= createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
  return jwks;
}

// Local development only: `next dev` sets NODE_ENV to "development";
// `next build` and `next start` always run as "production", so this can
// never apply to the deployed site.
function devEmail(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  const e = process.env.BOARD_DEV_EMAIL?.trim();
  return e ? e : null;
}

export async function boardUser(headers: Headers): Promise<BoardUser | null> {
  const dev = devEmail();
  if (dev) {
    // Locally you can test other accounts with a `board-dev-as` cookie
    // (dev only; see README in CLOUDFLARE_ACCESS.md).
    const cookie = headers.get("cookie") ?? "";
    const as = /(?:^|;\s*)board-dev-as=([^;]+)/.exec(cookie)?.[1];
    const email = (as ? decodeURIComponent(as) : dev).trim().toLowerCase();
    return { email, role: roleFor(email) };
  }

  const token = headers.get("cf-access-jwt-assertion");
  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const aud = process.env.CF_ACCESS_AUD?.trim();
  if (!token || !teamDomain || !aud) return null;

  try {
    const { payload } = await jwtVerify(token, keys(teamDomain), {
      issuer: `https://${teamDomain}`,
      audience: aud,
    });
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    if (!email) return null;
    return { email, role: roleFor(email) };
  } catch {
    return null;
  }
}
