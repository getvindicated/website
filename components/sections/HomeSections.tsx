import Image from "next/image";
import {
  FadeUp,
  SectionLabel,
  SectionTitle,
  CardGrid,
  Button,
} from "@/components/ui";

export function HomeCards() {
  return (
    <FadeUp>
      <section className="px-20 py-24 max-md:px-6 max-md:py-16">
        <SectionLabel>What We Do</SectionLabel>
        <SectionTitle
          className="text-[clamp(2.4rem,5vw,4rem)]"
        >
          Three pillars of <em>automotive justice.</em>
        </SectionTitle>
        <CardGrid
          cards={[
            {
              num: "01 - Education",
              title: "Pre-Purchase Inspection Guide",
              body: "Everything you need before handing over a dollar.",
              link: { href: "/inspection", label: "Read the Guide" },
            },
            {
              num: "02 - Protection",
              title: "Fraud Prevention",
              body: "Real tactics used against buyers. Named, explained, and countered.",
              link: { href: "/fraud", label: "Spot the Red Flags" },
            },
            {
              num: "03 - Research",
              title: "Correspondence Audit Studies",
              body: "We're building the evidence base. Because anecdote isn't enough. Data changes policy.",
              link: { href: "/research", label: "See Our Research" },
            },
          ]}
        />
      </section>
    </FadeUp>
  );
}

export function HomeQuote() {
  return (
    <FadeUp>
      <section className="px-20 py-24 text-center max-md:px-6 max-md:py-16">
        <SectionLabel>A Vindication of the Rights of Woman</SectionLabel>
        <blockquote className="text-[clamp(1.6rem,3vw,2.6rem)] italic leading-[1.35] max-w-[800px] mx-auto mb-8">
          &quot;Why should woman be kept in ignorance under the specious name of
          innocence?&quot;
        </blockquote>
        <cite
          className="not-italic text-[clamp(2.8rem,5vw,4.5rem)] font-black tracking-tight block mb-2 text-[var(--color-accent)]"
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
        className="grid grid-cols-2 items-center overflow-hidden"
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
        <Image
          src="/illus-woman-dealership.png"
          alt=""
          width={0}
          height={0}
          sizes="50vw"
          className="w-full h-[420px] object-cover object-top fade-right max-lg:max-h-[260px]"
        />
      </div>
    </FadeUp>
  );
}
