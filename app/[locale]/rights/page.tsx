import Link from "next/link";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { COOLING_OFF, FEDERAL_LAWS, STATE_DIRECTION, STATE_LAWS, type Law } from "@/lib/rights-laws";
import "../../minimal.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "rights", "/rights");
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function LawText({ law, heading: H }: { law: Law; heading: "h3" | "h4" }) {
  return (
    <div>
      <H>{law.title}</H>
      {law.citation && <p className="mn-meta">{law.citation}</p>}
      <p>{law.plain}</p>
      <p>
        <strong>What to say:</strong> &ldquo;{law.script}&rdquo;
      </p>
      <p>
        <strong>If they push back:</strong> {law.escalation}
      </p>
    </div>
  );
}

export default async function RightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const href = (h: string) => localizeHref(locale as Locale, h);

  return (
    <div className="rd rd-page mn">
      <div className="mn-col">
        <h1>Know your rights before you sign.</h1>
        <p className="mn-lead">
          Federal and California laws protect you from discrimination and deceptive practices at dealerships. Here is
          what every buyer should know.
        </p>

        <h2 id="federal">Federal laws</h2>
        <p>These apply in every state.</p>
        {[...FEDERAL_LAWS, COOLING_OFF].map((law) => (
          <LawText key={law.tag} law={law} heading="h3" />
        ))}

        <h2 id="states">State laws</h2>
        <p>The states we have researched in detail, on top of the federal laws above.</p>
        {Object.entries(STATE_LAWS).map(([state, laws]) => (
          <section key={state} id={state.replace(/\s+/g, "-")}>
            <h3>{titleCase(state)}</h3>
            {laws.map((law) => (
              <LawText key={law.tag} law={law} heading="h4" />
            ))}
          </section>
        ))}

        <h2 id="other-states">Other states</h2>
        <p>
          Based on a 50-state legal summary. Exact statute numbers have not been independently verified for these
          states, so treat this as a starting point, not legal advice. Before you sign, search &ldquo;[your state]
          lemon law&rdquo; and &ldquo;[your state] used car dealer warranty&rdquo; on your state Attorney
          General&apos;s website.
        </p>
        <ul>
          {Object.entries(STATE_DIRECTION).map(([state, direction]) => (
            <li key={state}>
              <strong>{titleCase(state)}:</strong> the lemon law {direction}.
            </li>
          ))}
        </ul>

        <h2>Remember</h2>
        <p>
          <strong>You do not need to be a lawyer to use these laws.</strong> Simply knowing they exist changes the
          power dynamic. If a dealer refuses to provide written disclosures, that itself is a red flag.
        </p>
        <p>
          If you believe your rights have been violated, you can file a complaint with the{" "}
          <strong>Consumer Financial Protection Bureau (CFPB)</strong>, the <strong>Federal Trade Commission (FTC)</strong>
          , or the <strong>California Department of Motor Vehicles (DMV)</strong>.
        </p>
        <div className="mn-links">
          <Link className="mn-btn" href={href("/fraud")}>
            Spot the Red Flags
          </Link>
          <Link href={href("/inspection")}>Pre-Purchase Inspection Guide</Link>
        </div>
      </div>
    </div>
  );
}
