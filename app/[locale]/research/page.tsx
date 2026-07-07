import {
  PageHero,
  FadeUp,
  Divider,
  SectionTitle,
  Button,
} from "@/components/ui";
import { StudyCard } from "@/components/sections/StudyCard";
import { getRouteMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "research", "/research", "/preview.webp");
}

const stats = [
  {
    source: "Ayres & Siegelman (1995)",
    items: [
      {
        num: "$1,100",
        label:
          "Higher average quotes for Black male buyers vs. white male buyers for identical cars and identical scripts.",
      },
      {
        num: "$410",
        label: "Higher average quotes for Black women vs. white men.",
      },
      {
        num: "$92",
        label: "Higher average quotes for white women vs. white men.",
      },
    ],
  },
  {
    source: "Morning Consult for Caribou (2022)",
    items: [
      {
        num: "48%",
        label:
          "Of Gen Z women report feeling discouraged about visiting a dealership due to gender-based discrimination.",
      },
      {
        num: "13%",
        label:
          'Longer negotiations documented for "minority" testers in field experiments.',
      },
      {
        num: "4%",
        label:
          "Of dealership visits included explicit racist or sexist comments from staff.",
      },
    ],
  },
];

export default function ResearchPage() {
  return (
    <>
      <PageHero
        kicker=""
        title={
          <>
            Anecdote isn’t enough.
            <br />
            <em>Data changes policy.</em>
          </>
        }
        subtitle="We're building the empirical foundation for what consumers already know. Our ongoing research documents gender-based and race-based price discrimination in automotive sales rigorously, reproducibly, and publicly."
      />

      {/* Approach */}
      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div
            className="grid grid-cols-[1fr_1fr] gap-20 items-start max-lg:grid-cols-1"
          >
            <div>
              <SectionTitle>
                Correspondence
                <br />
                <em>Audit Studies.</em>
              </SectionTitle>
            </div>
            <div className="space-y-5 text-[1.1rem] leading-[1.8] text-white">
              <p>
                Correspondence audit studies are a gold-standard method in
                discrimination research. We send identically scripted inquiries
                to dealerships, differing only in signals of race, gender, or
                age, and document the responses.
              </p>
              <p>
                This methodology has been used to document discrimination in
                housing, employment, and lending.{" "}
                <strong className="text-white">
                  We&apos;re applying it to automotive retail,
                </strong>{" "}
                one of the largest consumer purchases most Americans make.
              </p>
              <p>
                Our studies are conducted in collaboration with faculty
                researchers at UCLA and follow IRB protocols for human subjects
                research.
              </p>
              <p>
                <strong className="text-white">
                  Because what you can measure, you can prove. And what you can
                  prove, you can change.
                </strong>
              </p>
            </div>
          </div>
        </section>
      </FadeUp>

      <Divider />

      {/* Active Studies */}
      <FadeUp>
        <section id="study1" className="px-20 py-24 max-md:px-6 max-md:py-16">
          <SectionTitle className="mb-12">
            What We&apos;re
            <br />
            <em>Working On Now.</em>
          </SectionTitle>

          {[
            {
              meta: "Study 01: Active Enrollment  |  UCLA Communication Studies  |  Est. Publication 2026",
              title:
                "Gender-Based Price Discrimination in California Automotive Retail: A Correspondence Audit",
              body: "Our primary study examines whether dealerships quote systematically different prices to prospective buyers based on perceived gender. Using matched pairs of identical buyer inquiries, controlling for vehicle model, condition, location, and bargaining script, we are measuring initial price quotes, response rates, time-to-response, and financing terms across a sample of California dealerships.",
              rq: "Do female-presenting buyers receive higher initial price quotes than male-presenting buyers for identical vehicles? Do dealerships respond differently based on perceived buyer gender?",
              tags: [
                "Correspondence Audit",
                "Gender Discrimination",
                "California Dealerships",
                "Active Enrollment",
              ],
            },
            {
              meta: "Study 02: Data Collection  |  UCLA Communication Studies  |  Est. Publication 2026–27",
              title:
                "Intersectionality in Automotive Pricing: Race, Gender, and the Compounding Discount Gap",
              body: "Building on our primary study, this investigation examines whether race and gender interact to produce compounding disadvantages in dealership interactions. Our methodology employs matched testers signaling different race-gender combinations using standardized names, profile photographs, and communication patterns.",
              rq: null,
              tags: [
                "Intersectionality",
                "Race Discrimination",
                "Gender Discrimination",
                "Data Collection",
              ],
            },
          ].map((study) => (
            <StudyCard key={study.title} study={study} />
          ))}
        </section>
      </FadeUp>

      <Divider />

      {/* Evidence Base */}
      <FadeUp>
        <section
          id="study2"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
          style={{ background: "var(--color-bg-surface)", margin: 0 }}
        >
          <SectionTitle className="mb-12">
            What the Research
            <br />
            <em>Already Shows.</em>
          </SectionTitle>

          <div
            className="grid grid-cols-[1fr_1fr] gap-12 max-lg:grid-cols-1"
          >
            {stats.map(({ source, items }) => (
              <div key={source}>
                <p
                  className="text-[0.95rem] mb-5 text-white"
                >
                  {source}: Key Findings
                </p>
                {items.map(({ num, label }) => (
                  <div
                    key={num}
                    className="p-8 mb-[1.5px]"
                    style={{ background: "var(--color-bg-surface)" }}
                  >
                    <p
                      className="text-[2.5rem] font-extrabold leading-[1]"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-light)" }}
                    >
                      {num}
                    </p>
                    <p className="text-[0.93rem] leading-[1.5] mt-2">{label}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      <Divider />

      {/* Sources */}
      <FadeUp>
        <section
          className="px-20 py-16 max-md:px-6"
          style={{ background: "var(--color-bg-page)", margin: 0 }}
        >
          <SectionTitle className="mb-10">
            Sources &amp;
            <br />
            <em>Citations.</em>
          </SectionTitle>
          <div className="flex flex-col gap-6 max-w-[860px]">
            {[
              {
                type: "Peer-Reviewed Study",
                cite: (
                  <>
                    Ayres, I., &amp; Siegelman, P. (1995). Race and gender
                    discrimination in bargaining for a new car.{" "}
                    <em>The American Economic Review, 85</em>(3), 304-321.
                  </>
                ),
                note: "Source of the $1,100 / $410 / $92 figures and the 13% longer negotiation finding. 306 paired audits at Chicago-area dealerships.",
              },
              {
                type: "Survey Report",
                cite: (
                  <>
                    Morning Consult for Caribou. (2022, April 14). Survey: Gen Z
                    women worry about sexism at the car dealership.{" "}
                    <em>Caribou Industry Insights.</em>
                  </>
                ),
                note: "Source of the 48% Gen Z women figure. N = 2,200 U.S. adults, conducted March 24–25, 2022.",
              },
            ].map(({ type, cite, note }) => (
              <div
                key={type}
                className="pl-6"
                style={{ borderLeft: "3px solid var(--color-vivid)" }}
              >
                <p
                  className="text-[0.95rem] font-bold mb-2 text-white"
                >
                  {type}
                </p>
                <p className="text-[0.97rem] leading-[1.7]">{cite}</p>
                <p className="text-[0.85rem] text-white/60 mt-1">{note}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      <Divider />

      {/* Get Involved */}
      <FadeUp>
        <section
          id="get-involved"
          className="px-20 py-24 max-md:px-6 max-md:py-16"
        >
          <div
            className="grid grid-cols-[1fr_1fr] gap-20 items-start max-lg:grid-cols-1"
          >
            <div>
              <SectionTitle>
                Want to
                <br />
                <em>Participate?</em>
              </SectionTitle>
            </div>
            <div className="space-y-5 text-[1.1rem] leading-[1.8] text-white">
              <p>
                Our correspondence audit studies require volunteer testers, which are 
                people willing to submit standardized inquiries to dealerships
                as part of a structured research protocol. All participation is
                remote, anonymous, and involves no financial commitment.
              </p>
              <p>
                If you’re interested in participating in our research,{" "}
                <strong className="text-white">
                  contact us through the form below.
                </strong>{" "}
                We&apos;ll reach out with details about study protocols, IRB
                protections, and how your participation contributes to
                publishable, policy-relevant research.
              </p>
              <Button href="/contact">Express Interest in Participating</Button>
            </div>
          </div>
        </section>
      </FadeUp>
    </>
  );
}
