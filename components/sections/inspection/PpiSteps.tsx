import type { InspectionPageDict } from "@/lib/i18n/dictionary";
import { Rich } from "../shared/Rich";

export function PpiSteps({ dict }: { dict: InspectionPageDict["schedule"] }) {
  return (
    <section id="schedule">
      <div className="wrap prose">
        <h2 className="h2">{dict.title}</h2>
        <ol className="num-list">
          {dict.stops.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="alert">
          <b>{dict.alertTitle}</b>
          <Rich text={dict.alert} />
        </div>
      </div>
    </section>
  );
}
