// Non-translatable project data. Copy lives in researchPage.tracks in the
// dictionaries, in the same order as the arrays here.

export type TrackKey = "app" | "data" | "research" | "outreach";
export type ChapterKey = "ucla" | "berkeley" | "ucsc";
// Matches the role <select> values on the Get Involved form.
export type RoleKey =
  | "research"
  | "data"
  | "software"
  | "outreach"
  | "legal"
  | "design";

export type ProjectMeta = {
  chapter?: ChapterKey;
  role: RoleKey;
  // Seats shown as dots: `filled` guaranteed, `range` more possible, out of 10.
  filled: number;
  range: number;
};

export const TRACKS: { key: TrackKey; projects: ProjectMeta[] }[] = [
  {
    key: "app",
    projects: [
      { role: "software", filled: 2, range: 2 },
      { role: "software", filled: 2, range: 2 },
    ],
  },
  {
    key: "data",
    projects: [
      { role: "data", filled: 5, range: 0 },
      { chapter: "berkeley", role: "data", filled: 5, range: 0 },
      { chapter: "berkeley", role: "data", filled: 5, range: 0 },
    ],
  },
  {
    key: "research",
    projects: [
      { chapter: "ucla", role: "research", filled: 4, range: 2 },
      { chapter: "ucla", role: "research", filled: 4, range: 2 },
      { chapter: "ucla", role: "legal", filled: 6, range: 4 },
    ],
  },
  {
    key: "outreach",
    projects: [
      { role: "design", filled: 2, range: 1 },
      { role: "outreach", filled: 2, range: 1 },
      { role: "outreach", filled: 3, range: 2 },
    ],
  },
];

export function applyHref(joinHref: string, meta: ProjectMeta) {
  const q = new URLSearchParams();
  if (meta.chapter) q.set("chapter", meta.chapter);
  q.set("role", meta.role);
  return `${joinHref}?${q}#apply`;
}
