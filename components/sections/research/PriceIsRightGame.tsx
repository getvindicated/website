"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { ResearchPageDict } from "@/lib/i18n/dictionary";

type GameDict = ResearchPageDict["game"];
type Region = keyof GameDict["regions"];
type StateCode = keyof GameDict["states"];

// Illustrative numbers until the real pricing pipeline is live.
const ROUNDS = [
  {
    img: "/images/cars/2018-honda-civic.webp",
    width: 618,
    height: 462,
    type: "sedan",
    bad: [] as number[],
    parts: [15200, 400, 300],
  },
  {
    img: "/images/cars/2015-ford-f150.webp",
    width: 1000,
    height: 439,
    type: "truck",
    bad: [1],
    parts: [19000, -2800, -2200, -500],
  },
  {
    img: "/images/cars/2020-toyota-camry.webp",
    width: 864,
    height: 477,
    type: "sedan",
    bad: [1],
    parts: [21500, 500, -6500, -200],
  },
] as const;

const REGION_ADJUST: Record<Region, { sedan: number; truck: number }> = {
  west: { sedan: 0.03, truck: -0.02 },
  mountain: { sedan: 0, truck: 0.04 },
  southwest: { sedan: -0.01, truck: 0.05 },
  midwest: { sedan: -0.02, truck: 0.02 },
  south: { sedan: -0.01, truck: 0.03 },
  northeast: { sedan: 0.01, truck: 0 },
};

const STATE_REGION: Record<StateCode, Region> = {
  AL: "south", AK: "west", AZ: "southwest", AR: "south", CA: "west",
  CO: "mountain", CT: "northeast", DE: "northeast", DC: "northeast",
  FL: "south", GA: "south", HI: "west", ID: "mountain", IL: "midwest",
  IN: "midwest", IA: "midwest", KS: "midwest", KY: "south", LA: "south",
  ME: "northeast", MD: "northeast", MA: "northeast", MI: "midwest",
  MN: "midwest", MS: "south", MO: "midwest", MT: "mountain",
  NE: "midwest", NV: "mountain", NH: "northeast", NJ: "northeast",
  NM: "southwest", NY: "northeast", NC: "south", ND: "midwest",
  OH: "midwest", OK: "southwest", OR: "west", PA: "northeast",
  RI: "northeast", SC: "south", SD: "midwest", TN: "south",
  TX: "southwest", UT: "mountain", VT: "northeast", VA: "south",
  WA: "west", WV: "south", WI: "midwest", WY: "mountain",
};

const MIN = 3000;
const MAX = 40000;
const START_GUESS = 15000;

type Phase = "start" | "guess" | "reveal" | "done";
type Result = {
  guess: number;
  fair: number;
  points: number;
  parts: [string, number][];
};

