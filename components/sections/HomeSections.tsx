import Image from "next/image";
import Link from "next/link";
import {
  FadeUp,
  SectionTitle,
  Button,
} from "@/components/ui";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { HomeDict } from "@/lib/i18n/home-dict";

// Non-translatable per-card config -- content comes from dict.cards.pillars.
const pillarConfig = [{ href: "/inspection" }, { href: "/fraud" }];

export function HomeCards({ locale, dict }: { locale: Locale; dict: HomeDict }) {
  const pillars = pillarConfig.map((p, i) => ({
    ...p,
    kicker: dict.cards.pillars[i].kicker,
    title: dict.cards.pillars[i].title,
    body: dict.cards.pillars[i].body,
    label: dict.cards.pillars[i].label,
  }));

  return (
    <FadeUp>
      <section className="px-20 py-24 max-md:px-6 max-md:py-16">
        <div className="max-w-[1400px] mx-auto">
        <SectionTitle
          style={{ fontSize: "clamp(2.4rem,5vw,4rem)" } as React.CSSProperties}
        >
          {dict.cards.titlePrefix} <em>{dict.cards.titleEm}</em>
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

// Formerly the Wollstonecraft quote; now a tabling photo.
// Keeps the same props so the home page doesn't need to change.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomeQuote(_props: { dict: HomeDict }) {
  return (
    <section className="px-20 py-24 max-md:px-6 max-md:py-16">
      <div className="max-w-[1400px] mx-auto">
        <FadeUp>
          <Image
            src="/ucla-tabling-2.jpg"
            alt="VINdicated volunteers talking with a UCLA student at their tabling booth"
            width={1024}
            height={576}
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="w-full h-auto rounded-lg"
            style={{ maxHeight: "560px", objectFit: "cover" }}
          />
        </FadeUp>
      </div>
    </section>
  );
}

export function HomeFounder({ locale, dict }: { locale: Locale; dict: HomeDict }) {
  return (
    <section className="px-20 py-24 max-md:px-6 max-md:py-16">
      <div className="grid grid-cols-[1fr_340px] gap-16 items-center max-w-[1400px] mx-auto max-lg:grid-cols-1 max-lg:gap-10">
      <div>
        <FadeUp>
          <SectionTitle>
            {dict.founder.titleLine1}
            <br />
            <em>{dict.founder.titleEm}</em>
          </SectionTitle>
        </FadeUp>
        <FadeUp style={{ transitionDelay: "120ms" }}>
          <p className="text-base text-white leading-[1.75] mt-5 mb-4 max-w-[600px]">
            {dict.founder.body1}
          </p>
          <p className="text-base text-white leading-[1.75] mb-7 max-w-[600px]">
            {dict.founder.body2Prefix}
            <strong>{dict.founder.body2Bold}</strong>
          </p>
        </FadeUp>
        <FadeUp style={{ transitionDelay: "240ms" }}>
          <Button href={localizeHref(locale, "/about")}>
            {dict.founder.cta}
          </Button>
        </FadeUp>
      </div>
      {/* <FadeUp style={{ transitionDelay: "180ms" }}>
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
      </FadeUp> */}
      </div>
    </section>
  );
}
