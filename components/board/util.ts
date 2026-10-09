"use client";

// Small helpers shared by the /board client components.

// Parses YYYY-MM-DD as a local calendar date (no time-zone shift).
export const D = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const fmt = (s: string, o: Intl.DateTimeFormatOptions) => D(s).toLocaleDateString("en-US", o);

export const daysBetween = (from: string, to: string) => Math.round((D(to).getTime() - D(from).getTime()) / 864e5);

export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Calls a /board API route. Returns an error message, or null on success.
export async function api(path: string, method: string, body?: unknown): Promise<string | null> {
  try {
    const res = await fetch(path, {
      method,
      headers: body instanceof FormData ? undefined : { "content-type": "application/json" },
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.ok) return null;
    const j = await res.json().catch(() => null);
    return (j && typeof j.error === "string" && j.error) || "Something went wrong. Try again.";
  } catch {
    return "Couldn't reach the server. Check your connection and try again.";
  }
}
