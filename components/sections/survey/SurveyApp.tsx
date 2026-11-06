"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { SurveyPageDict } from "@/lib/i18n/dictionary";
import {
  DEMOGRAPHICS,
  ITEMS,
  QUESTIONS_VERSION,
  SCALE,
  SCORED,
  SELF_TEXT,
  TOTAL_ITEMS,
  answerKey,
  itemsIn,
  lowest,
  scores,
  unanswered,
  type Answers,
  type DemoKey,
  type Demographics,
  type ScoredSection,
} from "@/lib/survey/questions";

// The Car Confidence Survey: consent, five pages (one section each), then
// the person's scores. Answers stay in the page until Finish, which sends
// them once to /api/survey. This browser then remembers (localStorage, if
// allowed) that it finished, and shows the saved scores next time.

const PAGES = ["breakdown", "buying", "repair", "fair", "about"] as const;
const STORE = "vindicated-survey";
// Picking one of these clears the rest of the list, and the other way round.
const ALONE = ["none", "no_say"];

type Scores = Record<ScoredSection, number>;
// Where the results screen points, already in the visitor's language.
export type Links = { guides: string; events: string; guide: Record<ScoredSection, string>; share: string; shareLabel: string };
type Step = "loading" | "intro" | "done" | "results" | number;

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));

function saved(): Scores | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? "null");
    return v && SCORED.every((k) => typeof v.scores?.[k] === "number") ? (v.scores as Scores) : null;
  } catch {
    return null;
  }
}

function remember(s: Scores) {
  try {
    localStorage.setItem(STORE, JSON.stringify({ version: QUESTIONS_VERSION, scores: s }));
  } catch {
    // Private windows and blocked storage: the results still show.
  }
}

