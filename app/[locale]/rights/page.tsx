import {
  PageHero,
  FadeUp,
  SectionTitle,
  InfoBox,
  Button,
} from "@/components/ui";
import { Fragment } from "react";
import { RightsPhoneDemo } from "@/components/sections/RightsPhoneDemo";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "rights", "/rights");
}

export default async function RightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const d = (await getDictionary(locale as Locale)).rightsPage;
  const r = d.remember;
  // "…with the {cfpb}, the {ftc}, or the {dmv}." with the agencies in bold.
  const agencies: Record<string, string> = { cfpb: r.cfpb, ftc: r.ftc, dmv: r.dmv };
  const complaint = r.complaint.split(/(\{\w+\})/).map((part, i) => {
    const name = agencies[part.slice(1, -1)];
    return name ? (
      <strong key={i} className="text-white">
        {name}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    );
  });

  return (
    <>
      <PageHero
        kicker=""
        title={
          <>
            {d.hero.title}
            <br />
            <em>{d.hero.titleEm}</em>
          </>
        }
        subtitle={d.hero.body}
      />

      {/* Federal Laws */}
     <FadeUp>
  <section
    className="px-20 py-16 max-md:px-6"
    style={{ background: "var(--color-bg-surface)", margin: 0 }}
  >
    <SectionTitle className="mb-6">
      {d.tryIt.title} <em>{d.tryIt.titleEm}</em>
    </SectionTitle>
    <p className="text-base text-white leading-[1.7] max-w-[680px] mb-10">
      {d.tryIt.body}
    </p>
    <div className="flex justify-center">
      <RightsPhoneDemo dict={d} />
    </div>
  </section>
</FadeUp>

      {/* Bottom CTA */}
      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <InfoBox label={r.label}>
            <p className="mb-3">
              <strong className="text-white">{r.lead}</strong> {r.body}
            </p>
            <p>{complaint}</p>
          </InfoBox>

          <div className="flex gap-4 mt-10 flex-wrap">
            <Button href={localizeHref(locale as Locale, "/fraud")}>{d.buttons.flags}</Button>
            <Button href={localizeHref(locale as Locale, "/inspection")} variant="outline">
              {d.buttons.inspection}
            </Button>
          </div>
        </section>
      </FadeUp>
    </>
  );
}
