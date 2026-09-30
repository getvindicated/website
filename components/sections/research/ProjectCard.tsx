import Link from "next/link";
import type { ResearchPageDict } from "@/lib/i18n/dictionary";
import { applyHref, type ProjectMeta } from "./projects";

type ProjectCopy =
  ResearchPageDict["tracks"]["app"]["projects"][number];

export function ProjectCard({
  copy,
  meta,
  dict,
  joinHref,
}: {
  copy: ProjectCopy;
  meta: ProjectMeta;
  dict: ResearchPageDict;
  joinHref: string;
}) {
  return (
    <article className="proj">
      <div className="proj-head">
        {meta.chapter ? (
          <span className="tag">{dict.chapters[meta.chapter]}</span>
        ) : (
          <span />
        )}
        <span className="tag sev-easy">{dict.status}</span>
      </div>
      <h3>{copy.name}</h3>
      <p className="proj-desc">{copy.desc}</p>
      <div className="proj-meta">
        <div className="proj-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={dict.skillsLabel}>
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />
          </svg>
          <ul className="chips-sm">
            {copy.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="proj-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={dict.membersLabel}>
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a3 3 0 1 0 0-6M21 20c0-2.6-1.6-4.8-4-5.6" />
          </svg>
          <div>
            <b>{copy.members}</b>
            <div className="seats" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <i
                  key={i}
                  className={
                    i < meta.filled
                      ? "f"
                      : i < meta.filled + meta.range
                        ? "r"
                        : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Link className="btn btn-solid proj-btn" href={applyHref(joinHref, meta)}>
        {copy.join}
      </Link>
    </article>
  );
}