export function SurveyApp({
  dict: d,
  locale,
  source,
  started,
  email,
  links,
}: {
  dict: SurveyPageDict;
  locale: string;
  source: string | null;
  started: string;
  email: string;
  links: Links;
}) {
  const [step, setStep] = useState<Step>("loading");
  const [agree, setAgree] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [demo, setDemo] = useState<Demographics>({});
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Scores | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const s = saved();
    setResult(s);
    setStep(s ? "done" : "intro");
  }, []);

  // Each new step starts at the top, with focus on its heading.
  useEffect(() => {
    if (step === "loading") return;
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  function go(next: Step) {
    setStep(next);
    setMissing([]);
    setError("");
    requestAnimationFrame(() => top.current?.scrollIntoView({ block: "start" }));
  }

  const answered = ITEMS.filter((i) => answers[answerKey(i)]).length;

  function setAnswer(id: string, v: number) {
    setAnswers((a) => ({ ...a, [id]: v }));
    setMissing((m) => m.filter((x) => x !== id));
  }

  // Next/Finish on a 1–5 page: mark what's left and jump to the first one.
  function checkPage(page: (typeof PAGES)[number]) {
    if (page === "about") return true;
    const left = unanswered(answers, itemsIn(page));
    if (!left.length) return true;
    setMissing(left);
    setError(d.required);
    requestAnimationFrame(() => {
      const first = document.getElementById(`q-${left[0]}`);
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
      first?.querySelector("input")?.focus({ preventScroll: true });
    });
    return false;
  }

  async function finish() {
    const left = unanswered(answers);
    if (left.length) {
      const page = PAGES.findIndex((p) => p !== "about" && itemsIn(p).some((i) => i.id === left[0]));
      setStep(page);
      requestAnimationFrame(() => checkPage(PAGES[page]));
      return;
    }
    setBusy(true);
    setError("");
    let code = "failed";
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers, demographics: demo, locale, source, started, company: honeypot.current?.value ?? "" }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) code = "";
      else if (typeof body.error === "string" && body.error in d.errors) code = body.error;
    } catch {
      // network error: "failed"
    }
    setBusy(false);
    if (code) return setError(d.errors[code as keyof typeof d.errors]);
    const s = scores(answers);
    remember(s);
    setResult(s);
    go("results");
  }

  function again() {
    setAnswers({});
    setDemo({});
    setAgree(false);
    go("intro");
  }

  if (step === "loading") return <div className="sv" ref={top} aria-busy="true" />;

  if (step === "done" && result) {
    return (
      <div className="sv" ref={top}>
        <h1 className="sv-title" ref={heading} tabIndex={-1}>
          {d.done.title}
        </h1>
        <ScoreBars dict={d} scores={result} />
        <Next dict={d} scores={result} links={links} />
        <p className="sv-again">
          <button type="button" className="sv-link" onClick={again}>
            {d.done.again}
          </button>
        </p>
      </div>
    );
  }

  if (step === "results" && result) {
    return (
      <div className="sv" ref={top}>
        <p className="sv-kicker">{d.results.kicker}</p>
        <h1 className="sv-title" ref={heading} tabIndex={-1}>
          {d.results.title}
        </h1>
        <p className="sv-lede">{d.results.body}</p>
        <ScoreBars dict={d} scores={result} />
        <Next dict={d} scores={result} links={links} />
      </div>
    );
  }

  if (step === "intro") {
    const [before, after] = d.intro.consent.split("{email}");
    return (
      <div className="sv" ref={top}>
        <p className="sv-kicker">{d.intro.kicker}</p>
        <h1 className="sv-title" ref={heading} tabIndex={-1}>
          {d.intro.title}
        </h1>
        <p className="sv-lede">{d.intro.lede}</p>
        <ul className="sv-tags">
          {d.intro.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="sv-consent">
          <h2>{d.intro.consentTitle}</h2>
          <p>
            {before}
            <a href={`mailto:${email}`}>{email}</a>
            {after}
          </p>
          <label className="sv-check sv-agree">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>{d.intro.agree}</span>
          </label>
          <button type="button" className="btn btn-solid sv-start" disabled={!agree} onClick={() => go(0)}>
            {d.intro.start}
          </button>
        </div>
      </div>
    );
  }

  const index = step as number;
  const page = PAGES[index];
  const sec = d.sections[page];
  const last = index === PAGES.length - 1;

  return (
    <div className="sv" ref={top}>
      <div className="sv-progress" role="group" aria-label={fill(d.pageOf, { n: index + 1, total: PAGES.length })}>
        <div className="sv-progress-text">
          <b>{sec.title}</b>
          <span aria-live="polite">{fill(d.progress, { n: answered, total: TOTAL_ITEMS })}</span>
        </div>
        <div className="sv-progress-bar" aria-hidden="true">
          <span style={{ width: `${(answered / TOTAL_ITEMS) * 100}%` }} />
        </div>
      </div>

      <form
        className="sv-page"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!checkPage(page)) return;
          if (last) finish();
          else go(index + 1);
        }}
      >
        <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sv-hp" />
        <p className="sv-step">{fill(d.pageOf, { n: index + 1, total: PAGES.length })}</p>
        <h1 className="sv-section" ref={heading} tabIndex={-1}>
          {sec.title}
        </h1>
        <p className="sv-intro">{sec.intro}</p>

        {page === "about" ? (
          <About dict={d} demo={demo} setDemo={setDemo} />
        ) : (
          <>
            <p className="sv-key">{d.scaleKey}</p>
            {itemsIn(page).map((item) => (
              <Likert
                key={item.id}
                id={item.id}
                text={d.items[item.id as keyof typeof d.items] ?? item.text}
                value={answers[answerKey(item)]}
                onPick={(v) => setAnswer(answerKey(item), v)}
                labels={d.scale}
                miss={missing.includes(item.id)}
                missText={d.unanswered}
                paired={!!item.pairOf}
              />
            ))}
          </>
        )}

        {/* The "answer every question" note goes once nothing is left. */}
        {error && (error !== d.required || missing.length > 0) && (
          <p className="sv-error" role="alert">
            {error}
          </p>
        )}
        <div className="sv-nav">
          <button type="button" className="btn sv-back" onClick={() => go(index === 0 ? "intro" : index - 1)} disabled={busy}>
            {d.back}
          </button>
          <button type="submit" className="btn btn-solid" disabled={busy}>
            {busy ? d.sending : last ? d.finish : d.next}
          </button>
        </div>
      </form>
    </div>
  );
}