export function PriceIsRightGame({
  dict,
  locale,
}: {
  dict: GameDict;
  locale: string;
}) {
  const [state, setState] = useState<StateCode | "">("");
  const [phase, setPhase] = useState<Phase>("start");
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState(START_GUESS);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const focusRef = useRef<HTMLElement | null>(null);

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.round(n));
  const compact = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      notation: "compact",
    }).format(n);
  const fill = (s: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((t, [k, v]) => t.replace(`{${k}}`, String(v)), s);

  const stateName = state ? dict.states[state] : "";
  const sortedStates = (Object.keys(dict.states) as StateCode[]).sort((a, b) =>
    dict.states[a].localeCompare(dict.states[b], locale),
  );

  // Move focus to the new content after each phase change.
  useEffect(() => {
    focusRef.current?.focus();
  }, [phase, round]);

  function partsFor(i: number): [string, number][] {
    const r = ROUNDS[i];
    const labels = dict.rounds[i].parts;
    const parts: [string, number][] = r.parts.map((v, k) => [labels[k], v]);
    if (!state) return parts;
    const region = STATE_REGION[state];
    const base = r.parts.reduce<number>((s, v) => s + v, 0);
    const adj = Math.round((base * REGION_ADJUST[region][r.type]) / 50) * 50;
    return [
      ...parts,
      [fill(dict.stateAdjust, { state: stateName, note: dict.regions[region] }), adj],
    ];
  }

  function startGame() {
    setRound(0);
    setScore(0);
    setGuess(START_GUESS);
    setPhase("guess");
  }

  function lockIn() {
    const parts = partsFor(round);
    const fair = parts.reduce((s, p) => s + p[1], 0);
    const pct = Math.abs(guess - fair) / fair;
    const points =
      Math.max(0, Math.round(1000 * (1 - pct * 2))) + (pct <= 0.05 ? 250 : 0);
    setScore((s) => s + points);
    setResult({ guess, fair, points, parts });
    setPhase("reveal");
  }

  function next() {
    if (round < ROUNDS.length - 1) {
      setRound(round + 1);
      setGuess(START_GUESS);
      setPhase("guess");
    } else {
      setPhase("done");
    }
  }

  function changeState() {
    setPhase("start");
    requestAnimationFrame(() => selectRef.current?.focus());
  }

  const car = ROUNDS[round];
  const carCopy = dict.rounds[round];

  return (
    <div className="pir" id="pir">
      <div className="pir-head">
        <div>
          <h3>{dict.title}</h3>
          <p>{dict.body}</p>
        </div>
        <div className="pir-score" aria-live="polite">
          <span>{dict.score}</span>
          <b>{score.toLocaleString(locale)}</b>
        </div>
      </div>

      {phase === "start" && (
        <div className="pir-start">
          <label htmlFor="pirState" className="pir-label">
            {dict.stateLabel}
          </label>
          <p>{dict.stateBody}</p>
          <div className="pir-start-row">
            <select
              id="pirState"
              ref={selectRef}
              value={state}
              onChange={(e) => setState(e.target.value as StateCode | "")}
            >
              <option value="">{dict.statePlaceholder}</option>
              {sortedStates.map((code) => (
                <option key={code} value={code}>
                  {dict.states[code]}
                </option>
              ))}
            </select>
            <button
              type="button"
              id="pirGo"
              className="btn btn-solid"
              disabled={!state}
              onClick={startGame}
            >
              {dict.start}
            </button>
          </div>
        </div>
      )}

      {phase !== "start" && (
        <div className="pir-game">
          {phase !== "done" && (
            <div className="pir-car">
              <div className="pir-photo">
                <Image
                  src={car.img}
                  alt={carCopy.alt}
                  width={car.width}
                  height={car.height}
                  sizes="(max-width: 760px) 90vw, 420px"
                />
              </div>
              <div className="pir-info">
                <span className="pir-round">
                  {fill(dict.round, { n: round + 1, total: ROUNDS.length })}
                </span>
                <h4
                  tabIndex={-1}
                  ref={(el) => {
                    if (phase === "guess") focusRef.current = el;
                  }}
                >
                  {carCopy.name}
                </h4>
                <ul className="pir-tags">
                  {carCopy.tags.map((t, i) => (
                    <li key={t} className={(car.bad as readonly number[]).includes(i) ? "bad" : undefined}>
                      {t}
                    </li>
                  ))}
                  <li className="loc">{stateName}</li>
                </ul>
                <button type="button" className="pir-change" onClick={changeState}>
                  {dict.changeState}
                </button>
              </div>
            </div>
          )}

          {phase === "guess" && (
            <div className="pir-guess">
              <label htmlFor="pirSlider" className="pir-label">
                {dict.guessLabel}
              </label>
              <div className="pir-val" aria-hidden="true">
                {money(guess)}
              </div>
              <input
                type="range"
                id="pirSlider"
                min={MIN}
                max={MAX}
                step={250}
                value={guess}
                aria-valuetext={money(guess)}
                style={{ "--fill": `${((guess - MIN) / (MAX - MIN)) * 100}%` } as CSSProperties}
                onChange={(e) => setGuess(+e.target.value)}
              />
              <div className="pir-scale" aria-hidden="true">
                <span>{compact(MIN)}</span>
                <span>{compact(MAX)}</span>
              </div>
              <button type="button" className="btn btn-solid" onClick={lockIn}>
                {dict.lockIn}
              </button>
            </div>
          )}

          {phase === "reveal" && result && (
            <Reveal
              dict={dict}
              result={result}
              stateCode={state as StateCode}
              tip={carCopy.tip}
              money={money}
              last={round === ROUNDS.length - 1}
              onNext={next}
              focusRef={focusRef}
            />
          )}

          {phase === "done" && (
            <div className="pir-reveal">
              <div className="pir-end">
                <span className="tag">{fill(dict.done, { state: stateName })}</span>
                <h4 tabIndex={-1} ref={(el) => { focusRef.current = el; }}>
                  {fill(dict.points, { points: score.toLocaleString(locale) })}
                </h4>
                <p>{dict.doneBody}</p>
                <div className="ctas">
                  <button type="button" className="btn btn-solid" onClick={startGame}>
                    {dict.again}
                  </button>
                  <button type="button" className="btn btn-line" onClick={changeState}>
                    {dict.otherState}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <p className="ai-src pir-note">{dict.disclaimer}</p>
    </div>
  );
}

function Reveal({
  dict,
  result,
  stateCode,
  tip,
  money,
  last,
  onNext,
  focusRef,
}: {
  dict: GameDict;
  result: Result;
  stateCode: StateCode;
  tip: string;
  money: (n: number) => string;
  last: boolean;
  onNext: () => void;
  focusRef: React.MutableRefObject<HTMLElement | null>;
}) {
  const { guess, fair, points, parts } = result;
  const diff = guess - fair;
  const pct = Math.abs(diff) / fair;
  const verdict =
    pct <= 0.05
      ? dict.nailed
      : diff > 0
        ? dict.over.replace("{amount}", money(diff))
        : dict.under.replace("{amount}", money(-diff));
  const max = Math.max(...parts.slice(1).map((p) => Math.abs(p[1])), 1);
  const signed = (v: number, i: number) =>
    i === 0 ? money(v) : v === 0 ? money(0) : `${v > 0 ? "+" : "−"}${money(Math.abs(v))}`;

  return (
    <div className="pir-reveal">
      <div className="pir-cmp">
        <div>
          <span>{dict.compareGuess}</span>
          <b>{money(guess)}</b>
        </div>
        <div>
          <span>{dict.compareFair.replace("{state}", stateCode)}</span>
          <b className="fair">{money(fair)}</b>
        </div>
        <div>
          <span>{dict.comparePoints}</span>
          <b>+{points.toLocaleString()}</b>
        </div>
      </div>
      <p
        className={`pir-verdict${diff > 0 && pct > 0.05 ? " over" : ""}`}
        tabIndex={-1}
        ref={(el) => {
          focusRef.current = el;
        }}
      >
        {verdict}
      </p>
      <p className="pir-label">{dict.why}</p>
      <ul className="pir-break">
        {parts.map(([label, v], i) => (
          <li
            key={label}
            className={i === parts.length - 1 ? "state" : undefined}
          >
            <span>{label}</span>
            <i
              className={i === 0 ? "base" : v < 0 ? "neg" : v > 0 ? "pos" : "zero"}
              style={{ "--w": `${i === 0 ? 100 : Math.max(6, (Math.abs(v) / max) * 100)}%` } as CSSProperties}
              aria-hidden="true"
            />
            <b>{signed(v, i)}</b>
          </li>
        ))}
      </ul>
      <div className="say">{dict.tip.replace("{tip}", tip)}</div>
      <button type="button" className="btn btn-solid" onClick={onNext}>
        {last ? dict.seeScore : dict.next}
      </button>
    </div>
  );
}
