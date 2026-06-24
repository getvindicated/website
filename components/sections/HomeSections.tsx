import Image from "next/image";
import Link from "next/link";
import {
  FadeUp,
  SectionLabel,
  SectionTitle,
  CardGrid,
  Button,
} from "@/components/ui";

const pillars = [
  {
    kicker: "Education",
    title: "Pre-Purchase Inspection Guide",
    body: "A step-by-step walkthrough of everything you should check, ask, and verify before handing over a dollar. Written for first-time buyers.",
    href: "/inspection",
    label: "Read the Guide",
    accent: "var(--color-light)",
  },
  {
    kicker: "Protection",
    title: "Fraud Prevention",
    body: "Real tactics used against buyers, named, explained, and countered. Know exactly what to say when a dealer tries to pressure you.",
    href: "/fraud",
    label: "Spot the Red Flags",
    accent: "var(--color-red)",
  },
];

export function HomeCards() {
  return (
    <FadeUp>
      <section className="px-20 py-24 max-md:px-6 max-md:py-16">
        <SectionLabel>What We Do</SectionLabel>
        <SectionTitle
          style={{ fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties}
        >
          Two pillars of <em>automotive justice.</em>
        </SectionTitle>

        <div className="mt-14 space-y-0" style={{ borderTop: "1px solid var(--color-border)" }}>
          {pillars.map((p) => (
            <Link
              key={p.kicker}
              href={p.href}
              className="group grid grid-cols-[720px_1fr_auto] gap-8 py-12 no-underline transition-colors duration-200 max-md:grid-cols-1"
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <h3 className="text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.15] tracking-[-0.01em] mb-3 group-hover:text-[var(--color-accent)] transition-colors duration-200">
                  {p.title}
                </h3>
                <p className="text-[1rem] text-white/70 leading-[1.7] max-w-[560px]">
                  {p.body}
                </p>
              </div>
              <span
                className="text-[0.75rem] font-medium pt-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-md:opacity-100"
                style={{ color: "var(--color-accent)" }}
              >
                {p.label} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </FadeUp>
  );
}

export function HomeQuote() {
  return (
    <FadeUp>
      <section className="px-20 py-24 text-center max-md:px-6 max-md:py-16">
        <SectionLabel>A Vindication of the Rights of Woman</SectionLabel>
        <blockquote
          className="text-[clamp(1.6rem,3vw,2.6rem)] italic leading-[1.35] max-w-[800px] mx-auto mb-8"
          style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
        >
          &quot;Why should woman be kept in ignorance under the specious name of
          innocence?&quot;
        </blockquote>
        <cite
          className="not-italic text-[clamp(2.8rem,5vw,4.5rem)] font-semibold tracking-[-0.02em] block mb-2"
          style={{ fontFamily: "var(--font-heading), Georgia, serif", color: "var(--color-accent)" }}
        >
          Mary Wollstonecraft
        </cite>
        <p className="text-[0.95rem] italic">
          A Vindication of the Rights of Woman (1792)
        </p>
      </section>
    </FadeUp>
  );
}

export function HomeFounder() {
  return (
    <FadeUp>
      <div
        className="grid grid-cols-[1fr_1fr] items-center overflow-hidden max-lg:grid-cols-1"
      >
        <div className="px-20 py-16 max-lg:px-6">
          <SectionLabel>From the Founder</SectionLabel>
          <SectionTitle>
            Founded at 19.
            <br />
            <em>Out of necessity.</em>
          </SectionTitle>
          <p className="text-base text-white leading-[1.75] mt-5 mb-4">
            Three strikes at three different dealerships showed me the same
            thing: the system is designed to confuse you, rush you, and profit
            off what you don&apos;t know.
          </p>
          <p className="text-base text-white leading-[1.75] mb-7">
            VINdicated exists because{" "}
            <strong>I wish it had existed for me.</strong>
          </p>
          <Button href="/about">Read Rana&apos;s Full Story</Button>
        </div>
      </div>
    </FadeUp>
  );
}
