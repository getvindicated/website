import type { ApplyPageDict } from "@/lib/i18n/dictionary";
import type { PublicChapter } from "@/lib/apply/server";

// Each chapter's board applications: "Open until Nov 20", "Open" or
// "Closed". Shown on Get Involved and on /apply.

export function chapterName(dict: ApplyPageDict, id: string) {
  return (dict.chapters as Record<string, string>)[id] ?? id;
}

export function statusLabel(dict: ApplyPageDict, c: PublicChapter, locale: string) {
  if (!c.open) return dict.status.closed;
  if (!c.deadline) return dict.status.open;
  const date = new Date(`${c.deadline}T12:00:00Z`).toLocaleDateString(locale, { month: "short", day: "numeric", timeZone: "UTC" });
  return dict.status.openUntil.replace("{date}", date);
}

export function BoardStatus({ dict, chapters, locale, label }: { dict: ApplyPageDict; chapters: PublicChapter[]; locale: string; label: string }) {
  return (
    <ul className="board-status" aria-label={label}>
      {chapters.map((c) => (
        <li key={c.id}>
          <b>{chapterName(dict, c.id)}</b>
          <span className={`pill ${c.open ? "open" : "closed"}`}>{statusLabel(dict, c, locale)}</span>
        </li>
      ))}
    </ul>
  );
}
