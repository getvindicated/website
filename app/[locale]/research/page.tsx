import { PageHero } from "@/components/sections/shared/PageHero";
import { CtaBand } from "@/components/sections/shared/CtaBand";
import { TrackNav } from "@/components/sections/research/TrackNav";
import { ProjectCard } from "@/components/sections/research/ProjectCard";
import { PriceIsRightGame } from "@/components/sections/research/PriceIsRightGame";
import { BuildTimeline } from "@/components/sections/research/BuildTimeline";
import { TRACKS } from "@/components/sections/research/projects";
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
              <div className="intro">
                <h2 className="h2">{copy.title}</h2>
                <p className="lede">{copy.body}</p>
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
              {track.key === "data" && (
                <>
                  <PriceIsRightGame dict={d.game} locale={locale} />
                  <BuildTimeline dict={d.timeline} />
                </>
              )}
            </div>
          </section>
        );
      })}
      <CtaBand
        title={d.cta.title}
        body={d.cta.body}
        primary={{ label: d.cta.button, href: `${joinHref}#apply` }}
      />
    </div>
  );
}
