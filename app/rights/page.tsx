import type { Metadata } from "next";
import {
  PageHero,
  FadeUp,
  Divider,
  SectionLabel,
  SectionTitle,
  Accordion,
  InfoBox,
  Button,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Know Your Rights",
  description:
    "Know your legal rights as a car buyer. Federal and California laws protect you from discrimination and deceptive practices at dealerships.",
  openGraph: {
    title: "Know Your Rights",
    description:
      "Know your legal rights as a car buyer. Federal and California laws protect you from discrimination and deceptive practices at dealerships.",
    url: "/rights",
    type: "website",
    images: [
      {
        url: "/illus-woman-dealership.png",
        alt: "VINdicated: Know Your Rights",
      },
    ],
  },
  twitter: {
    title: "Know Your Rights",
    description:
      "Know your legal rights as a car buyer. Federal and California laws protect you from discrimination and deceptive practices at dealerships.",
  },
};

export default function RightsPage() {
  return (
    <>
      <PageHero
        kicker="Legal Protection"
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
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <SectionLabel>Federal Protections</SectionLabel>
          <SectionTitle className="mb-3">
            Laws that apply <em>nationwide.</em>
          </SectionTitle>
          <p className="text-base text-white/70 leading-[1.7] max-w-[680px] mb-4">
            These federal laws protect every car buyer in every state. You do not
            need a lawyer to invoke them &mdash; you just need to know they
            exist.
          </p>

          <Accordion
            items={[
              {
                trigger: "The Truth in Lending Act (TILA)",
                defaultOpen: true,
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      The dealer must show you the full cost of the loan before
                      you agree to anything.
                    </p>
                    <p className="text-white/80">
                      The Truth in Lending Act requires the dealer to give you
                      details about financing your car. These details include the{" "}
                      <strong className="text-white">total amount</strong> of
                      money you will have to pay, including fees and interest,
                      expressed as a yearly rate (APR) and an overall total.
                    </p>
                    <p className="text-white/80">
                      The dealer must provide a TILA disclosure when or before
                      you sign your contract. If you do not get one, or if it
                      does not match exactly what the dealer tells you, that is a
                      red flag. Tell the dealer you will not sign until you
                      receive full written disclosures as required by federal
                      law. Some dealers may try to use hidden fees or say
                      &ldquo;we&apos;ll finalize that later.&rdquo; Under TILA,
                      they cannot. You can file a complaint with the Consumer
                      Financial Protection Bureau (CFPB) for a TILA violation.
                    </p>
                  </div>
                ),
              },
              {
                trigger: "The FTC Used Car Rule",
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Dealers must put a Buyers Guide on every used car that
                      says whether the car is under warranty or not.
                    </p>
                    <p className="text-white/80">
                      The Used Car Rule requires the Buyers Guide to be clearly
                      visible and state whether the dealer is selling the car
                      &ldquo;as is&rdquo; (meaning you pay full repair costs) or
                      with a warranty (the dealer pays for some repairs). The
                      dealer must disclose how long the warranty lasts and which
                      repairs are covered. The dealer must also give you a copy
                      of the Buyers Guide at the time of sale, which you should
                      review to make sure it matches the contract.
                    </p>
                    <p className="text-white/80">
                      If there is no Buyers Guide on the car (usually a window
                      sticker), tell the dealer you need to review the Buyers
                      Guide before you agree to anything. If your car needs
                      repairs, you will want to know how much the dealer will
                      cover. The FTC can fine dealers up to{" "}
                      <strong className="text-white">
                        $50,000 per car
                      </strong>{" "}
                      without an accurate Buyers Guide.
                    </p>
                  </div>
                ),
              },
              {
                trigger: "The Odometer Law",
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      The dealer must tell you the car&apos;s true mileage in
                      writing.
                    </p>
                    <p className="text-white/80">
                      The Odometer Law requires the dealer to provide a written{" "}
                      <strong className="text-white">
                        odometer disclosure statement
                      </strong>{" "}
                      at the time of sale, which must say whether the mileage the
                      car displays is accurate. A car listed at 50,000 miles
                      might be worth thousands more than a car listed at 100,000
                      miles, so demand a signed mileage disclosure if the dealer
                      does not provide one or if you suspect it might be
                      inaccurate.
                    </p>
                    <p className="text-white/80">
                      Odometer fraud is a{" "}
                      <strong className="text-white">federal crime</strong> with
                      potential prison time as a consequence. You can also get
                      more than $10,000 in a lawsuit. Importantly, the Odometer
                      Law requires dealer disclosure; it does{" "}
                      <strong className="text-white">not</strong> guarantee the
                      mileage is correct, or that past owners didn&apos;t hide
                      anything. It&apos;s good to check vehicle history reports
                      to verify.
                    </p>
                  </div>
                ),
              },
              {
                trigger: "The Fair Credit Reporting Act (FCRA)",
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      The dealer must tell you how your credit report affected
                      the terms of your loan.
                    </p>
                    <p className="text-white/80">
                      The FCRA requires the dealer to tell you if your credit
                      report (your borrowing history) was used to determine your
                      rate and, if so, give you a written explanation of how your
                      credit report affected the decision, called an{" "}
                      <strong className="text-white">
                        adverse action notice
                      </strong>
                      . The dealer must also tell you which credit bureau
                      (Equifax, Experian, or TransUnion) was used.
                    </p>
                    <p className="text-white/80">
                      Ask the dealer whether your credit report was used to
                      determine the rate. If yes, ask for the adverse action
                      notice and the credit bureau used. If the rate seems high,
                      you can ask what specific part of your credit is affecting
                      it. You can report a violation to the CFPB.
                    </p>
                  </div>
                ),
              },
              {
                trigger: "The Equal Credit Opportunity Act (ECOA)",
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Dealers cannot treat you differently based on race, gender,
                      or national origin.
                    </p>
                    <p className="text-white/80">
                      Under the ECOA, a dealer must apply the same standards to
                      all applicants and consider each application individually.
                      If something feels off, request a written explanation of
                      how your rate was determined. You can sue for damages to
                      enforce the ECOA, and government agencies can also demand
                      civil penalties or restitution (payment to you from the
                      dealer to make up for being wrongly charged).
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </section>
      </FadeUp>

      <Divider />

      {/* California Laws */}
      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <SectionLabel>California Protections</SectionLabel>
          <SectionTitle className="mb-3">
            If you buy in California, <em>you have more.</em>
          </SectionTitle>
          <p className="text-base text-white/70 leading-[1.7] max-w-[680px] mb-4">
            California has some of the strongest consumer protection laws in the
            country. These apply on top of every federal protection listed above.
          </p>

          <Accordion
            items={[
              {
                trigger:
                  "California Car Buyer's Bill of Rights (AB 68)",
                defaultOpen: true,
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Dealers must disclose add-ons, keep your interest rate
                      reasonable, and allow independent inspection.
                    </p>
                    <p className="text-white/80">
                      Under the Car Buyer&apos;s Bill of Rights, dealers can
                      only increase your interest rate by a certain amount
                      (depending on the length of the loan). They must show the
                      price of every{" "}
                      <strong className="text-white">optional product</strong>{" "}
                      separately and, for some used cars, must include a 2-day
                      cancellation option. You also have the{" "}
                      <strong className="text-white">right</strong> to have the
                      car independently inspected before you buy it.
                    </p>
                    <p className="text-white/80">
                      A dealer might, for example, tell you the car needs $3,000
                      in add-ons and try to convince you to buy them all.
                      However, many of the add-ons are optional in reality. In
                      California, you can ask for an itemized list of the
                      add-ons, and the dealer must give it to you.
                    </p>
                  </div>
                ),
              },
              {
                trigger: "California Civil Code § 2981.9",
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Everything you agree to must be in one written contract.
                    </p>
                    <p className="text-white/80">
                      Civil Code Section 2981.9 requires the dealer to put all
                      terms in a single written agreement and give you a copy of
                      it. The dealer cannot make you agree to something verbally
                      or on the side;{" "}
                      <strong className="text-white">everything</strong> you
                      agree to must, by law, be in this contract.
                    </p>
                    <p className="text-white/80">
                      If the dealer promises you something verbally, ask them to
                      include it in the contract before you sign. For example, a
                      dealer might tell you &ldquo;we&apos;ll fix any issues for
                      free,&rdquo; but as soon as you sign the contract, go back
                      on their word. This law fixes that problem.
                    </p>
                  </div>
                ),
              },
              {
                trigger: "California Consumers Legal Remedies Act (CCLRA)",
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      A dealer cannot use deception or misrepresentation when
                      selling anything.
                    </p>
                    <p className="text-white/80">
                      The CCLRA requires the dealer to accurately tell you the
                      price, condition, and features of the car. The dealer
                      cannot hide important information that they know could
                      affect your decision. If you see any changes that look
                      weird, or that you can&apos;t explain, ask the dealer to
                      explain why it&apos;s different from what you were told, or
                      show you{" "}
                      <strong className="text-white">
                        where that is stated in writing
                      </strong>
                      . Remember, everything you agree to must be in writing. You
                      can sue for damages or to force changes to your contract.
                    </p>
                  </div>
                ),
              },
              {
                trigger: "California Vehicle Code § 11713",
                body: (
                  <div className="space-y-4">
                    <p
                      className="text-[1.05rem] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Dealers cannot lie, mislead you, or use deception when
                      selling a car.
                    </p>
                    <p className="text-white/80">
                      Under California Vehicle Code § 11713, dealers can&apos;t
                      advertise cars they don&apos;t have, change the price or
                      terms later, hide a car&apos;s history, or keep ads up
                      after a car is sold. They also can&apos;t add fake fees or
                      say &ldquo;no down payment&rdquo; if that isn&apos;t true.
                    </p>
                    <p className="text-white/80">
                      They <em>can</em> sell cars, advertise deals, and offer
                      financing, but everything has to be real, available, and
                      clearly explained before you agree to anything.
                    </p>
                  </div>
                ),
              },
            ]}
          />
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
