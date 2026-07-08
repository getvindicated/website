import Image from "next/image";
import {
  PageHero,
  FadeUp,
  Divider,
  SectionTitle,
} from "@/components/ui";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/config";
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

function RoadDivider() {
  return (
    <div
      aria-hidden="true"
      className="w-full"
      style={{
        height: 4,
        borderRadius: 2,
        background:
          "repeating-linear-gradient(to right, var(--color-accent) 0px, var(--color-accent) 16px, transparent 16px, transparent 32px)",
        opacity: 0.55,
      }}
    />
  );
}

// ── Mirror quote ──────────────────────────────────────────────
// A pill-shaped "rearview mirror" with a small mount stalk above,
// used for the founder pullquote and the Wollstonecraft citation.
function MirrorQuote({
  quote,
  cite,
  quoted = false,
}: {
  quote: string;
  cite?: string;
  quoted?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center" aria-hidden="true">
        <div style={{ width: 3, height: 18, background: "var(--color-border)" }} />
        <div
          className="rounded-full"
          style={{
            width: 9,
            height: 9,
            background: "var(--color-accent)",
            marginTop: -1,
          }}
        />
      </div>
      <blockquote
        className="px-10 py-9 max-md:px-6 max-md:py-7 text-center"
        style={{
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(149,51,165,0.08) 55%)",
          border: "1px solid var(--color-border)",
          marginTop: -1,
        }}
      >
        <p
          className="text-[clamp(1.05rem,2.2vw,1.4rem)] italic leading-[1.5] mb-3"
          style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
        >
          {quoted ? `\u201C${quote}\u201D` : quote}
        </p>
        {cite && (
          <cite
            className="not-italic text-[0.85rem] font-bold"
            style={{ color: "var(--color-light)" }}
          >
            {cite}
          </cite>
        )}
      </blockquote>
    </div>
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
  const d = dict.about ?? {};

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
      num: "01",
      label: "The Pink Slip Scam",
      body: [
        "At 18, I was trying to buy a car from my friend's dad. He made me wait three months, promising the whole time to sell it to me.",
        "When the time finally came, he tried to tell me I didn't need the pink slip. He was trying to scam me. Without the title in your name, the car is not legally yours, no matter what you paid.",
      ],
    },
    {
      num: "02",
      label: "Facebook Marketplace",
      body: [
        "I tried buying a car on Facebook Marketplace. The conversation started normally with mileage, price, when I could come look.",
        "As soon as he found out I was female, the tone shifted completely. He told me, \"Shut your mouth, bitch,\" and blocked me.",
        "After that, I made a fake Facebook account under the name Randall, and had my brother call sellers on my behalf. I got better deals when they thought they were dealing with a man.",
      ],
    },
    {
      num: "03",
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
        title={
          <>
            {d.hero?.titlePlain ?? "Built on the belief that car knowledge"}
            <br />
            <em>{d.hero?.titleEm ?? "should be public knowledge."}</em>
          </>
        }
        subtitle={
          d.hero?.subtitle ??
          "VINdicated exists because we do not believe women should have to bring male protection just to buy a car safely."
        }
      />

      {/* Why We Exist */}
      <FadeUp>
        <section id="why" className="px-12 py-24 max-md:px-6 max-md:py-16">
          <div className="grid grid-cols-[1fr_1fr] gap-12 items-start max-w-[1400px] mx-auto max-lg:grid-cols-1">
            <div>
              <SectionTitle
                style={
                  { fontSize: "clamp(1.8rem,3vw,2.6rem)" } as React.CSSProperties
                }
              >
                {d.whyWeExist?.titleLine1 ?? "The discrimination"}
                <br />
                is <em>{d.whyWeExist?.titleEm ?? "measurable."}</em>
                <br />
                {d.whyWeExist?.titleLine2 ?? "The harm is real."}
              </SectionTitle>
              <p className="text-[0.78rem] text-white leading-[1.6] mt-4 max-w-[340px]">
                Ayres, I. &amp; Siegelman, P. (1995).
                <br />
                <em>The American Economic Review, 85</em>(3), 304-321.
              </p>
            </div>
            <div className="space-y-5 text-[1.1rem] leading-[1.8] text-white">
              <p>
                <Segments segments={d.whyWeExist?.para1} />
              </p>
              <p>
                <Segments segments={d.whyWeExist?.para2} />
              </p>
              <p>
                <Segments segments={d.whyWeExist?.para3} />
              </p>
              <p>
                {d.whyWeExist?.para4 ??
                  "And we're done pretending it's isolated incidents."}
              </p>
            </div>
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
          <h2 className="text-[clamp(2rem,3.5vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.02em] mb-3">
            {d.mission?.heading ?? "Educate. Empower."}{" "}
            <em>{d.mission?.headingEm ?? "Vindicate."}</em>
          </h2>
          <p className="text-[0.88rem] text-white leading-[1.5] max-w-[620px] mb-8">
            {d.mission?.subheading ??
              "To dismantle consumer-level escort culture, one informed buyer at a time."}
          </p>
          <div>
            {pillars.map(({ word, body }, i) => (
              <div
                key={i}
                className="grid grid-cols-[320px_1fr] gap-6 py-10 max-md:grid-cols-1"
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
        </section>
      </FadeUp>

      <Divider />

      {/* Founder story */}
      <FadeUp>
        <section id="story" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <SectionTitle className="mb-3">
            <em>{d.story?.titleEm ?? "Vindicated from what?"}</em>
          </SectionTitle>
          <p className="text-[1.05rem] text-white leading-[1.7] max-w-[680px] mb-14">
            {d.story?.subtitle ??
              "Three strikes. Three completely different situations. The same system every time."}
          </p>

          {/* Strikes as timeline */}
          <div>
            {strikes.map(({ num, label, body }, i) => (
              <div
                key={i}
                className="grid grid-cols-[60px_200px_1fr] gap-6 max-md:gap-3 py-10 max-md:py-8 max-md:grid-cols-1"
              >
                <span
                  className="text-[1rem] font-bold pt-1"
                  style={{ color: "var(--color-red)" }}
                >
                  {num}
                </span>
                <h3
                  className="text-[1.15rem] leading-[1.3] pt-1"
                  style={{ color: "var(--color-red)" }}
                >
                  {label}
                </h3>
                <div className="space-y-3">
                  {body?.map((p, j) => (
                    <p
                      key={j}
                      className="text-[0.97rem] text-white leading-[1.75]"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pullquote */}
          <div className="my-16 max-w-[680px]">
            <span
              aria-hidden="true"
              className="block leading-none mb-2"
              style={{
                fontFamily: "var(--font-heading), Georgia, serif",
                fontSize: "3.5rem",
                color: "var(--color-accent)",
                opacity: 0.5,
              }}
            >
              &ldquo;
            </span>
            <blockquote
              className="text-[clamp(1.3rem,2.8vw,1.9rem)] italic leading-[1.55] mb-5 -mt-6"
              style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
            >
              {d.story?.pullquote?.quote ??
                "I reported Eddy. When the GM called to apologize, I said, \"I don't accept your apology. I hope whether a 19-year-old girl or a 50-year-old man walks in, you'll treat everyone with respect.\""}
            </blockquote>
            <p
              className="text-[0.9rem] font-bold"
              style={{ color: "var(--color-light)" }}
            >
              {d.story?.pullquote?.attribution ??
                "Rana Darwich, Founder of VINdicated"}
            </p>
          </div>

          {/* Bio + Wollstonecraft, two columns */}
          <div className="grid grid-cols-[1fr_1fr] gap-12 max-lg:grid-cols-1">
            <div>
              <p
                className="text-[0.85rem] font-bold mb-4"
                style={{ color: "var(--color-accent)" }}
              >
                {d.story?.bio?.label ?? "About the Founder"}
              </p>
              <p className="text-[1.05rem] leading-[1.75] text-white mb-5">
                {d.story?.bio?.body ??
                  "Rana Darwich founded VINdicated at 19 after almost signing a predatory arbitration clause at a dealership."}
              </p>
              <p className="text-[1.15rem] font-semibold">
                {d.story?.bio?.closingLine ?? "Now, it's your turn."}
              </p>
            </div>
            <div className="flex items-center">
              <MirrorQuote
                quote={
                  d.story?.wollstonecraft?.quote ??
                  "Strengthen the female mind by enlarging it, and there will be an end to blind obedience."
                }
                cite={
                  d.story?.wollstonecraft?.label ?? "Mary Wollstonecraft, 1792"
                }
                quoted
              />
            </div>
          </div>

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
        </section>
      </FadeUp>

      <Divider />

      {/* What we provide */}
      <FadeUp>
        <section
          id="vindicated-from"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <SectionTitle
            className="mb-3"
            style={
              { fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties
            }
          >
            {d.provide?.titlePlain ?? "Free. Accessible."}
            <br />
            <em>{d.provide?.titleEm ?? "No strings attached."}</em>
          </SectionTitle>
          <p className="text-base text-white leading-[1.7] max-w-[680px] mb-14">
            {d.provide?.subtitle ??
              "Everything VINdicated offers is free. No signup required, no upsell, no catch."}
          </p>
          <RoadDivider />
          {provideItems.map(({ title, body }, i) => (
            <div key={i}>
              <div className="py-10">
                <h3 className="text-[clamp(1.4rem,2.5vw,1.8rem)] leading-[1.2] tracking-[-0.01em] mb-3">
                  {title}
                </h3>
                <p className="text-[1rem] text-white leading-[1.7] max-w-[560px]">
                  {body}
                </p>
              </div>
              <RoadDivider />
            </div>
          ))}
        </section>
      </FadeUp>
    </>
  );
}
