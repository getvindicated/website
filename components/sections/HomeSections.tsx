import Image from "next/image";
import Link from "next/link";
import {
  FadeUp,
  SectionTitle,
  Button,
} from "@/components/ui";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { HomeDict } from "@/lib/i18n/home-dict";

const fallbackPillars = [
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

export function HomeCards({ locale, dict }: { locale: Locale; dict?: HomeDict }) {
  const pillars = fallbackPillars.map((p, i) => ({
    ...p,
    kicker: dict?.cards?.pillars?.[i]?.kicker ?? p.kicker,
    title: dict?.cards?.pillars?.[i]?.title ?? p.title,
    body: dict?.cards?.pillars?.[i]?.body ?? p.body,
    label: dict?.cards?.pillars?.[i]?.label ?? p.label,
  }));

  return (
    <FadeUp>
      <section className="px-20 py-24 max-md:px-6 max-md:py-16">
        <div className="max-w-[1400px] mx-auto">
        <SectionTitle
          style={{ fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties}
        >
          {dict?.cards?.titlePrefix ?? "Two pillars of"}{" "}
          <em>{dict?.cards?.titleEm ?? "automotive justice."}</em>
        </SectionTitle>

        <div
          className="mt-14 grid grid-cols-2 gap-x-16 max-md:grid-cols-1"
          style={{
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {pillars.map((p, i) => (
            <FadeUp key={p.kicker} style={{ transitionDelay: `${i * 150}ms` }}>
              <Link
                href={localizeHref(locale, p.href)}
                className="group flex flex-col gap-3 py-12 no-underline transition-transform duration-300 ease-out hover:-translate-y-1 max-md:py-8 max-md:border-b max-md:last:border-b-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h3 className="text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.15] tracking-[-0.01em] group-hover:text-[var(--color-accent)] transition-colors duration-300">
                  {p.title}
                </h3>
                <p className="text-[1rem] text-white leading-[1.7]">
                  {p.body}
                </p>
                <span
                  className="text-[0.75rem] font-medium pt-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-md:opacity-100"
                  style={{ color: "var(--color-accent)" }}
                >
                  {p.label}{" "}
                  <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </FadeUp>
          ))}
        </div>
        </div>
      </section>
    </FadeUp>
  );
}

export function HomeQuote({ dict }: { dict?: HomeDict }) {
  return (
    <section className="px-20 py-24 text-center max-md:px-6 max-md:py-16">
      <div className="max-w-[1400px] mx-auto">
      <FadeUp>
        <blockquote
          className="text-[clamp(1.6rem,3vw,2.6rem)] italic leading-[1.35] max-w-[800px] mx-auto mb-8"
          style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
        >
          &quot;
          {dict?.quote?.text ??
            "Why should woman be kept in ignorance under the specious name of innocence?"}
          &quot;
        </blockquote>
      </FadeUp>
      <FadeUp style={{ transitionDelay: "150ms" }}>
        <cite
          className="not-italic text-[clamp(2.8rem,5vw,4.5rem)] font-semibold tracking-[-0.02em] block mb-2"
          style={{ fontFamily: "var(--font-heading), Georgia, serif", color: "var(--color-accent)" }}
        >
          {dict?.quote?.cite ?? "Mary Wollstonecraft"}
        </cite>
      </FadeUp>
      <FadeUp style={{ transitionDelay: "300ms" }}>
        <p className="text-[0.95rem] italic">
          {dict?.quote?.source ?? "A Vindication of the Rights of Woman (1792)"}
        </p>
      </FadeUp>
      </div>
    </section>
  );
}

export function HomeFounder({ locale, dict }: { locale: Locale; dict?: HomeDict }) {
  return (
    <section className="px-20 py-24 max-md:px-6 max-md:py-16">
      <div className="grid grid-cols-[1fr_340px] gap-16 items-center max-w-[1400px] mx-auto max-lg:grid-cols-1 max-lg:gap-10">
      <div>
        <FadeUp>
          <SectionTitle>
            {dict?.founder?.titleLine1 ?? "Founded at 19."}
            <br />
            <em>{dict?.founder?.titleEm ?? "Out of necessity."}</em>
          </SectionTitle>
        </FadeUp>
        <FadeUp style={{ transitionDelay: "120ms" }}>
          <p className="text-base text-white leading-[1.75] mt-5 mb-4 max-w-[600px]">
            {dict?.founder?.body1 ??
              "Three strikes at three different dealerships showed me the same thing: the system is designed to confuse you, rush you, and profit off what you don't know."}
          </p>
          <p className="text-base text-white leading-[1.75] mb-7 max-w-[600px]">
            {dict?.founder?.body2Prefix ?? "VINdicated exists because "}
            <strong>{dict?.founder?.body2Bold ?? "I wish it had existed for me."}</strong>
          </p>
        </FadeUp>
        <FadeUp style={{ transitionDelay: "240ms" }}>
          <Button href={localizeHref(locale, "/about")}>
            {dict?.founder?.cta ?? "Read Rana's Full Story"}
          </Button>
        </FadeUp>
      </div>
      <FadeUp style={{ transitionDelay: "180ms" }}>
        <div
          className="relative w-full max-w-[340px] mx-auto max-lg:max-w-[260px]"
          style={{ aspectRatio: "1 / 1" }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-surface)",
            }}
          >
            <Image
              src="/team/rana.jpg"
              alt="Rana Darwich, founder of VINdicated"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 260px, 340px"
            />
          </div>
        </div>
      </FadeUp>
      </div>
    </section>
  );
}
