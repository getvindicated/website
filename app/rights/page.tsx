import {
  FadeUp,
  PageHero,
  SectionLabel,
  Button,
} from "@/components/ui";

type CardProps = {
  tag: string;
  title: string;
  summary: string;
  children: React.ReactNode;
};

function LawCard({ tag, title, summary, children }: CardProps) {
  return (
    <div
      className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
      style={{
        background:
          "linear-gradient(180deg, var(--color-bg-surface) 0%, rgba(90,48,105,0.14) 100%)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <span
          className="text-[0.7rem] uppercase tracking-[0.18em] font-bold px-3 py-1 rounded-full"
          style={{
            background: "rgba(124,58,237,0.15)",
            color: "var(--color-light)",
            border: "1px solid var(--color-border)",
          }}
        >
          {tag}
        </span>
      </div>

      <h2 className="text-[1.45rem] font-black leading-tight mb-4">
        {title}
      </h2>

      <div
        className="mb-5 px-5 py-4 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderLeft: "4px solid var(--color-vivid)",
        }}
      >
        <p className="text-[0.98rem] font-semibold text-white">{summary}</p>
      </div>

      <div className="text-[0.97rem] leading-8 text-white/75">{children}</div>
    </div>
  );
}

export default function RightsPage() {
  return (
    <main>
      <PageHero
        kicker="BUYER PROTECTION"
        title={
          <>
            Know Your <em>Rights.</em>
          </>
        }
        subtitle="Laws that protect you before you sign anything."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#federal" variant="primary">
            Federal Laws
          </Button>
          <Button href="#california" variant="outline">
            California Laws
          </Button>
        </div>
      </PageHero>

      <FadeUp>
        <section className="px-20 py-14 max-md:px-6">
          <div
            className="grid gap-[1.5px]"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              background: "var(--color-border)",
            }}
          >
            {[
              ["9+", "Protections Covered"],
              ["Federal", "Nationwide Rights"],
              ["California", "Extra State Protections"],
            ].map(([num, label]) => (
              <div
                key={label}
                className="p-8"
                style={{ background: "var(--color-bg-surface)" }}
              >
                <p
                  className="text-3xl font-black mb-2"
                  style={{ color: "var(--color-accent)" }}
                >
                  {num}
                </p>
                <p className="text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      <FadeUp>
        <section
          id="federal"
          className="px-20 pb-10 max-md:px-6 max-w-6xl mx-auto"
        >
          <SectionLabel>Federal Protections</SectionLabel>

          <div className="grid gap-8">
            <LawCard
              tag="Federal Law"
              title="The Truth in Lending Act (TILA)"
              summary="The dealer must show you the full cost of the loan before you agree to anything."
            >
              <>
                The Truth in Lending Act, which applies nationwide, requires the
                dealer to give you details about financing your car. These
                details include the <strong>total amount</strong> of money you
                will have to pay, including fees and interest, expressed as a
                yearly rate (APR) and an overall total.
                <br />
                <br />
                The dealer must provide a TILA disclosure when or before you
                sign your contract. If you do not get one, or if it does not
                match exactly what the dealer tells you, that is a red flag.
                Tell the dealer you will not sign until you receive full written
                disclosures as required by federal law. Some dealers may try to
                use hidden fees or say “we’ll finalize that later.” Under TILA,
                they cannot. You can file a complaint with the Consumer
                Financial Protection Bureau (CFPB) for a TILA violation.
              </>
            </LawCard>

            <LawCard
              tag="Federal Law"
              title="The Federal Trade Commission (FTC) Used Car Rule"
              summary="Dealers must put a Buyers Guide on every used car that says whether the car is under warranty or not."
            >
              <>
                The Used Car Rule, which applies nationwide, requires the Buyers
                Guide to be clearly visible and state whether the dealer is
                selling the car “as is” (meaning you pay full repair costs) or
                with a warranty (the dealer pays for some repairs). The dealer
                must disclose how long the warranty lasts and which repairs are
                covered. The dealer must also give you a copy of the Buyers
                Guide at the time of sale, which you should review to make sure
                it matches the contract.
                <br />
                <br />
                If there is no Buyers Guide on the car (usually a window
                sticker), tell the dealer you need to review the Buyers Guide
                before you agree to anything. If your car needs repairs, you
                will want to know how much the dealer will cover. The FTC can
                fine dealers up to $50,000 per car without an accurate Buyers
                Guide.
              </>
            </LawCard>

            <LawCard
              tag="Federal Law"
              title="The Odometer Law"
              summary="The dealer must tell you the car’s true mileage in writing."
            >
              <>
                The Odometer Law, which applies nationwide, requires the dealer
                to provide a written <strong>odometer disclosure statement</strong>{" "}
                at the time of sale, which must say whether the mileage the car
                displays is accurate. A car listed at 50,000 miles might be
                worth thousands more than a car listed at 100,000 miles, so
                demand a signed mileage disclosure if the dealer does not
                provide one or if you suspect it might be inaccurate.
                <br />
                <br />
                Odometer fraud is a <strong>federal crime</strong> with
                potential prison time as a consequence. You can also get more
                than $10,000 in a lawsuit. Importantly, the Odometer Law
                requires dealer disclosure; it does <strong>not</strong>{" "}
                guarantee the mileage is correct, or that past owners didn’t
                hide anything. It’s good to check vehicle history reports to
                verify.
              </>
            </LawCard>

            <LawCard
              tag="Federal Law"
              title="The Fair Credit Reporting Act (FCRA)"
              summary="The dealer must tell you how your credit report affected the terms of your loan."
            >
              <>
                The FCRA, which applies nationwide, requires the dealer to tell
                you if your credit report (your borrowing history) was used to
                determine your rate and, if so, give you a written explanation
                of how your credit report affected the decision, called an{" "}
                <strong>adverse action notice</strong>. The dealer must also
                tell you which credit bureau (Equifax, Experian, or TransUnion)
                was used.
                <br />
                <br />
                Ask the dealer whether your credit report was used to determine
                the rate. If yes, ask for the adverse action notice and the
                credit bureau used. If the rate seems high, you can ask what
                specific part of your credit is affecting it. You can report a
                violation to the CFPB.
              </>
            </LawCard>

            <LawCard
              tag="Federal Law"
              title="The Equal Credit Opportunity Act (ECOA)"
              summary="Dealers cannot treat you differently based on race, gender, or national origin."
            >
              <>
                Under the ECOA, which applies nationwide, a dealer must apply
                the same standards to all applicants and consider each
                application individually. If something feels off, request a
                written explanation of how your rate was determined. You can sue
                for damages to enforce the ECOA, and government agencies can
                also demand civil penalties or restitution (payment to you from
                the dealer to make up for being wrongly charged).
              </>
            </LawCard>
          </div>
        </section>
      </FadeUp>

      <FadeUp>
        <section
          id="california"
          className="px-20 py-8 pb-20 max-md:px-6 max-w-6xl mx-auto"
        >
          <SectionLabel>California Protections</SectionLabel>

          <div className="grid gap-8">
            <LawCard
              tag="California Law"
              title="California Car Buyer’s Bill of Rights"
              summary="Dealers must disclose add-ons, keep your interest rate reasonable, and allow independent inspection."
            >
              <>
                Under the Car Buyer’s Bill of Rights, a California law, dealers
                can only increase your interest rate by a certain amount
                (depending on the length of the loan). They must show the price
                of every <strong>optional product</strong> separately and, for
                some used cars, must include a 2-day cancellation option. You
                also have the <strong>right</strong> to have the car
                independently inspected before you buy it. A dealer might, for
                example, tell you the car needs $3,000 in add-ons and try to
                convince you to buy them all. However, many of the add-ons are
                optional in reality. In California, you can ask for an itemized
                list of the add-ons, and the dealer must give it to you.
              </>
            </LawCard>

            <LawCard
              tag="California Law"
              title="California Civil Code § 2981.9"
              summary="Everything you agree to must be in one written contract."
            >
              <>
                Civil Code Section 2981.9, which applies in California, requires
                the dealer to put all terms in a single written agreement and
                give you a copy of it. The dealer cannot make you agree to
                something verbally or on the side; <strong>everything</strong>{" "}
                you agree to must, by law, be in this contract. If the dealer
                promises you something verbally, ask them to include it in the
                contract before you sign. For example, a dealer might tell you
                “we’ll fix any issues for free,” but as soon as you sign the
                contract, go back on their word. This law fixes that problem.
              </>
            </LawCard>

            <LawCard
              tag="California Law"
              title="California Consumers Legal Remedies Act"
              summary="A dealer cannot use deception or misrepresentation when selling anything."
            >
              <>
                The CCLRA, which applies in California, requires the dealer to
                accurately tell you the price, condition, and features of the
                car. The dealer cannot hide important information that they know
                could affect your decision. If you see any changes that look
                weird, or that you can’t explain, ask the dealer to explain why
                it’s different from what you were told, or show you{" "}
                <strong>where that is stated in writing</strong>. Remember,
                everything you agree to must be in writing. You can sue for
                damages or to force changes to your contract.
              </>
            </LawCard>

            <LawCard
              tag="California Law"
              title="California Vehicle Code § 11713"
              summary="Dealers cannot lie, mislead you, or use deception when selling a car."
            >
              <>
                Under <strong>California Vehicle Code § 11713,</strong> dealers
                can’t advertise cars they don’t have, change the price or terms
                later, hide a car’s history, or keep ads up after a car is
                sold. They also can’t add fake fees or say “no down payment” if
                that isn’t true.
                <br />
                <br />
                They <i>can</i> sell cars, advertise deals, and offer
                financing, but everything has to be real, available, and clearly
                explained before you agree to anything.
              </>
            </LawCard>
          </div>
        </section>
      </FadeUp>
    </main>
  );
}