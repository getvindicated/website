// Who an announcement is for ("Send to" on the announcement form). The same
// rules pick who it's emailed to and which members see it on the hub.
// Shared by the server and the browser.

export type Audience =
  | { kind: "everyone" }
  | { kind: "leads" }
  | { kind: "hubAdmins" }
  | { kind: "teams"; teams: string[] }
  | { kind: "people"; ids: number[] };

export const EVERYONE: Audience = { kind: "everyone" };

type Person = { id: number; team: string; alsoTeam: string | null; tier: number | null; isLead: boolean; hubAdmin: boolean };

// Leads are everyone marked Lead plus the top two rows of the chart.
export function inAudience(m: Person, a: Audience): boolean {
  switch (a.kind) {
    case "everyone":
      return true;
    case "leads":
      return m.isLead || m.tier === 0 || m.tier === 1;
    case "hubAdmins":
      return m.hubAdmin;
    case "teams":
      return a.teams.includes(m.team) || (!!m.alsoTeam && a.teams.includes(m.alsoTeam));
    case "people":
      return a.ids.includes(m.id);
  }
}

// Checks an audience sent by the form. Returns null if it isn't one.
export function checkAudience(v: unknown): Audience | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (o.kind === "everyone" || o.kind === "leads" || o.kind === "hubAdmins") return { kind: o.kind };
  if (o.kind === "teams") {
    const teams = Array.isArray(o.teams) ? [...new Set(o.teams.filter((t): t is string => typeof t === "string" && t.length <= 100))] : [];
    return teams.length && teams.length <= 50 ? { kind: "teams", teams } : null;
  }
  if (o.kind === "people") {
    const ids = Array.isArray(o.ids) ? [...new Set(o.ids.filter((n): n is number => Number.isInteger(n) && n > 0))] : [];
    return ids.length && ids.length <= 300 ? { kind: "people", ids } : null;
  }
  return null;
}

// Reads the stored value. Announcements from before "Send to" only had
// "admins only", which is now Hub admins.
export function parseAudience(raw: unknown, adminsOnly = false): Audience {
  let a: Audience | null = null;
  try {
    a = checkAudience(typeof raw === "string" ? JSON.parse(raw) : raw);
  } catch {
    a = null;
  }
  if (adminsOnly && (!a || a.kind === "everyone")) return { kind: "hubAdmins" };
  return a ?? EVERYONE;
}

const and = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

// "Everyone", "Leads only", "Hub admins", "Data and Design teams", "Picked people".
export function audienceLabel(a: Audience): string {
  switch (a.kind) {
    case "everyone":
      return "Everyone";
    case "leads":
      return "Leads only";
    case "hubAdmins":
      return "Hub admins";
    case "teams":
      return `${and(a.teams)} ${a.teams.length === 1 ? "team" : "teams"}`;
    case "people":
      return "Picked people";
  }
}
