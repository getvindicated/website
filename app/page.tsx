import type { Metadata } from "next";
import Image from "next/image";
import {
  PageHero,
  FadeUp,
  Divider,
  SectionTitle,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "VINdicated was founded by Rana Darwich after experiencing dealership discrimination firsthand. Learn about our mission to educate, empower, and vindicate car buyers.",
  openGraph: {
    title: "About Us",
    description:
      "VINdicated was founded by Rana Darwich after experiencing dealership discrimination firsthand. Learn about our mission to educate, empower, and vindicate car buyers.",
    url: "/about",
    type: "website",
    images: [{ url: "/illus-woman-dealership.png", alt: "VINdicated: About Us" }],
  },
  twitter: {
    title: "About Us",
    description:
      "VINdicated was founded by Rana Darwich after experiencing dealership discrimination firsthand. Learn about our mission to educate, empower, and vindicate car buyers.",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker=""
        title={
          <>
            Built on the belief that car knowledge
            <br />
            <em>should be public knowledge.</em>
          </>
        }
        subtitle="VINdicated exists because we do not believe women should have to bring male protection just to buy a car safely."
      />

      {/* Why We Exist */}
      <FadeUp>
        <section id="why" className="px-12 py-24 max-md:px-6 max-md:py-16">
  <div
    className="grid grid-cols-[1fr_1fr] gap-12 items-start max-w-[1400px] mx-auto max-lg:grid-cols-1"
  >
            <div>
             <SectionTitle
  style={
    { fontSize: "clamp(1.8rem,3vw,2.6rem)" } as React.CSSProperties
  }
>
                The discrimination
                <br />
                is <em>measurable.</em>
                <br />
                The harm is real.
              </SectionTitle>
              <p className="text-[0.78rem] text-white leading-[1.6] mt-4 max-w-[340px]">
                Ayres, I. &amp; Siegelman, P. (1995).
                <br />
                <em>The American Economic Review, 85</em>(3), 304-321.
              </p>
            </div>
            <div className="space-y-5 text-[1.1rem] leading-[1.8] text-white">
              <p>
                Research by Ian Ayres and Peter Siegelman found that{" "}
                <strong className="text-white">
                  Black male car buyers were quoted prices averaging $1,100
                  higher
                </strong>{" "}
                than white male buyers for identical cars, even when using
                identical bargaining scripts. Black women were quoted $410 more
                than white men. White women were quoted $92 more than white men.
              </p>
              <p>
                <strong className="text-white">
                  48% of Gen Z women feel discouraged from visiting a dealership
                </strong>{" "}
                due to concern about gender-based discrimination (Morning
                Consult for Caribou, 2022). This isn&apos;t paranoia. This is pattern
                recognition.
              </p>
              <p>
                Dealers made racist or sexist comments in{" "}
                <strong className="text-white">4% of test visits</strong>. They
                spent{" "}
                <strong className="text-white">
                  13% longer negotiating with &quot;minority&quot; testers
                </strong>
                .
              </p>
              <p>And we&apos;re done pretending it&apos;s isolated incidents.</p>
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
            Educate. Empower. <em>Vindicate.</em>
          </h2>
          <p className="text-[0.88rem] text-white leading-[1.5] max-w-[620px] mb-8">
            To dismantle consumer-level escort culture, one informed buyer at a
            time.
          </p>
          <div style={{ borderTop: "1px solid var(--color-border)" }}>
            {[
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
            ].map(({ word, body }) => (
              <div
                key={word}
                className="grid grid-cols-[240px_1fr] gap-6 py-10 max-md:grid-cols-1"
                style={{
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <h3
                  className="text-[clamp(2rem,4vw,3rem)] tracking-[-0.02em] leading-[1]"
                  style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
                >
                  {word}
                </h3>
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
            <em>Vindicated from what?</em>
          </SectionTitle>
          <p className="text-[1.05rem] text-white leading-[1.7] max-w-[680px] mb-14">
            Three strikes. Three completely different situations. The same
            system every time.
          </p>

          {/* Strikes as timeline */}
          <div style={{ borderTop: "1px solid var(--color-border)" }}>
            {[
              {
                num: "01",
                label: "The Pink Slip Scam",
                body: [
                  "At 18, I was trying to buy a car from my friend\u2019s dad. He made me wait three months, promising the whole time to sell it to me.",
                  "When the time finally came, he tried to tell me I didn\u2019t need the pink slip. He was trying to scam me. Without the title in your name, the car is not legally yours, no matter what you paid.",
                ],
              },
              {
                num: "02",
                label: "Facebook Marketplace",
                body: [
                  "I tried buying a car on Facebook Marketplace. The conversation started normally with mileage, price, when I could come look.",
                  "As soon as he found out I was female, the tone shifted completely. He told me, \u201CShut your mouth, bitch,\u201D and blocked me.",
                ],
              },
              {
                num: "03",
                label: "South Coast Mitsubishi",
                body: [
                  "I showed up to test drive a car alone. When I came back with my sister to buy it, it suddenly read: \u201CBuy today or lose it.\u201D",
                  "Then I paid for an independent inspection. They found issues. They handed me a financing contract at 30% APR. I know what a bad deal is. I didn\u2019t sign.",
                ],
              },
            ].map(({ num, label, body }) => (
              <div
                key={num}
                className="grid grid-cols-[60px_200px_1fr] gap-6 max-md:gap-3 py-10 max-md:py-8 max-md:grid-cols-1"
                style={{
                  borderBottom: "1px solid var(--color-border)",
                }}
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
                  {body.map((p, i) => (
                    <p
                      key={i}
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
          <div
            className="my-16 max-w-[720px] rounded-2xl px-8 py-7 max-md:px-5"
            style={{
              background: "rgba(149,51,165,0.06)",
              border: "1px solid var(--color-border)",
            }}
          >
            <blockquote
              className="text-[clamp(1.2rem,2.5vw,1.8rem)] italic leading-[1.5] mb-4"
              style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
            >
              I reported Eddy. When the GM called to apologize, I said: I do not accept your apology. I hope whether a 19-year-old girl or a 50-year-old man walks in, you will treat everyone with respect.
            </blockquote>
            <p
              className="text-[0.9rem] font-bold"
              style={{ color: "var(--color-light)" }}
            >
              Rana Darwich, Founder of VINdicated
            </p>
          </div>

          {/* Bio + Wollstonecraft, two columns */}
          <div
            className="grid grid-cols-[1fr_1fr] gap-12 max-lg:grid-cols-1"
          >
            <div>
              <p
                className="text-[0.85rem] font-bold mb-4"
                style={{ color: "var(--color-accent)" }}
              >
                About the Founder
              </p>
              <p className="text-[1.05rem] leading-[1.75] text-white mb-5">
                Rana Darwich founded VINdicated at 19 after almost signing
				a predatory arbitration clause at a dealership.
              </p>
              <p className="text-[1.15rem] font-semibold">
                Now, it&apos;s your turn.
              </p>
            </div>
            <div
              className="rounded-2xl px-8 py-7 max-md:px-5"
              style={{
                background: "rgba(149,51,165,0.06)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                className="text-[0.85rem] font-bold mb-4"
                style={{ color: "var(--color-accent)" }}
              >
                Mary Wollstonecraft, 1792
              </p>
             <p
                className="text-[clamp(1.2rem,2vw,1.5rem)] italic leading-[1.5]"
                style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
              >
                &quot;Strengthen the female mind by enlarging it, and there will be
                an end to blind obedience.&quot;
              </p>
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
            Free. Accessible.
            <br />
            <em>No strings attached.</em>
          </SectionTitle>
          <p className="text-base text-white leading-[1.7] max-w-[680px] mb-14">
            Everything VINdicated offers is free. No signup required, no upsell,
            no catch.
          </p>
          <div style={{ borderTop: "1px solid var(--color-border)" }}>
            {[
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
            ].map(({ title, body }) => (
              <div
                key={title}
                className="py-10"
                style={{
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <h3 className="text-[clamp(1.4rem,2.5vw,1.8rem)] leading-[1.2] tracking-[-0.01em] mb-3">
                    {title}
                  </h3>
                  <p className="text-[1rem] text-white leading-[1.7] max-w-[560px]">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>
    </>
  );
}
