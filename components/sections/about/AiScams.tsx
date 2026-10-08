import Link from "next/link";
import type { AboutPageDict } from "@/lib/i18n/dictionary";
import { CheckIcon } from "../shared/icons";

const FTC_ALERT =
  "https://consumer.ftc.gov/consumer-alerts/2026/09/scammers-are-spoofing-car-dealership-websites-what-you-need-know";
const FTC_REPORT = "https://reportfraud.ftc.gov/";

export function AiScams({
  dict,
  rightsHref,
}: {
  dict: AboutPageDict["ai"];
  rightsHref: string;
}) {
  return (
    <section className="band" id="ai">
      <div className="wrap ai">
        <div>
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
          <ol className="num-list">
            {dict.steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="ai-src">{dict.source}</p>
        </div>
        <div className="ai-side">
          <div className="ai-save">
            <div className="big">{dict.saveStat}</div>
            <h3>{dict.saveTitle}</h3>
            <p>{dict.saveBody}</p>
            <Link className="inline-link" href={rightsHref}>
              {dict.saveCta}
            </Link>
          </div>
          <div className="card ai-tips">
            <h3>{dict.tipsTitle}</h3>
            <ul className="checks one">
              {dict.tips.map((t) => (
                <li key={t}>
                  <CheckIcon />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="ctas">
              <a className="btn btn-solid" href={FTC_ALERT} target="_blank" rel="noopener noreferrer">
                {dict.ftcCta}
              </a>
              <a className="btn btn-line" href={FTC_REPORT} target="_blank" rel="noopener noreferrer">
                {dict.reportCta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
