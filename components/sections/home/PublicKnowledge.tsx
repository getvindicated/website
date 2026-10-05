import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { Rich } from "../shared/Rich";

export function PublicKnowledge({
  dict,
  ppiHref,
  fraudHref,
}: {
  dict: HomePageDict["publicKnowledge"];
  ppiHref: string;
  fraudHref: string;
}) {
  return (
    <section>
      <div className="wrap what">
        <h2 className="h2">{dict.title}</h2>
        <div>
          <p className="lede">
            <Rich text={dict.body} />
          </p>
          <div className="ctas">
            <Link className="btn btn-solid" href={ppiHref}>
              {dict.ctaPrimary}
            </Link>
            <Link className="btn btn-line" href={fraudHref}>
              {dict.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
