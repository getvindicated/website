import Image from "next/image";
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
      <div className="wrap center">
        <h2 className="h2">{dict.title}</h2>
        <p className="lede">{dict.body}</p>
        <div className="grid2 mt56">
          <Link className="pcard pcard-line" href={ppiHref}>
            <div className="icon" aria-hidden="true">
              <Image src="/images/graphics/icon-brake-warning.webp" alt="" width={40} height={31} />
            </div>
            <h3>{inspection.title}</h3>
            <p>{inspection.body}</p>
          </Link>
          <Link className="pcard pcard-line" href={fraudHref}>
            <div className="icon" aria-hidden="true">
              <Image src="/images/graphics/icon-steering-shield.webp" alt="" width={36} height={40} />
            </div>
            <h3>{fraud.title}</h3>
            <p>{fraud.body}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
