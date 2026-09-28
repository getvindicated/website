import Image from "next/image";
import {
  PageHero,
  FadeUp,
  SectionTitle,
} from "@/components/ui";
import { WollstonecraftQuotes } from "@/components/sections/WollstonecraftQuotes";
import {
  PhotoCarousel,
  type CarouselPhoto,
} from "@/components/sections/PhotoCarousel";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/config";
import type { AboutTextSegment } from "@/lib/i18n/dictionary";

const berkeleyPhotos: CarouselPhoto[] = [
  {
    src: "/berkeley-team-1.jpg",
    alt: "VINdicated's UC Berkeley chapter team standing arm in arm in front of Doe Library and the Campanile",
    position: "center 65%",
  },
  {
    src: "/berkeley-team-2.jpg",
    alt: "VINdicated's UC Berkeley chapter team posing on the lawn by Doe Library",
    position: "center 60%",
  },
  {
    src: "/berkeley-team-3.jpg",
    alt: "VINdicated's UC Berkeley chapter team making playful poses beneath the Campanile",
    position: "center 75%",
  },
];

const tablingPhotos: CarouselPhoto[] = [
  {
    src: "/ucla-tabling-1.jpg",
    alt: "Two VINdicated volunteers standing beside the UCLA VINdicated display board",
  },
  {
    src: "/ucla-tabling-3.jpg",
    alt: "Students gathering around the VINdicated table at a busy UCLA activities fair",
  },
  {
    src: "/ucla-tabling-4.jpg",
    alt: "A VINdicated volunteer sharing free car-buying resources with a student at UCLA",
  },
];

// Videos live in /public/videos. Add or remove entries here.
// poster = optional still image shown before the video plays.
const videos: { src: string; poster?: string; label: string }[] = [
  {
    src: "/videos/video-1.mp4",
    poster: "/videos/video-1-poster.jpg",
    label: "VINdicated video filmed on the UC Berkeley campus",
  },
  { src: "/videos/video-2.mp4", label: "VINdicated video 2" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "about", "/about");
}

