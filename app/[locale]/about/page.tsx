import Image from "next/image";
import {
  PageHero,
  FadeUp,
  SectionTitle,
  Pullquote,
} from "@/components/ui";
import { WollstonecraftQuotes } from "@/components/sections/WollstonecraftQuotes";
import { StoryCarousel } from "@/components/sections/StoryCarousel";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localeDict, type Locale } from "@/lib/i18n/config";
import type { AboutDict, AboutTextSegment } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "about", "/about");
}

function Segments({ segments }: { segments?: AboutTextSegment[] }) {
  if (!segments) return null;
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
  const dict = (await getDictionary(locale as Locale)) as { about?: AboutDict };
  const d = localeDict(locale, dict.about) ?? {};

  const pillars = d.mission?.pillars ?? [
    {
      word: "Educate",
      body: "Make car buying understandable. Navigable. We translate the dealer playbook into plain language because knowledge is leverage.",
    },
    {
      word: "Empower",
      body: "Build the confidence to walk in alone, ask the right questions, and walk away when necessary without shame, without needing backup.",
    },
    {
      word: "Vindicate",
      body: "Produce the research that documents what consumers already know. Turn lived experience into data. Turn data into policy change.",
    },
  ];

  const strikes = d.story?.strikes ?? [
    {
      num: "1",
      label: "The Pink Slip Scam",
      body: [
        "At 18, I was trying to buy a car from my friend's dad. He made me wait three months, promising the whole time to sell it to me.",
        "When the time finally came, he tried to tell me I didn't need the pink slip. He was trying to scam me. Without the title in your name, the car is not legally yours, no matter what you paid.",
      ],
    },
    {
      num: "2",
      label: "Facebook Marketplace",
      body: [
        "I tried buying a car on Facebook Marketplace. The conversation started normally with mileage, price, when I could come look.",
        "As soon as he found out I was female, the tone shifted completely. He told me, \"Shut your mouth, bitch,\" and blocked me.",
        "After that, I made a fake Facebook account under the name Randall, and had my brother call sellers on my behalf. I got better deals when they thought they were dealing with a man.",
      ],
    },
    {
      num: "3",
      label: "South Coast Mitsubishi",
      body: [
        "April 2025. I test drove a car alone. When I came back with my sister to buy it, it suddenly read: \"Buy today or lose it.\" I asked for service records. I was told they were in a locked drawer, and the guy with the key wasn't there. They promised a 300-point inspection. Then 150. Then it was back in the locked drawer.",
        "I paid for an independent inspection at a Toyota dealership. They found issues. When I drove back, there was a rattling noise. Eddy told me I broke the car during the test drive.",
        "They handed me a financing contract with 30% APR. I was paying cash. \"Sign this until you bring a cashier's check.\" I asked where it said the contract would be voided. He pointed to an arbitration agreement. I took business law. I know what arbitration means. He got angry. I said, \"I know you're frustrated.\" He said, \"You would be correct,\" and left.",
      ],
    },
  ];

  const provideItems = d.provide?.items ?? [
    {
      cat: "Education",
      title: "Free Automotive Workshops",
      body: "Community-led sessions breaking down what dealers do not want you to know including financing, repairs, and your legal rights on the lot.",
    },
    {
      cat: "Tools",
      title: "Online Resources & Guides",
      body: "Step-by-step inspection guides, red flag checklists, script templates, and financing explainers. Designed for first-time buyers.",
    },
    {
      cat: "Community",
      title: "Vetted Mechanic Network",
      body: "We're building a directory of mechanics vetted by our community: honest mechanics who do not talk down to you, do not upsell you.",
    },
    {
      cat: "Research",
      title: "Correspondence Audit Studies",
      body: "We document discrimination with data. Our ongoing studies quantify gender-based pricing disparities.",
    },
  ];

  return (
    <>
      <PageHero
        kicker=""
        contained
        title={
          <>
            {d.hero?.titlePlain ?? "Built on the belief that car knowledge"}
            <br />
            <em>{d.hero?.titleEm ?? "should be public knowledge."}</em>
          </>
        }
        titleStyle={
          {
            fontSize: "clamp(2.4rem,4vw,4rem)",
            maxWidth: "1100px",
          } as React.CSSProperties
        }
        subtitle={
          d.hero?.subtitle ??
          "VINdicated exists because we do not believe women should have to bring male protection just to buy a car safely."
        }
      />

      {/* Why We Exist */}
      <FadeUp>
        <section id="why" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div className="max-w-[1400px] mx-auto">
            <SectionTitle
              className="mb-3"
              style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)" } as React.CSSProperties}
            >
              {d.whyWeExist?.titleLine1 ?? "The discrimination"}{" "}
              <em>{d.whyWeExist?.titleEm ?? "is measurable."}</em>
              {/*
              <br />
              <em>{d.whyWeExist?.titleLine2 ?? "The harm is real."}</em>
              */}
            </SectionTitle>
            <p className="text-[0.75rem] text-white/60 leading-[1.5] max-w-[600px] mb-10">
              Ayres, I. &amp; Siegelman, P. (1995).{" "}
              <em>The American Economic Review, 85</em>(3), 304-321.
            </p>

            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
              {[d.whyWeExist?.para1, d.whyWeExist?.para2, d.whyWeExist?.para3].map(
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
                const text =
                  d.whyWeExist?.para4 ??
                  "And we're done pretending it's isolated incidents.";
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
              {d.mission?.heading ?? "Educate. Empower."}{" "}
              <em>{d.mission?.headingEm ?? "Vindicate."}</em>
            </SectionTitle>
            <p className="text-[0.95rem] text-white leading-[1.6] max-w-[600px] mb-10">
              {d.mission?.subheading ??
                "To dismantle consumer-level escort culture, one informed buyer at a time."}
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

      {/* Founder story */}
      <FadeUp>
        <section id="story" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div className="max-w-[1400px] mx-auto">
            <SectionTitle
              className="mb-3"
              style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)" } as React.CSSProperties}
            >
              {(() => {
                const title = d.story?.titleEm ?? "Vindicated from what?";
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
              {d.story?.subtitle ??
                "Three strikes. Three completely different situations. The same system every time."}
            </p>

            {/* Strikes as a route timeline */}
            <div className="mt-12 max-md:mt-8 w-[75%] max-md:w-full">
              <StoryCarousel strikes={strikes} />
            </div>

            {/* Pullquote */}
            <div className="mt-16">
              <Pullquote
                size="large"
                quote={
                  d.story?.pullquote?.quote ??
                  "I reported Eddy. When the GM called to apologize, I said, \"I don't accept your apology. I hope whether a 19-year-old girl or a 50-year-old man walks in, you'll treat everyone with respect.\""
                }
                cite={
                  d.story?.pullquote?.attribution ??
                  "Rana Darwich, Founder of VINdicated"
                }
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
              {d.provide?.titlePlain ?? "Free. Accessible."}{" "}
              <em>{d.provide?.titleEm ?? "No strings attached."}</em>
            </SectionTitle>
            <p className="text-[0.95rem] text-white leading-[1.6] max-w-[600px] mb-10">
              {d.provide?.subtitle ??
                "Everything VINdicated offers is free. No signup required, no upsell, no catch."}
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
