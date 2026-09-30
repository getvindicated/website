import type { HomePageDict } from "@/lib/i18n/dictionary";
import { CheckIcon } from "../shared/icons";

export function FreeResources({ dict }: { dict: HomePageDict["free"] }) {
  return (
    <section className="band" id="free">
      <div className="wrap plan">
        <div>
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="plan-card">
          <div className="plan-head">
            <h3>{dict.planTitle}</h3>
            <div className="price">{dict.price}</div>
          </div>
          <ul className="checks">
            {dict.checks.map((c) => (
              <li key={c}>
                <CheckIcon />
                {c}
              </li>
            ))}
          </ul>
          <div className="offer">
            {dict.offers.map((o) => (
              <div key={o.title}>
                <h4>{o.title}</h4>
                <p>{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