function Segments({ segments }: { segments: AboutTextSegment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="text-white">
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}


export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const d = dict.about;

  const pillars = d.mission.pillars;
  const strikes = d.story.strikes;
  const provideItems = d.provide.items;

  return (
    <>
      <PageHero
        kicker=""
        contained
        title={
          <>
            {d.hero.titlePlain}
            <br />
            <em>{d.hero.titleEm}</em>
          </>
        }
        titleStyle={
          {
            fontSize: "clamp(2.4rem,4vw,4rem)",
            maxWidth: "1100px",
          } as React.CSSProperties
        }
        subtitle={d.hero.subtitle}
      />

      {/* Why We Exist */}
      <FadeUp>
        <section id="why" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div className="max-w-[1400px] mx-auto">
            <SectionTitle
              className="mb-3"
              style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)" } as React.CSSProperties}
            >
              {d.whyWeExist.titleLine1}{" "}
              <em>{d.whyWeExist.titleEm}</em>
              {/*
              <br />
              <em>{d.whyWeExist.titleLine2}</em>
              */}
            </SectionTitle>
            <p className="text-[0.75rem] text-white/60 leading-[1.5] max-w-[600px] mb-10">
              Ayres, I. &amp; Siegelman, P. (1995).{" "}
              <em>The American Economic Review, 85</em>(3), 304-321.
            </p>

            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
              {[d.whyWeExist.para1, d.whyWeExist.para2, d.whyWeExist.para3].map(
                (para, i) => (
                  <div
                    key={i}
                    className="p-8 max-md:p-6 rounded-2xl flex items-center"
                    style={{
                      background: "rgba(149,51,165,0.08)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <p className="text-[1rem] leading-[1.8] text-white">
                      <Segments segments={para} />
                    </p>
                  </div>
                ),
              )}
            </div>

            <p
              className="mt-14 ml-auto text-right text-[clamp(1.2rem,2.2vw,1.6rem)] italic leading-[1.5] max-w-[680px] text-white"
              style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
            >
              {(() => {
                const text = d.whyWeExist.para4;
                const words = text.split(" ");
                const idx = words.findIndex(
                  (w) => w.toLowerCase().replace(/[^a-z']/gi, "") === "done",
                );
                if (idx === -1) return text;
                return (
                  <>
                    {words.slice(0, idx).join(" ")}
                    {idx > 0 && " "}
                    <strong
                      className="font-bold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {words[idx]}
                    </strong>
                    {idx < words.length - 1 && " "}
                    {words.slice(idx + 1).join(" ")}
                  </>
                );
              })()}
            </p>
          </div>
        </section>
      </FadeUp>

      {/* Mission */}
      <FadeUp>
        <section
          id="mission"
          className="relative overflow-hidden px-20 py-24 max-md:px-6 max-md:py-16"
          style={{ background: "var(--color-bg-page)", margin: 0 }}
        >
          <div className="max-w-[1400px] mx-auto">
            <SectionTitle
              className="mb-3"
              style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)" } as React.CSSProperties}
            >
              {d.mission.heading} <em>{d.mission.headingEm}</em>
            </SectionTitle>
            <p className="text-[0.95rem] text-white leading-[1.6] max-w-[600px] mb-10">
              {d.mission.subheading}
            </p>
            <div className="grid grid-cols-[minmax(280px,420px)_1fr] gap-16 items-center max-lg:grid-cols-1 max-lg:gap-10">
              <Image
                src="/berkeley-campanile-team.jpg"
                alt="VINdicated UC Berkeley chapter members posing on the lawn beneath the Campanile"
                width={618}
                height={1080}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="w-full h-auto rounded-lg max-lg:max-h-[520px] max-lg:object-cover max-lg:object-[center_70%]"
              />
              <div className="flex flex-col gap-12">
                {pillars.map(({ word, body }, i) => (
                  <div key={i}>
                    <h3
                      className="text-[clamp(1.8rem,3.2vw,2.6rem)] tracking-[-0.02em] leading-[1] mb-4"
                      style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
                    >
                      {word}
                    </h3>
                    <p className="text-[1.05rem] text-white leading-[1.75] w-[66%] max-md:w-full">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Berkeley chapter */}
      <FadeUp>
        <section className="px-20 py-16 max-md:px-6 max-md:py-10">
          <div className="max-w-[1400px] mx-auto">
            <PhotoCarousel
              photos={berkeleyPhotos}
              label="Photos of VINdicated's UC Berkeley chapter"
            />
          </div>
        </section>
      </FadeUp>

      {/* Founder story */}
      <FadeUp>
        <section id="story" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div className="max-w-[1400px] mx-auto">
            <SectionTitle
              className="mb-3"
              style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)" } as React.CSSProperties}
            >
              {(() => {
                const title = d.story.titleEm;
                const words = title.split(" ");
                const last = words.pop();
                const rest = words.join(" ");
                return (
                  <>
                    {rest}
                    {rest && " "}
                    <em>{last}</em>
                  </>
                );
              })()}
            </SectionTitle>
            <p className="text-[0.95rem] text-white leading-[1.6] max-w-[600px] mb-10">
              {d.story.subtitle}
            </p>

            {/* Strikes, text only */}
            <div className="mt-12 max-md:mt-8 max-w-[800px] flex flex-col gap-12">
              {strikes.map(({ num, label, body }) => (
                <div key={num}>
                  <p
                    className="text-[clamp(1.4rem,2.5vw,1.8rem)] leading-[1.2] text-white mb-2"
                    style={{ fontFamily: '"Times New Roman", Times, serif' }}
                  >
                    Strike {num}
                  </p>
                  <h3
                    className="text-[clamp(1.4rem,2.5vw,1.8rem)] leading-[1.2] tracking-[-0.01em] mb-4"
                    style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
                  >
                    {label}
                  </h3>
                  {(body ?? []).map((p, i) => (
                    <p key={i} className="text-[1rem] text-white leading-[1.75] mb-3">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Tabling photo */}
            <div className="mt-16">
              <Image
                src="/ucla-tabling-2.jpg"
                alt="VINdicated volunteers talking with a UCLA student at their tabling booth"
                width={1024}
                height={576}
                sizes="(max-width: 1400px) 100vw, 1400px"
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: "560px", objectFit: "cover" }}
              />
            </div>

            {/* Wollstonecraft quote carousel
            <div
              className="mt-8 max-w-[680px] rounded-2xl px-8 py-7 max-md:px-5"
              style={{
                background: "rgba(149,51,165,0.08)",
                border: "1px solid var(--color-border)",
              }}
            >
              <WollstonecraftQuotes />
            </div>
            */}

            {/* Real-world presence */}
            <div className="mt-16">
              <PhotoCarousel
                photos={tablingPhotos}
                interval={4500}
                label="Photos of VINdicated tabling at UCLA"
              />
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Videos */}
      <FadeUp>
        <section id="videos" className="px-20 py-16 max-md:px-6 max-md:py-10">
          <div
            className={`max-w-[1400px] mx-auto grid gap-6 ${
              videos.length > 1 ? "grid-cols-2 max-md:grid-cols-1" : "grid-cols-1"
            }`}
          >
            {videos.map((v) => (
              <video
                key={v.src}
                src={v.src}
                poster={v.poster}
                aria-label={v.label}
                controls
                playsInline
                preload="metadata"
                className="w-full h-auto rounded-lg bg-black"
                style={{ maxHeight: "560px" }}
              />
            ))}
          </div>
        </section>
      </FadeUp>

      {/* What we provide */}
      <FadeUp>
        <section
          id="vindicated-from"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <div className="max-w-[1400px] mx-auto">
            <SectionTitle
              className="mb-3"
              style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)" } as React.CSSProperties}
            >
              {d.provide.titlePlain} <em>{d.provide.titleEm}</em>
            </SectionTitle>
            <p className="text-[0.95rem] text-white leading-[1.6] max-w-[600px] mb-10">
              {d.provide.subtitle}
            </p>
            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              {provideItems.map(({ title, body }, i) => (
                <div
                  key={i}
                  className="p-8 max-md:p-6 rounded-2xl"
                  style={{
                    background: "rgba(149,51,165,0.08)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <h3 className="text-[clamp(1.4rem,2.5vw,1.8rem)] leading-[1.2] tracking-[-0.01em] mb-3">
                    {title}
                  </h3>
                  <p className="text-[1rem] text-white leading-[1.7]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeUp>
    </>
  );
}
