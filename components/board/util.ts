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

// The chapter this page belongs to. One board hub renders per page, and it
// sets this before anything can call the API.
let chapter = "berkeley";
export const setApiChapter = (c: string) => {
  chapter = c;
};
// The name an admin typed for the change log, kept in this browser.
// Self-reported: the log marks it that way.
const actorKey = () => `vin-board-actor-${chapter}`;
export function getActor(): string {
  try {
    return localStorage.getItem(actorKey()) ?? "";
  } catch {
    return "";
  }
}
export function setActor(name: string) {
  try {
    if (name.trim()) localStorage.setItem(actorKey(), name.trim().slice(0, 60));
    else localStorage.removeItem(actorKey());
  } catch {
    /* private mode: not remembered */
  }
}

// Board API routes read the chapter from ?chapter=.
export const chapterUrl = (path: string) => `${path}${path.includes("?") ? "&" : "?"}chapter=${chapter}`;

// Calls a board API route for this page's chapter. Returns an error
// message, or null on success; `data` is the parsed reply.
export async function apiCall(path: string, method: string, body?: unknown): Promise<{ error: string | null; data: Record<string, unknown> | null }> {
  try {
    const actor = getActor();
    const res = await fetch(chapterUrl(path), {
      method,
      headers: {
        ...(body instanceof FormData ? {} : { "content-type": "application/json" }),
        ...(actor ? { "x-board-actor": encodeURIComponent(actor) } : {}),
      },
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
    const j = await res.json().catch(() => null);
    if (res.ok) return { error: null, data: j };
    return { error: (j && typeof j.error === "string" && j.error) || "Something went wrong. Try again.", data: null };
  } catch {
    return { error: "Couldn't reach the server. Check your connection and try again.", data: null };
  }
}

export async function api(path: string, method: string, body?: unknown): Promise<string | null> {
  return (await apiCall(path, method, body)).error;
}

// "Fiona", "Fiona and Will", "Fiona, Will and Rizwaan".
export const listNames = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

// Saves one piece of chapter content (admins). Returns an error or null.
export const saveSetting = (key: string, value: unknown) => api("/api/board/settings", "PUT", { key, value });

// Uploaded photos are served per chapter.
export const photoSrc = (src: string) => (src.startsWith("/api/") ? chapterUrl(src) : src);
