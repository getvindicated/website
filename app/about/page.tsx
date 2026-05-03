import type { Metadata } from "next";
import {
  PageHero,
  FadeUp,
  Divider,
  SectionLabel,
  SectionTitle,
  Pullquote
} from "@/components/ui";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Who We Are"
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
        <section id="why" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <SectionLabel>Why We Exist</SectionLabel>
          <div
            className="grid gap-20 items-start max-lg:grid-cols-1"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <div>
              <SectionTitle
                style={
                  { fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties
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
                <em>The American Economic Review, 85</em>(3), 304–321.
              </p>
            </div>
            <div className="space-y-5 text-[1.1rem] leading-[1.8] text-white/80">
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

      <Divider />

      {/* Mission */}
      <FadeUp>
        <section
          id="mission"
          className="relative overflow-hidden px-20 py-24 max-md:px-6 max-md:py-16"
          style={{ background: "var(--color-bg-page)", margin: 0 }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[35%] pointer-events-none"
            style={{
              backgroundImage: "url('/illus-woman-keys.png')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: 0.18,
            }}
          />
          <SectionLabel>Our Mission</SectionLabel>
          <h2 className="text-[clamp(2.8rem,5vw,5rem)] font-black leading-[0.95] tracking-tight mb-3">
            Educate. Empower. <em>Vindicate.</em>
          </h2>
          <p className="text-[0.82rem] text-white leading-[1.4] max-w-[620px] mb-10">
            To dismantle consumer-level escort culture, one informed buyer at a
            time.
          </p>
          <div
            className="grid gap-12 max-lg:grid-cols-1"
            style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
          >
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
              <div key={word}>
                <p className="text-[clamp(1.6rem,3vw,2.4rem)] font-black mb-3 tracking-tight">
                  {word}
                </p>
                <p className="text-[0.95rem] text-white/85 leading-[1.65]">
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
          <SectionLabel>From the Founder</SectionLabel>
          <SectionTitle className="mb-3">
            <em>Vindicated from what?</em>
          </SectionTitle>
          <p className="text-[1.05rem] text-white/75 leading-[1.7] max-w-[680px] mb-12">
            Three strikes. Three completely different situations. The same
            system every time.
          </p>

          <div
            className="grid gap-16 items-start max-lg:grid-cols-1"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            {/* Strikes */}
            <div className="space-y-8">
              {[
                {
                  label: "Strike 1: The Pink Slip Scam",
                  body: [
                    "At 18, I was trying to buy a car from my friend's dad. He made me wait three months, promising the whole time to sell it to me.",
                    "When the time finally came, he tried to tell me I didn't need the pink slip. He was trying to scam me. Without the title in your name, the car is not legally yours, no matter what you paid.",
                  ],
                },
                {
                  label: "Strike 2: Facebook Marketplace",
                  body: [
                    "I tried buying a car on Facebook Marketplace. The conversation started normally with mileage, price, when I could come look.",
                    'As soon as he found out I was female, the tone shifted completely. He told me, "Shut your mouth, bitch," and blocked me.',
                  ],
                },
                {
                  label:
                    "Strike 3, You're Out: April 2025, South Coast Mitsubishi",
                  body: [
                    'I test drove the car alone. When I came back with my sister to buy it, it suddenly read: "Buy today or lose it."',
                    "I paid for an independent inspection. They found issues. Then they handed me a financing contract at 30% APR. I was paying cash. I took business law. I know what arbitration means. I didn't sign.",
                  ],
                },
              ].map(({ label, body }) => (
                <div
                  key={label}
                  className="p-8"
                  style={{
                    background: "var(--color-bg-page)",
                    borderLeft: "4px solid var(--color-red)",
                  }}
                >
                  <p
                    className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em] mb-3"
                    style={{ color: "var(--color-red)" }}
                  >
                    {label}
                  </p>
                  {body.map((p, i) => (
                    <p
                      key={i}
                      className="text-[0.97rem] leading-[1.75] mb-2 last:mb-0"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-8">
              <Pullquote
                quote="I reported Eddy. When the GM called to apologize, I said: I do not accept your apology. I hope whether a 19-year-old girl or a 50-year-old man walks in, you will treat everyone with respect."
                cite="— Rana Darwich, Founder of VINdicated"
              />
              <div
                className="p-10"
                style={{
                  background: "var(--color-bg-page)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p
                  className="text-[0.78rem] font-bold uppercase tracking-[0.04em] mb-4"
                  style={{ color: "var(--color-accent)" }}
                >
                  About Rana Darwich
                </p>
                <p className="text-[0.97rem] leading-[1.75] mb-4">
                  Founded VINdicated at 19 after a random business law
                  vocabulary word saved her from signing an arbitration clause
                  at a dealership.
                </p>
                <p className="text-[1.05rem] font-bold mt-5">
                  Now, it&apos;s your turn.
                </p>
              </div>
              <div
                style={{
                  borderLeft: "3px solid var(--color-accent)",
                  paddingLeft: "2rem",
                }}
              >
                <p
                  className="text-[0.78rem] font-bold uppercase tracking-[0.04em] mb-3"
                  style={{ color: "var(--color-accent)" }}
                >
                  Mary Wollstonecraft — A Vindication of the Rights of Woman,
                  1792
                </p>
                <p className="text-[1.35rem] italic leading-[1.45] font-semibold">
                  &quot;Strengthen the female mind by enlarging it, and there will be
                  an end to blind obedience.&quot;
                </p>
              </div>
            </div>
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
          <SectionLabel>What We Provide</SectionLabel>
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
          <p className="text-base text-white/70 leading-[1.7] max-w-[680px] mb-12">
            Everything VINdicated offers is free. No signup required, no upsell,
            no catch.
          </p>
          <div
            className="grid gap-[1.5px]"
            style={{
              gridTemplateColumns: "1fr 1fr",
              background: "var(--color-border)",
            }}
          >
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
            ].map(({ cat, title, body }) => (
              <div
                key={cat}
                className="p-10"
                style={{ background: "var(--color-bg-surface)" }}
              >
                <p
                  className="text-[0.72rem] font-bold uppercase tracking-[0.06em] mb-3"
                  style={{ color: "var(--color-accent)" }}
                >
                  {cat}
                </p>
                <h3 className="text-[1.4rem] font-extrabold mb-3 leading-[1.2]">
                  {title}
                </h3>
                <p className="text-[0.95rem] text-white/82 leading-[1.7]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>
    </>
  );
}
