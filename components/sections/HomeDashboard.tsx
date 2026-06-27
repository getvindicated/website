"use client";

import { FadeUp, SectionTitle } from "@/components/ui";

const findings = [
  {
    figure: "$1,100",
    context: "price gap",
    detail:
      "Black male buyers were quoted $1,100 more than white male buyers for identical cars, using identical bargaining scripts.",
    color: "white",
  },
  {
    figure: "$410",
    context: "price gap",
    detail:
      "Black women were quoted $410 more than white men. White women were quoted $92 more. The markup follows a clear hierarchy.",
    color: "white",
  },
  {
    figure: "13%",
    context: "longer",
    detail:
      "Minority testers faced 13% longer negotiations than white male testers, even when using the same car and the same asking price.",
    color: "white",
  },
  {
    figure: "4%",
    context: "of visits",
    detail:
      "Dealers made explicitly racist or sexist comments in 4% of controlled test visits. That is not a rounding error.",
    color: "white",
  },
];

export function HomeDashboard() {
  return (
    <FadeUp>
      <section className="px-20 py-24 max-md:px-6 max-md:py-16">
        <SectionTitle
  className="mb-3"
          style={
            { fontSize: "clamp(2.4rem,5vw,4.2rem)" } as React.CSSProperties
          }
        >
          The discrimination is <em>measurable.</em>
          <br />
          The harm is real.
        </SectionTitle>
        <p className="text-[0.88rem] text-white/60 leading-[1.6] max-w-[700px] mb-14">
          Ayres, I. &amp; Siegelman, P. (1995). Race and gender discrimination
          in bargaining for a new car. <em>The American Economic Review, 85</em>
          (3), 304-321.
        </p>

        <div style={{ borderTop: "1px solid var(--color-border)" }}>
          {findings.map((f) => (
            <div
              key={f.figure + f.context}
              className="grid grid-cols-[160px_1fr] gap-6 py-9 max-md:grid-cols-1"
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <span
  className="text-[clamp(2rem,4vw,2.8rem)] font-bold leading-[1]"
  style={{
    fontFamily: "var(--font-heading), Georgia, serif",
    color: f.color,
  }}
>
  {f.figure}
</span>
<span
  className="block text-[0.85rem] mt-1"
  style={{ color: f.color, opacity: 0.85 }}
>
  {f.context}
</span>
              </div>
              <p className="text-[1rem] text-white leading-[1.7] pt-1 max-w-[560px]">
                {f.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </FadeUp>
  );
}
