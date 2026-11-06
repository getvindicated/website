import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SurveyApp, type Links } from "@/components/sections/survey/SurveyApp";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { isValidLocale, localizeHref, type Locale } from "@/lib/i18n/config";
import { GUIDE, WORDING_APPROVED, cleanSource } from "@/lib/survey/questions";
import { startToken, surveyAdmin, surveyPublic } from "@/lib/survey/server";

// The Car Confidence Survey. Reads the board session cookie (hub admins
// can preview it before launch) and hands out a fresh start time, so it
// renders on every request.
export const dynamic = "force-dynamic";

// Questions about the survey go here (in the consent text).
const CONTACT = "president@getvindicated.org";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = await getRouteMetadata(locale, "survey", "/survey");
  // Kept out of search engines until launch (see BOARD_SETUP.md).
  return surveyPublic() ? meta : { ...meta, robots: { index: false, follow: false } };
}

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const isPublic = surveyPublic();
  if (!isPublic && !surveyAdmin(await headers())) notFound();

  const src = (await searchParams).src;
  const d = (await getDictionary(locale as Locale)).surveyPage;
  const href = (h: string) => localizeHref(locale as Locale, h);
  const links: Links = {
    guides: href("/inspection"),
    events: href("/events"),
    guide: { breakdown: href(GUIDE.breakdown), buying: href(GUIDE.buying), repair: href(GUIDE.repair) },
    share: "https://getvindicated.org/survey",
    shareLabel: "getvindicated.org/survey",
  };

  return (
    <div className="rd rd-page sv-page-wrap">
      {!isPublic && (
        <div className="ev-preview" role="status">
          {d.preview} {d.previewTest}
          {!WORDING_APPROVED && (
            // Admins only, so English: a reminder for whoever launches it.
            <span className="sv-draft"> The question wording is a placeholder until the approved draft is added to lib/survey/questions.ts.</span>
          )}
        </div>
      )}
      <section className="sv-section-wrap">
        <div className="wrap">
          <SurveyApp
            dict={d}
            locale={locale}
            source={cleanSource(Array.isArray(src) ? src[0] : src)}
            started={startToken()}
            email={CONTACT}
            links={links}
          />
        </div>
      </section>
    </div>
  );
}
