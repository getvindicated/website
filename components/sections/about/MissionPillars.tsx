import type { AboutPageDict } from "@/lib/i18n/dictionary";

const ICONS = [
  <path key="book" d="M4 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z" />,
  <g key="shield">
    <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </g>,
  <path key="bars" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
];

export function MissionPillars({ dict }: { dict: AboutPageDict["mission"] }) {
  return (
    <section id="mission">
      <div className="wrap">
        <div className="center">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="grid3 mt56">
          {dict.items.map((item, i) => (
            <div className="pillar-lg" key={item.title}>
              <div className="icon" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9533A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[i]}
                </svg>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
