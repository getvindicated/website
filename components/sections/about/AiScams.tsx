import Link from "next/link";
import type { AboutPageDict } from "@/lib/i18n/dictionary";
import { CheckIcon } from "../shared/icons";

const FONT = "Plus Jakarta Sans,sans-serif";
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
  const a = dict.art;
  const art = [
    <svg key="listing" viewBox="0 0 240 170" aria-hidden="true">
      <rect x="70" y="12" width="100" height="150" rx="16" fill="#2a0f31" />
      <rect x="77" y="22" width="86" height="132" rx="10" fill="#fff" />
      <rect x="84" y="30" width="72" height="46" rx="6" fill="#ecd6f0" />
      <path d="M92 66c0-6 4-9 10-10l8-2 7-7c2-2 5-3 8-3h12c3 0 5 1 7 3l6 7 6 1c4 1 6 4 6 7v4H92z" fill="#9533A5" />
      <rect x="84" y="84" width="46" height="8" rx="4" fill="#2a0f31" />
      <rect x="84" y="98" width="30" height="8" rx="4" fill="#9533A5" />
      <rect x="84" y="114" width="64" height="6" rx="3" fill="#e5cfe9" />
      <rect x="84" y="126" width="52" height="6" rx="3" fill="#e5cfe9" />
      <rect x="150" y="96" width="60" height="22" rx="11" fill="#9533A5" />
      <text x="180" y="111" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="11" fill="#fff">
        {a.boosted}
      </text>
    </svg>,
    <svg key="license" viewBox="0 0 240 170" aria-hidden="true">
      <rect x="40" y="20" width="160" height="130" rx="10" fill="#fff" stroke="#2a0f31" strokeWidth="3" />
      <rect x="40" y="20" width="160" height="26" rx="10" fill="#9533A5" />
      <rect x="40" y="36" width="160" height="10" fill="#9533A5" />
      <text x="120" y="38" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="11" fill="#fff">
        {a.license}
      </text>
      <text x="60" y="72" fontFamily={FONT} fontWeight="800" fontSize="13" fill="#2a0f31">
        {a.dealerName}
      </text>
      <text x="146" y="72" fontFamily={FONT} fontWeight="800" fontSize="13" fill="#b9a2bf">
        {a.dealerDropped}
      </text>
      <path d="M144 67h24" stroke="#9533A5" strokeWidth="3" />
      <rect x="60" y="86" width="100" height="6" rx="3" fill="#e5cfe9" />
      <rect x="60" y="98" width="80" height="6" rx="3" fill="#e5cfe9" />
      <circle cx="170" cy="120" r="16" fill="none" stroke="#9533A5" strokeWidth="3" />
      <path d="M163 120l5 5 9-10" fill="none" stroke="#9533A5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    <svg key="loan" viewBox="0 0 240 170" aria-hidden="true">
      <rect x="24" y="44" width="192" height="82" rx="18" fill="#fff" stroke="#e5cfe9" strokeWidth="2" />
      <rect x="40" y="62" width="40" height="40" rx="12" fill="#9533A5" />
      <path d="M50 90h20M52 84v-10M60 84v-10M68 84v-10M48 74l12-7 12 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="92" y="78" fontFamily={FONT} fontWeight="800" fontSize="12" fill="#2a0f31">
        {a.loanFunded}
      </text>
      <text x="92" y="98" fontFamily={FONT} fontWeight="800" fontSize="20" fill="#9533A5">
        {a.loanAmount}
      </text>
      <text x="200" y="76" textAnchor="end" fontFamily={FONT} fontWeight="500" fontSize="10" fill="#5e1a6b">
        {a.now}
      </text>
    </svg>,
    <svg key="delivery" viewBox="0 0 240 170" aria-hidden="true">
      <rect x="24" y="18" width="192" height="134" rx="16" fill="#fff" stroke="#e5cfe9" strokeWidth="2" />
      <path d="M44 124c30-10 40-60 80-60s40 30 72-24" fill="none" stroke="#9533A5" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx="44" cy="124" r="7" fill="#2a0f31" />
      <path d="M196 22c-12 0-20 9-20 20 0 15 20 32 20 32s20-17 20-32c0-11-8-20-20-20z" fill="#9533A5" />
      <circle cx="196" cy="42" r="7" fill="#fff" />
      <rect x="120" y="116" width="78" height="22" rx="11" fill="#ecd6f0" />
      <text x="159" y="131" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="11" fill="#5e1a6b">
        {a.delivered}
      </text>
    </svg>,
  ];

  return (
    <section className="band" id="ai">
      <div className="wrap">
        <div className="center">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <ol className="aisteps mt56">
          {dict.steps.map((s, i) => (
            <li className="aistep" key={s.title}>
              <div className="aistep-art">{art[i]}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="ai-src">{dict.source}</p>
        <div className="ai-bottom">
          <div className="ai-save">
            <div className="big">{dict.saveStat}</div>
            <h3>{dict.saveTitle}</h3>
            <p>{dict.saveBody}</p>
            <Link className="btn btn-line" href={rightsHref}>
              {dict.saveCta}
            </Link>
          </div>
          <div className="plan-card ai-tips">
            <div className="plan-head">
              <h3>{dict.tipsTitle}</h3>
            </div>
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
