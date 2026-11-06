import type { ChapterConfig } from "@/lib/board/chapters";

// One line for people who opened another chapter's hub. Plain links, not
// client-side route changes, so the other hub loads with its own sign-in.
export function OtherHub({ chapter }: { chapter: ChapterConfig }) {
  const { prompt, links } = chapter.otherHub;
  return (
    <p className="other-hub">
      {prompt}
      {links.map((l) => (
        <span key={l.path}>
          {" "}
          <a className="btn btn-line btn-small" href={l.path}>
            {l.label}
          </a>
        </span>
      ))}
    </p>
  );
}
