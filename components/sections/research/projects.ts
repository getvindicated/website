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
};

export const TRACKS: { key: TrackKey; projects: ProjectMeta[] }[] = [
  {
    key: "app",
    projects: [
      { role: "software" },
      { role: "software" },
    ],
  },
  {
    key: "data",
    projects: [
      { role: "data" },
      { chapter: "berkeley", role: "data" },
      { chapter: "berkeley", role: "data" },
    ],
  },
  {
    key: "research",
    projects: [
      { chapter: "ucla", role: "research" },
      { chapter: "ucla", role: "research" },
      { chapter: "ucla", role: "legal" },
    ],
  },
  {
    key: "outreach",
    projects: [
      { role: "design" },
      { role: "outreach" },
      { role: "outreach" },
    ],
  },
];

export function applyHref(joinHref: string, meta: ProjectMeta) {
  const q = new URLSearchParams();
  if (meta.chapter) q.set("chapter", meta.chapter);
  q.set("role", meta.role);
  return `${joinHref}?${q}#apply`;
}
