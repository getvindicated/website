import type { ReactNode } from "react";
import { PageHero } from "@/components/sections/shared/PageHero";
import { ChecklistArt, CtaBand } from "@/components/sections/shared/CtaBand";
import { TrackNav } from "@/components/sections/research/TrackNav";
import { ProjectCard } from "@/components/sections/research/ProjectCard";
import { EqualFooting } from "@/components/sections/research/EqualFooting";
import { TRACKS, type TrackKey } from "@/components/sections/research/projects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "research", "/research");
}

const TRACK_ICONS: Record<TrackKey, ReactNode> = {
  app: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  data: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  research: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  outreach: (
    <>
      <path d="M3 11l14-6v14L3 13z" />
      <path d="M7 13v5a2 2 0 0 0 4 0v-3" />
    </>
  ),
};

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).researchPage;
  const joinHref = localizeHref(locale as Locale, "/join");

  return (
    <div className="rd rd-page">
      <PageHero title={d.hero.title} body={d.hero.body} />
      <EqualFooting dict={d.footing} />
      <TrackNav
        label={d.navLabel}
        items={TRACKS.map((t) => ({
          key: t.key,
          title: d.tracks[t.key].title,
          count: t.projects.length,
        }))}
      />
      {TRACKS.map((track, ti) => {
        const copy = d.tracks[track.key];
        return (
          <section
            key={track.key}
            id={track.key}
            className={ti % 2 === 0 ? "band" : undefined}
          >
            <div className="wrap">
              <div className="track-head">
                <div className="icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9533A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {TRACK_ICONS[track.key]}
                  </svg>
                </div>
                <div>
                  <h2 className="h2">{copy.title}</h2>
                  <p className="lede">{copy.body}</p>
                </div>
              </div>
              <div className={`projects projects-${track.projects.length}`}>
                {track.projects.map((meta, i) => (
                  <ProjectCard
                    key={copy.projects[i].name}
                    copy={copy.projects[i]}
                    meta={meta}
                    dict={d}
                    joinHref={joinHref}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}
      <CtaBand
        title={d.cta.title}
        body={d.cta.body}
        primary={{ label: d.cta.button, href: `${joinHref}#apply` }}
        art={<ChecklistArt />}
      />
    </div>
  );
}
