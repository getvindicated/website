import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { Rich } from "../shared/Rich";

// Explains what a pre-purchase inspection is, so the hero's
// "Inspection Guide" button makes sense to first-time buyers, then
// closes with why VINdicated makes this knowledge free.
export function PpiExplainer({
  dict,
  knowledge,
  ppiHref,
  whereHref,
  fraudHref,
}: {
  dict: HomePageDict["ppi"];
  knowledge: HomePageDict["publicKnowledge"];
  ppiHref: string;
  whereHref: string;
  fraudHref: string;
}) {
  return (
    <section className="ppi" id="ppi">
      <div className="wrap what">
        <h2 className="h2">{dict.title}</h2>
        <div>
          <p className="lede">
            <Rich text={dict.body} />
          </p>
          <div className="offer">
            {dict.items.map((item) => (
              <div key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <div className="ctas">
            <Link className="btn btn-solid" href={ppiHref}>
              {dict.primary}
            </Link>
            <Link className="btn btn-line" href={whereHref}>
              {dict.secondary}
            </Link>
          </div>
        </div>
        <hr className="ppi-rule" />
        <h3 className="ppi-sub">{knowledge.title}</h3>
        <div>
          <p className="lede">
            <Rich text={knowledge.body} />
          </p>
          <div className="ctas">
            <Link className="btn btn-line" href={fraudHref}>
              {knowledge.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
