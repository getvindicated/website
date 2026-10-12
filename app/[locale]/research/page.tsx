import Link from "next/link";
import { TRACKS, applyHref } from "@/components/sections/research/projects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import "../../minimal.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "research", "/research");
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).researchPage;
  const joinHref = localizeHref(locale as Locale, "/join");

  return (
    <div className="rd rd-page mn">
      <div className="mn-col">
        <h1>{d.hero.title}</h1>
        <p className="mn-lead">{d.hero.body}</p>
        <nav aria-label={d.navLabel}>
          <ul>
            {TRACKS.map((t) => (
              <li key={t.key}>
                <a href={`#${t.key}`}>{d.tracks[t.key].title}</a>
              </li>
            ))}
          </ul>
        </nav>

        {TRACKS.map((track) => {
          const copy = d.tracks[track.key];
          return (
            <section key={track.key} id={track.key}>
              <h2>{copy.title}</h2>
              <p>{copy.body}</p>
              {track.projects.map((meta, i) => {
                const project = copy.projects[i];
                return (
                  <div key={project.name}>
                    <h3>{project.name}</h3>
                    {meta.chapter && <p className="mn-meta">{d.chapters[meta.chapter]}</p>}
                    <p>{project.desc}</p>
                    <p>
                      <strong>{d.skillsLabel}:</strong> {project.skills.join(", ")}
                    </p>
                    <p>
                      <strong>{d.membersLabel}:</strong> {project.members}
                    </p>
                    <p>
                      <Link href={applyHref(joinHref, meta)}>{project.join}</Link>
                    </p>
                  </div>
                );
              })}
            </section>
          );
        })}

        <h2>{d.cta.title}</h2>
        <p>{d.cta.body}</p>
        <div className="mn-links">
          <Link className="mn-btn" href={`${joinHref}#apply`}>
            {d.cta.button}
          </Link>
        </div>
      </div>
    </div>
  );
}
