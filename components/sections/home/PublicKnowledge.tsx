import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { PhoneNotifications } from "./PhoneNotifications";

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
        <div>
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
          <div className="ctas">
            <Link className="btn btn-solid" href={ppiHref}>
              {dict.ctaPrimary}
            </Link>
            <Link className="btn btn-line" href={fraudHref}>
              {dict.ctaSecondary}
            </Link>
          </div>
        </div>
        <PhoneNotifications dict={dict} />
      </div>
    </section>
  );
}
