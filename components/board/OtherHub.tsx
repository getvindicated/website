import type { ChapterConfig } from "@/lib/board/chapters";

// One line for people who opened the other chapter's hub. A plain link, not
// a client-side route change, so the other hub loads with its own sign-in.
export function OtherHub({ chapter }: { chapter: ChapterConfig }) {
  const { prompt, label, path } = chapter.otherHub;
  return (
    <p className="other-hub">
      {prompt}{" "}
      <a className="btn btn-line btn-small" href={path}>
        {label}
      </a>
    </p>
  );
}
