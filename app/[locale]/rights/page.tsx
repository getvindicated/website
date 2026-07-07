import {
  PageHero,
  FadeUp,
  Divider,
  SectionTitle,
  InfoBox,
  Button,
} from "@/components/ui";
import { RightsPhoneDemo } from "@/components/sections/RightsPhoneDemo";
import { getRouteMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "rights", "/rights", "/preview.webp");
}

export default function RightsPage() {
  return (
    <>
      <PageHero
        kicker=""
        title={
          <>
            Know your rights
            <br />
            <em>before you sign.</em>
          </>
        }
        subtitle="Federal and California laws protect you from discrimination and deceptive practices at dealerships. Here is what every buyer should know."
      />

      {/* Federal Laws */}
     <FadeUp>
  <section
    className="px-20 py-16 max-md:px-6"
    style={{ background: "var(--color-bg-surface)", margin: 0 }}
  >
    <SectionTitle className="mb-6">
      Try It <em>Yourself.</em>
    </SectionTitle>
    <p className="text-base text-white leading-[1.7] max-w-[680px] mb-10">
      A preview of the mobile app version of this page: tell it your state, then scroll through the laws that actually apply to you.
    </p>
    <div className="flex justify-center">
      <RightsPhoneDemo />
    </div>
  </section>
</FadeUp>

      <Divider />

      {/* Bottom CTA */}
      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <InfoBox label="Remember">
            <p className="mb-3">
              <strong className="text-white">
                You do not need to be a lawyer to use these laws.
              </strong>{" "}
              Simply knowing they exist changes the power dynamic. If a dealer
              refuses to provide written disclosures, that itself is a red flag.
            </p>
            <p>
              If you believe your rights have been violated, you can file a
              complaint with the{" "}
              <strong className="text-white">
                Consumer Financial Protection Bureau (CFPB)
              </strong>
              , the{" "}
              <strong className="text-white">
                Federal Trade Commission (FTC)
              </strong>
              , or the{" "}
              <strong className="text-white">
                California Department of Motor Vehicles (DMV)
              </strong>
              .
            </p>
          </InfoBox>

          <div className="flex gap-4 mt-10 flex-wrap">
            <Button href="/fraud">Spot the Red Flags</Button>
            <Button href="/inspection" variant="outline">
              Pre-Purchase Inspection Guide
            </Button>
          </div>
        </section>
      </FadeUp>
    </>
  );
}
