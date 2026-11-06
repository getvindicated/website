import Link from "next/link";
import type { SurveyPageDict } from "@/lib/i18n/dictionary";

// "How confident are you with cars?" on the home page, linking to the
// survey. Only shown once the survey is public (SURVEY_PUBLIC).
export function SurveyInvite({ dict, href }: { dict: SurveyPageDict["home"]; href: string }) {
  return (
    <section className="sv-home" aria-labelledby="sv-home-title">
      <div className="wrap">
        <div className="sv-home-card">
          <div>
            <h2 id="sv-home-title">{dict.title}</h2>
            <p>{dict.body}</p>
          </div>
          <Link className="btn btn-solid" href={href}>
            {dict.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
