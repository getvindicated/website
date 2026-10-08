import type { AboutPageDict } from "@/lib/i18n/dictionary";

export function MissionPillars({ dict }: { dict: AboutPageDict["mission"] }) {
  return (
    <section className="band" id="mission">
      <div className="wrap">
        <div className="intro">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="grid3 mt48">
          {dict.items.map((item) => (
            <div className="pillar" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
