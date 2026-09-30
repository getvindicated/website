import type { HomePageDict } from "@/lib/i18n/dictionary";

export function ResearchSources({ dict }: { dict: HomePageDict["sources"] }) {
  return (
    <div className="strip">
      <div className="wrap strip-in">
        <h2>{dict.heading}</h2>
        <ul className="sources">
          {dict.items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
