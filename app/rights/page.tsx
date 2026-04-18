import type { Metadata } from "next";

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
    images: [{ url: "/illus-woman-dealership.png", alt: "VINdicated — Know Your Rights" }],
  },
  twitter: {
    title: "Know Your Rights",
    description:
      "Know your legal rights as a car buyer. Federal and California laws protect you from discrimination and deceptive practices at dealerships.",
  },
};

export default function RightsPage() {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Know Your Rights</h1>
  
        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              The Truth in Lending Act (TILA)
            </h2>
            <p className="font-medium mb-2">
              The dealer must show you the full cost of the loan before you agree to anything.
            </p>
            <p className="text-sm text-gray-300">
            The Truth in Lending Act, which applies nationwide, requires the dealer to give you 
            details about financing your car. These details include the **total amount** of money 
            you will have to pay, including fees and interest, expressed as a yearly rate (APR) and an overall total. <br /> <br />

            The dealer must provide a TILA disclosure when or before you sign your contract. If you do not get one, 
            or if it does not match exactly what the dealer tells you, that is a red flag. Tell the dealer you will 
            not sign until you receive full written disclosures as required by federal law. Some dealers may try to 
            use hidden fees or say “we’ll finalize that later.” Under TILA, they cannot. You can file a complaint with 
            the Consumer Financial Protection Bureau (CFPB) for a TILA violation.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              The Federal Trade Commission (FTC) Used Car Rule
            </h2>
            <p className="font-medium mb-2">
              Dealers must put a Buyers Guide on every used car that says whether the car is under warranty or not.
            </p>
            <p className="text-sm text-gray-300">
            The Used Car Rule, which applies nationwide, requires the Buyers Guide to be clearly visible and state 
            whether the dealer is selling the car “as is” (meaning you pay full repair costs) or with a warranty 
            (the dealer pays for some repairs). The dealer must disclose how long the warranty lasts and which repairs 
            are covered. The dealer must also give you a copy of the Buyers Guide at the time of sale, which you should 
            review to make sure it matches the contract. <br /> <br />

            If there is no Buyers Guide on the car (usually a window sticker), tell the dealer you need to review the 
            Buyers Guide before you agree to anything. If your car needs repairs, you will want to know how much the 
            dealer will cover. The FTC can fine dealers up to $50,000 per car without an accurate Buyers Guide.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              The Odometer Law
            </h2>
            <p className="font-medium mb-2">
              The dealer must tell you the car’s true mileage in writing.
            </p>
            <p className="text-sm text-gray-300">
            The Odometer Law, which applies nationwide, requires the dealer to provide a written **odometer disclosure 
            statement** at the time of sale, which must say whether the mileage the car displays is accurate. A car 
            listed at 50,000 miles might be worth thousands more than a car listed at 100,000 miles, so demand a 
            signed mileage disclosure if the dealer does not provide one or if you suspect it might be inaccurate. <br /> <br />

            Odometer fraud is a **federal crime** with potential prison time as a consequence. You can also get more 
            than $10,000 in a lawsuit. Importantly, the Odometer Law requires dealer disclosure; it does **not** 
            guarantee the mileage is correct, or that past owners didn’t hide anything. It’s good to check vehicle 
            history reports to verify.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              The Fair Credit Reporting Act (FCRA)
            </h2>
            <p className="font-medium mb-2">
              The dealer must tell you how your credit report affected the terms of your loan.
            </p>
            <p className="text-sm text-gray-300">
            The FCRA, which applies nationwide, requires the dealer to tell you if your credit 
            report (your borrowing history) was used to determine your rate and, if so, give you 
            a written explanation of how your credit report affected the decision, called an 
            **adverse action notice**. The dealer must also tell you which credit bureau 
            (Equifax, Experian, or TransUnion) was used. <br /> <br />

            Ask the dealer whether your credit report was used to determine the rate. If yes, 
            ask for the adverse action notice and the credit bureau used. If the rate seems 
            high, you can ask what specific part of your credit is affecting it. You can 
            report a violation to the CFPB.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              The Equal Credit Opportunity Act (ECOA)
            </h2>
            <p className="font-medium mb-2">
              Dealers cannot treat you differently based on race, gender, or national origin.
            </p>
            <p className="text-sm text-gray-300">
            Under the ECOA, which applies nationwide, a dealer must apply the same standards 
            to all applicants and consider each application individually. If something feels off, 
            request a written explanation of how your rate was determined. You can sue for 
            damages to enforce the ECOA, and government agencies can also demand civil 
            penalties or restitution (payment to you from the dealer to make up for being wrongly charged).
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              California Car Buyer’s Bill of Rights
            </h2>
            <p className="font-medium mb-2">
              Dealers must disclose add-ons, keep your interest rate reasonable, and allow independent inspection.
            </p>
            <p className="text-sm text-gray-300">
            Under the Car Buyer’s Bill of Rights, a California law, dealers can only increase your interest 
            rate by a certain amount (depending on the length of the loan). They must show the price 
            of every **optional product** separately and, for some used cars, must include a 2-day 
            cancellation option. You also have the **right** to have the car independently inspected before 
            you buy it. A dealer might, for example, tell you the car needs $3,000 in add-ons and try to 
            convince you to buy them all. However, many of the add-ons are optional in reality. In California, 
            you can ask for an itemized list of the add-ons, and the dealer must give it to you.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              California Civil Code § 2981.9
            </h2>
            <p className="font-medium mb-2">
              Everything you agree to must be in one written contract.
            </p>
            <p className="text-sm text-gray-300">
            Civil Code Section 2981.9, which applies in California, requires the dealer to put 
            all terms in a single written agreement and give you a copy of it. The dealer cannot 
            make you agree to something verbally or on the side; **everything** you agree to must, 
            by law, be in this contract. If the dealer promises you something verbally, ask them 
            to include it in the contract before you sign. For example, a dealer might tell you 
            “we’ll fix any issues for free,” but as soon as you sign the contract, go back on 
            their word. This law fixes that problem.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              California Consumers Legal Remedies Act
            </h2>
            <p className="font-medium mb-2">
              A dealer cannot use deception or misrepresentation when selling anything.
            </p>
            <p className="text-sm text-gray-300">
            The CCLRA, which applies in California, requires the dealer to accurately tell you the 
            price, condition, and features of the car. The dealer cannot hide important information 
            that they know could affect your decision. If you see any changes that look weird, or 
            that you can’t explain, ask the dealer to explain why it’s different from what you were 
            told, or show you **where that is stated in writing**. Remember, everything you agree 
            to must be in writing. You can sue for damages or to force changes to your contract.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              California Vehicle Code § 11713
            </h2>
            <p className="font-medium mb-2">
              Dealers cannot lie, mislead you, or use deception when selling a car.
            </p>
            <p className="text-sm text-gray-300">
            Under **California Vehicle Code § 11713,** dealers can’t advertise cars they don’t have, 
            change the price or terms later, hide a car’s history, or keep ads up after a car is sold. 
            They also can’t add fake fees or say “no down payment” if that isn’t true. <br /> <br />

            They <i>can</i> sell cars, advertise deals, and offer financing, but everything has to be real, 
            available, and clearly explained before you agree to anything.
            </p>
          </div>
        </section>
      </div>
    );
  }