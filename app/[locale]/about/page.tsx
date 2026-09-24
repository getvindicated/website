import Image from "next/image";
import {
  PageHero,
  FadeUp,
  SectionTitle,
  Pullquote,
} from "@/components/ui";
import { WollstonecraftQuotes } from "@/components/sections/WollstonecraftQuotes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/config";
import type { AboutTextSegment } from "@/lib/i18n/dictionary";

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


// stage 0 = Educate (key), 1 = Empower (spark), 2 = Vindicate (road)
function IgnitionIcon({ stage }: { stage: number }) {
  if (stage === 0) {
    return (
      <svg
        viewBox="0 0 44 44"
        width={40}
        height={40}
        className="ignition-key flex-shrink-0"
        aria-hidden="true"
      >
        <circle
          cx="14"
          cy="22"
          r="8"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
        />
        <circle cx="14" cy="22" r="3" fill="var(--color-accent)" />
        <line
          x1="21"
          y1="22"
          x2="38"
          y2="22"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="30"
          y1="22"
          x2="30"
          y2="28"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="22"
          x2="35"
          y2="27"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (stage === 1) {
    return (
      <svg
        viewBox="0 0 44 44"
        width={40}
        height={40}
        className="ignition-spark flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d="M24 4 L10 25 H19 L16 40 L34 17 H24 L27 4 Z"
          fill="var(--color-accent)"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 44 44"
      width={40}
      height={40}
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <polygon
        points="4,40 40,40 27,8 17,8"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />
      <line
        x1="22"
        y1="12"
        x2="22"
        y2="36"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeDasharray="5 5"
        className="ignition-road-dash"
      />
    </svg>
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
            <div>
              {pillars.map(({ word, body }, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[320px_1fr] gap-6 py-10 items-start max-md:grid-cols-1"
                >
                  <div className="flex items-center gap-4 flex-wrap min-w-0">
                    <IgnitionIcon stage={i} />
                    <h3
                      className="text-[clamp(1.8rem,3.2vw,2.6rem)] tracking-[-0.02em] leading-[1]"
                      style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
                    >
                      {word}
                    </h3>
                  </div>
                  <p className="text-[1.05rem] text-white leading-[1.75] pt-1">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Berkeley chapter */}
      <FadeUp>
        <section className="px-20 py-16 max-md:px-6 max-md:py-10">
          <div className="max-w-[1400px] mx-auto">
            <Image
              src="/berkeley-team.jpg"
              alt="VINdicated's UC Berkeley chapter team"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-lg"
              style={{
                maxHeight: "480px",
                objectFit: "cover",
              }}
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
                <div
                  key={num}
                  className="border-l-2 pl-6"
                  style={{ borderColor: "var(--color-accent)" }}
                >
                  <p
                    className="text-[0.75rem] uppercase tracking-[0.15em] mb-2"
                    style={{ color: "var(--color-accent)" }}
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

            {/* Pullquote */}
            <div className="mt-16">
              <Pullquote
                size="large"
                quote={d.story.pullquote.quote}
                cite={d.story.pullquote.attribution}
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
              <Image
                src="/1775831920674.jpeg"
                alt="VINdicated volunteers tabling on a college campus, sharing free car-buying resources with students"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto rounded-lg"
                style={{
                  maxHeight: "480px",
                  objectFit: "cover",
                }}
              />
            </div>
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