function Likert({
  id,
  text,
  value,
  onPick,
  labels,
  miss,
  missText,
  paired,
}: {
  id: string;
  text: string;
  value: number | undefined;
  onPick: (v: number) => void;
  labels: string[];
  miss: boolean;
  missText: string;
  paired: boolean;
}) {
  return (
    <fieldset id={`q-${id}`} className={`sv-q${paired ? " sv-paired" : ""}${miss ? " sv-miss" : ""}`} aria-invalid={miss || undefined}>
      <legend>{text}</legend>
      {miss && <p className="sv-miss-text">{missText}</p>}
      <div className="sv-scale">
        {SCALE.map((n) => (
          <label key={n} className={value === n ? "on" : undefined}>
            <input type="radio" name={id} value={n} checked={value === n} onChange={() => onPick(n)} />
            <b>{n}</b>
            <span>{labels[n - 1]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function About({ dict: d, demo, setDemo }: { dict: SurveyPageDict; demo: Demographics; setDemo: (f: (x: Demographics) => Demographics) => void }) {
  return (
    <>
      {(Object.keys(DEMOGRAPHICS) as DemoKey[]).map((key) => {
        const q = DEMOGRAPHICS[key];
        const text = d.demo[key];
        const selfKey = `${key}Self` as keyof Demographics;
        const chosen: string[] = q.multi ? ((demo[key] as string[] | undefined) ?? []) : demo[key] ? [demo[key] as string] : [];
        const toggle = (opt: string, on: boolean) =>
          setDemo((x) => {
            if (!q.multi) return { ...x, [key]: opt };
            const list = ((x[key] as string[] | undefined) ?? []).filter((o) => o !== opt);
            const next = !on ? list : ALONE.includes(opt) ? [opt] : [...list.filter((o) => !ALONE.includes(o)), opt];
            return { ...x, [key]: next };
          });
        return (
          <fieldset key={key} className="sv-q sv-demo">
            <legend>
              {text.label} <span className="sv-opt">({d.optional})</span>
            </legend>
            {q.multi && <p className="sv-hint">{d.demo.pickAll}</p>}
            <div className="sv-choices">
              {q.options.map((opt) => (
                <label key={opt} className={`sv-check${chosen.includes(opt) ? " on" : ""}`}>
                  <input
                    type={q.multi ? "checkbox" : "radio"}
                    name={key}
                    value={opt}
                    checked={chosen.includes(opt)}
                    onChange={(e) => toggle(opt, e.target.checked)}
                  />
                  <span>{(text.options as Record<string, string>)[opt]}</span>
                </label>
              ))}
            </div>
            {SELF_TEXT[key] && chosen.includes(SELF_TEXT[key] as string) && (
              <label className="sv-self">
                <span>{d.demo.selfLabel}</span>
                <input
                  type="text"
                  maxLength={60}
                  value={(demo[selfKey] as string | undefined) ?? ""}
                  onChange={(e) => setDemo((x) => ({ ...x, [selfKey]: e.target.value }))}
                />
              </label>
            )}
          </fieldset>
        );
      })}
    </>
  );
}

function ScoreBars({ dict: d, scores: s }: { dict: SurveyPageDict; scores: Scores }) {
  return (
    <ul className="sv-scores">
      {SCORED.map((k) => (
        <li key={k}>
          <div className="sv-score-head">
            <b>{d.results.areas[k]}</b>
            <span>{fill(d.results.score, { score: s[k].toFixed(1) })}</span>
          </div>
          <div className="sv-meter" aria-hidden="true">
            <span style={{ width: `${(s[k] / 5) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Next({ dict: d, scores: s, links }: { dict: SurveyPageDict; scores: Scores; links: Links }) {
  const area = lowest(s);
  const [before, after] = d.results.share.split("{link}");
  const share: ReactNode = (
    <>
      {before}
      <a href={links.share}>{links.shareLabel}</a>
      {after}
    </>
  );
  return (
    <>
      <div className="sv-tip">
        <h2>{d.results.tipTitle}</h2>
        <p>{d.results.tips[area]}</p>
        <Link className="sv-link" href={links.guide[area]}>
          {d.results.tipLink}
        </Link>
      </div>
      <div className="ctas sv-ctas">
        <Link className="btn btn-solid" href={links.guides}>
          {d.results.guides}
        </Link>
        <Link className="btn sv-soft" href={links.events}>
          {d.results.workshop}
        </Link>
      </div>
      <p className="sv-share">{share}</p>
    </>
  );
}
