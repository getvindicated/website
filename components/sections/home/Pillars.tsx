import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";

export function Pillars({
  dict,
  ppiHref,
  fraudHref,
}: {
  dict: HomePageDict["pillars"];
  ppiHref: string;
  fraudHref: string;
}) {
  const [inspection, fraud] = dict.items;
  return (
    <section>
      <div className="wrap">
        <div className="intro">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="grid2 mt48">
          <Link className="card link-card" href={ppiHref}>
            <h3>{inspection.title}</h3>
            <p>{inspection.body}</p>
          </Link>
          <Link className="card link-card" href={fraudHref}>
            <h3>{fraud.title}</h3>
            <p>{fraud.body}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
