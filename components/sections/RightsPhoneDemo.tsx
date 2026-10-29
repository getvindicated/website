"use client";

import { useState, useRef, useEffect } from "react";
import type { RightsPageDict } from "@/lib/i18n/dictionary";

// ── State name matching (ported from the prototype) ──────────
// The laws, state names and wording come from rightsPage in the
// dictionaries, so the demo reads in the page's language. A visitor can
// type the state in English or in their language.

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function capitalizeWords(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

// The state's key ("new york") and how to show it, or just the typed text
// when it doesn't match a state.
function resolveState(raw: string, names: Record<string, string>): { key: string | null; label: string } | null {
  const v = raw.trim();
  if (!v) return null;
  const lower = v.toLowerCase();
  if (lower === "ca" || lower === "calif" || lower === "calif.") return { key: "california", label: names.california };
  if (lower === "tx" || lower === "tex" || lower === "tex.") return { key: "texas", label: names.texas };

  let best: string | null = null;
  let bestDist = Infinity;
  let bestLen = 0;
  for (const [key, name] of Object.entries(names)) {
    for (const candidate of [key, name.toLowerCase()]) {
      const d = levenshtein(lower, candidate);
      if (d < bestDist) { bestDist = d; best = key; bestLen = candidate.length; }
    }
  }
  const threshold = Math.max(1, Math.floor(bestLen * 0.25));
  if (best && bestDist <= threshold) return { key: best, label: names[best] };
  return { key: null, label: capitalizeWords(v) };
}

type Law = {
  tag: string;
  title: string;
  citation: string;
  plain: string;
  script: string;
  escalation: string;
};

type LawText = Omit<Law, "tag">;
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
const list = (group: Record<string, LawText> | undefined): Law[] =>
  group ? Object.entries(group).map(([tag, law]) => ({ tag, ...law })) : [];

// For a state we haven't written up yet: the federal no-cancel rule, and
// what the 50-state summary says about its lemon law, if anything.
function fallbackLaws(dict: RightsPageDict, key: string | null, label: string): Law[] {
  const f = dict.fallback;
  const known = key ? (dict.direction as Record<string, string>)[key] : undefined;
  const direction = known ? fill(f.summary, { direction: known }) : fill(f.unknown, { state: label });
  const soon = f.comingSoon;
  return [
    { tag: "FTC-COR", ...f.cooling },
    {
      tag: "COMING-SOON",
      title: soon.title,
      citation: "",
      plain: fill(soon.plain, { direction, state: label }),
      script: fill(soon.script, { state: label }),
      escalation: fill(soon.escalation, { state: label }),
    },
  ];
}

// ── Component ────────────────────────────────────────────────
type Screen = "entry" | "home" | "laws";
type Category = "federal" | "state";

export function RightsPhoneDemo({ dict }: { dict: RightsPageDict }) {
  const d = dict.demo;
  const laws = dict.laws as Record<string, Record<string, LawText>>;
  const [screen, setScreen] = useState<Screen>("entry");
  const [stateInput, setStateInput] = useState("");
  const [stateKey, setStateKey] = useState<string | null>(null);
  const [stateLabel, setStateLabel] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("federal");
  const [currentLawIndex, setCurrentLawIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const written = stateKey ? laws[stateKey] : undefined;
  const stateLaws = stateLabel ? (written ? list(written) : fallbackLaws(dict, stateKey, stateLabel)) : [];
  const stateLinkName = stateLabel ? fill(d.stateLink, { state: stateLabel }) : d.stateLinkNone;
  const stateLinkMeta = !stateLabel
    ? d.stateMetaNone
    : written
      ? fill(d.stateMetaCount, { n: String(stateLaws.length) })
      : fill(d.stateMetaPartial, { state: stateLabel });
  const homeSub = !stateLabel ? d.pickOne : fill(d.showing, { state: stateLabel });

  const activeLaws = activeCategory === "federal" ? list(laws.federal) : stateLaws;

  function submitState() {
    const resolved = resolveState(stateInput, dict.stateNames);
    setStateKey(resolved?.key ?? null);
    setStateLabel(resolved?.label ?? "");
    setScreen("home");
  }

  function skipState() {
    setStateKey(null);
    setStateLabel("");
    setScreen("home");
  }

  function openCategory(cat: Category) {
    setActiveCategory(cat);
    setCurrentLawIndex(0);
    setRevealed(new Set());
    setScreen("laws");
  }

  function jumpTo(i: number) {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (screen !== "laws" || !scrollRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setRevealed((prev) => new Set(prev).add(idx));
          }
          if (entry.intersectionRatio > 0.5) {
            setCurrentLawIndex(idx);
          }
        });
      },
      { root: scrollRef.current, threshold: [0.15, 0.5] }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [screen, activeLaws.length]);

  return (
    <div className="rpd-stage">
      <style>{`
        .rpd-stage { display: flex; flex-direction: column; align-items: center; width: 100%; }
        [dir="rtl"] .rpd-arrow { display: inline-block; transform: scaleX(-1); }
        .rpd-phone { width: min(340px, calc(100vw - 3rem)); aspect-ratio: 340 / 700; background: #040207; border-radius: 8px; padding: 12px; box-shadow: 0 0 0 1px rgba(255,255,255,0.05) inset, 0 40px 90px -20px rgba(0,0,0,0.6); position: relative; }
        .rpd-screen { position: relative; width: 100%; height: 100%; background: #fff; border-radius: 8px; overflow: hidden; --rpd-ink:#16131d; --rpd-purple:#6d33c9; --rpd-vivid:#9630a6; --rpd-vivid-deep:#7a2685; --rpd-danger:#c23b32; --rpd-line:rgba(0,0,0,0.1); }
        .rpd-island { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 84px; height: 22px; background: #000; border-radius: 8px; z-index: 50; }
        .rpd-home-indicator { position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); width: 110px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 4px; z-index: 50; }
        .rpd-stack { position: absolute; inset: 0; padding-top: 46px; }
        .rpd-view { position: absolute; inset: 0; top: 46px; display: flex; flex-direction: column; background: #fff; }
        .rpd-nav-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px 8px; flex-shrink: 0; }
        .rpd-back-btn { display: flex; align-items: center; gap: 3px; background: none; border: none; color: var(--rpd-vivid); font-size: 0.88rem; font-weight: 600; padding: 5px 3px; cursor: pointer; font-family: -apple-system, sans-serif; }
        .rpd-logo { width: 24px; height: auto; }
        .rpd-entry-wrap, .rpd-home-wrap { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 24px; overflow-y: auto; }
        .rpd-entry-wrap img { margin-bottom: 16px; width: 32px; }
        .rpd-entry-wrap h1 { font-family: Georgia, serif; font-size: 1.7rem; line-height: 1.1; font-weight: 600; margin: 0 0 8px; color: var(--rpd-ink); }
        .rpd-entry-wrap p { font-size: 0.85rem; color: var(--rpd-purple); line-height: 1.5; margin: 0 0 22px; font-family: -apple-system, sans-serif; }
        .rpd-entry-input { width: 100%; background: transparent; border: none; border-bottom: 2px solid var(--rpd-line); color: var(--rpd-ink); font-family: Georgia, serif; font-size: 1.2rem; padding: 5px 2px 10px; outline: none; margin-bottom: 22px; }
        .rpd-entry-input:focus { border-bottom-color: var(--rpd-vivid); }
        .rpd-entry-btn { background: var(--rpd-vivid); color: #fff; border: none; border-radius: 8px; padding: 13px 0; font-size: 0.92rem; font-weight: 600; cursor: pointer; width: 100%; font-family: -apple-system, sans-serif; }
        .rpd-entry-skip { text-align: center; margin-top: 14px; font-size: 0.8rem; color: var(--rpd-purple); background: none; border: none; cursor: pointer; font-family: -apple-system, sans-serif; }
        .rpd-eyebrow { font-family: Arial, Helvetica, sans-serif; font-size: 0.66rem; color: var(--rpd-purple); display: block; margin-bottom: 8px; }
        .rpd-home-wrap img { width: 30px; margin-bottom: 12px; }
        .rpd-home-wrap h1 { font-family: Georgia, serif; font-size: 1.9rem; line-height: 1.06; margin: 0 0 6px; font-weight: 600; color: #9630a6; }
        .rpd-home-wrap h1 em { font-style: italic; color: #9630a6; }
        .rpd-home-sub { font-size: 0.82rem; color: var(--rpd-purple); line-height: 1.5; margin: 0 0 30px; font-family: -apple-system, sans-serif; }
        .rpd-home-link { display: block; padding: 20px 0; border-top: 1px solid var(--rpd-line); cursor: pointer; background: none; border-left: none; border-right: none; border-bottom: none; width: 100%; text-align: left; font-family: -apple-system, sans-serif; }
        .rpd-home-link:last-of-type { border-bottom: 1px solid var(--rpd-line); }
        .rpd-home-row { display: flex; align-items: baseline; justify-content: space-between; }
        .rpd-home-name { font-family: Georgia, serif; font-size: 1.25rem; font-weight: 600; color: var(--rpd-ink); }
        .rpd-home-arrow { font-size: 1.1rem; color: var(--rpd-purple); }
        .rpd-home-meta { font-size: 0.76rem; color: var(--rpd-purple); margin-top: 4px; }
        .rpd-laws-wrap { display: flex; flex: 1; overflow: hidden; }
        .rpd-laws-scroll { flex: 1; overflow-y: auto; padding: 4px 12px 60px 20px; }
        .rpd-law-section { padding-top: 14px; padding-bottom: 32px; border-bottom: 1px solid var(--rpd-line); }
        .rpd-law-section:last-child { border-bottom: none; }
        .rpd-law-citation { font-size: 0.62rem; color: var(--rpd-purple); display: block; margin-bottom: 6px; font-family: -apple-system, sans-serif; }
        .rpd-law-title { font-family: Georgia, serif; font-size: 1.45rem; line-height: 1.12; font-weight: 600; margin: 0 0 10px; color: var(--rpd-ink); }
        .rpd-scroll-prompt { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: var(--rpd-purple); margin-top: 6px; font-family: -apple-system, sans-serif; }
        .rpd-law-content { opacity: 0; transform: translateY(10px); transition: opacity 0.5s ease, transform 0.5s ease; font-family: -apple-system, sans-serif; }
        .rpd-law-content.rpd-shown { opacity: 1; transform: translateY(0); }
        .rpd-plain-text { font-size: 0.9rem; line-height: 1.55; color: var(--rpd-ink); margin: 0 0 18px; }
        .rpd-rule { border: none; border-top: 1px solid var(--rpd-line); margin: 0 0 18px; }
        .rpd-script-quote { display: flex; gap: 8px; margin-bottom: 18px; }
        .rpd-script-quote .rpd-mark { font-family: Georgia, serif; font-size: 1.7rem; color: var(--rpd-purple); line-height: 1; margin-top: -3px; }
        .rpd-script-quote p { font-family: Georgia, serif; font-style: italic; font-size: 0.95rem; line-height: 1.45; color: var(--rpd-ink); margin: 0; }
        .rpd-escalation-text { font-size: 0.84rem; line-height: 1.5; color: var(--rpd-danger); }
        .rpd-rail { width: 26px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6px 0; }
        .rpd-rail button { background: none; border: none; color: #8a5fd6; font-size: 0.5rem; font-weight: 600; padding: 2px; cursor: pointer; line-height: 1; }
        .rpd-rail button.rpd-current { color: var(--rpd-vivid); transform: scale(1.15); }
      `}</style>

      <div className="rpd-phone">
        <div className="rpd-screen">
          <div className="rpd-island" />
          <div className="rpd-stack">

            {screen === "entry" && (
              <div className="rpd-view">
                <div className="rpd-entry-wrap">
                  <img src="/logo-mark.png" alt={d.logoAlt} />
                  <h1>{d.entryTitle}</h1>
                  <p>{d.entryBody}</p>
                  <input
                    className="rpd-entry-input"
                    placeholder={d.placeholder}
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value)}
                  />
                  <button className="rpd-entry-btn" onClick={submitState}>{d.continue}</button>
                  <button className="rpd-entry-skip" onClick={skipState}>{d.skip}</button>
                </div>
              </div>
            )}

            {screen === "home" && (
              <div className="rpd-view">
                <div className="rpd-home-wrap">
                  <img src="/logo-mark.png" alt={d.logoAlt} />
                  <span className="rpd-eyebrow">getvindicated.org</span>
                  <h1>{d.homeTitle}<br /><em>{d.homeTitleEm}</em></h1>
                  <p className="rpd-home-sub">{homeSub}</p>

                  <button className="rpd-home-link" onClick={() => openCategory("federal")}>
                    <div className="rpd-home-row">
                      <span className="rpd-home-name">{d.federal}</span>
                      <span className="rpd-home-arrow rpd-arrow">{"\u2192"}</span>
                    </div>
                    <div className="rpd-home-meta">{d.federalMeta}</div>
                  </button>

                  <button className="rpd-home-link" onClick={() => openCategory("state")}>
                    <div className="rpd-home-row">
                      <span className="rpd-home-name">{stateLinkName}</span>
                      <span className="rpd-home-arrow rpd-arrow">{"\u2192"}</span>
                    </div>
                    <div className="rpd-home-meta">{stateLinkMeta}</div>
                  </button>
                </div>
              </div>
            )}

            {screen === "laws" && (
              <div className="rpd-view">
                <div className="rpd-nav-bar">
                  <button className="rpd-back-btn" onClick={() => setScreen("home")}>
                    <span className="rpd-arrow">{"\u2190"}</span> {d.back}
                  </button>
                  <img className="rpd-logo" src="/logo-mark.png" alt={d.logoAlt} />
                </div>
                <div className="rpd-laws-wrap">
                  <div className="rpd-laws-scroll" ref={scrollRef}>
                    {activeLaws.map((law, i) => (
                      <div
                        key={law.tag}
                        className="rpd-law-section"
                        data-index={i}
                        ref={(el) => { sectionRefs.current[i] = el; }}
                      >
                        {law.citation && <span className="rpd-law-citation">{law.citation}</span>}
                        <h2 className="rpd-law-title">{law.title}</h2>
                        {!revealed.has(i) && (
                          <div className="rpd-scroll-prompt">{d.scroll} {"\u2193"}</div>
                        )}
                        <div className={`rpd-law-content ${revealed.has(i) ? "rpd-shown" : ""}`}>
                          <p className="rpd-plain-text">{law.plain}</p>
                          <hr className="rpd-rule" />
                          <div className="rpd-script-quote">
                            <span className="rpd-mark">{"\u201C"}</span>
                            <p>{law.script}{"\u201D"}</p>
                          </div>
                          <hr className="rpd-rule" />
                          <p className="rpd-escalation-text">{law.escalation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rpd-rail">
                    {activeLaws.map((law, i) => (
                      <button
                        key={law.tag}
                        className={i === currentLawIndex ? "rpd-current" : ""}
                        onClick={() => jumpTo(i)}
                      >
                        {law.tag.length > 6 ? law.tag.split("-")[0] : law.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
          <div className="rpd-home-indicator" />
        </div>
      </div>
    </div>
  );
}
