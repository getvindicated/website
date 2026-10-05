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
    <article className="card proj">
      {meta.chapter && (
        <p className="proj-chapter">{dict.chapters[meta.chapter]}</p>
      )}
      <h3>{copy.name}</h3>
      <p className="proj-desc">{copy.desc}</p>
      <dl className="proj-meta">
        <div>
          <dt>{dict.skillsLabel}</dt>
          <dd>{copy.skills.join(", ")}</dd>
        </div>
        <div>
          <dt>{dict.membersLabel}</dt>
          <dd>{copy.members}</dd>
        </div>
      </dl>
      <Link className="btn btn-line proj-btn" href={applyHref(joinHref, meta)}>
        {copy.join}
      </Link>
    </article>
  );
}
