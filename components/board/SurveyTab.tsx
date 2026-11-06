"use client";

import { useCallback, useEffect, useState } from "react";
import type { SurveyStats, DashSection } from "@/lib/survey/stats";
import { apiCall, chapterUrl } from "./util";

// Admins only: results of the public Car Confidence Survey (/survey). The
// same org-wide data for every chapter. Test answers (sent by admins while
// previewing) are left out unless "Include test responses" is on. Groups
// with fewer than 5 responses are never shown in a split.

type Labels = {
  approved: boolean;
  isPublic: boolean;
  sections: Record<string, { title: string }>;
  items: Record<string, string>;
  pairs: [string, string][];
  sectionItems: Record<"breakdown" | "buying" | "repair", string[]>;
  demo: Record<string, { label: string; options: Record<string, string> }>;
};
type Loaded = SurveyStats & { labels: Labels };

const DASH_LABELS: Record<DashSection, string> = {
  breakdown: "Breaking down",
  buying: "Buying a car",
  repair: "Getting a repair",
  fairExpect: "Expect fair treatment",
  fairOthers: "People like me treated fairly",
};
const SPLITS = [
  ["gender", "Gender"],
  ["race", "Race or ethnicity"],
  ["age", "Age"],
  ["student", "School"],
  ["experience", "Experience with cars"],
] as const;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const avgText = (v: number | null) => (v === null ? "–" : v.toFixed(2));
const weekLabel = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function SurveyTab() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [source, setSource] = useState("");
  const [tests, setTests] = useState(false);
  const [by, setBy] = useState<(typeof SPLITS)[number][0]>("gender");
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [purging, setPurging] = useState<"confirm" | "busy" | null>(null);

  const query = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}), ...(source ? { source } : {}), ...(tests ? { test: "1" } : {}) }).toString();

  const load = useCallback(async () => {
    const { error, data: d } = await apiCall(`/api/board/survey${query ? `?${query}` : ""}`, "GET");
    if (error) return setLoadError(error);
    setLoadError("");
    setData(d as unknown as Loaded);
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  async function purge() {
    setPurging("busy");
    const { error, data: d } = await apiCall("/api/board/survey", "DELETE");
    setPurging(null);
    if (error) return setMsg({ kind: "err", text: error });
    setMsg({ kind: "ok", text: `Deleted ${plural(Number(d?.deleted ?? 0), "test response")}.` });
    load();
  }

  const L = data?.labels;
  const maxWeek = Math.max(1, ...(data?.perWeek.map((w) => w.n) ?? [1]));

  return (
    <section className="survey-tab">
      <h2>Survey</h2>
      <p>
        Answers to the public <a href="/en/survey">Car Confidence Survey</a> from every chapter. It&apos;s anonymous: no names, emails or IP
        addresses are kept, only the day someone took it. Only admins see this tab.
      </p>
      {L && !L.approved && (
        <p className="msg err">
          The question wording is still a placeholder. Add the approved wording to lib/survey/questions.ts before launch; until then the survey
          stays admin-only.
        </p>
      )}
      {L && L.approved && !L.isPublic && <p className="deep">Not public yet: only admins can open the survey (SURVEY_PUBLIC is off).</p>}

      <div className="admin-row survey-filters">
        <label className="inline">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="inline">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="inline">
          Source
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All</option>
            {data?.sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="check inline">
          <input type="checkbox" checked={tests} onChange={(e) => setTests(e.target.checked)} />
          Include test responses{data ? ` (${data.tests})` : ""}
        </label>
      </div>
      <div className="admin-row">
        <a className="btn" href={chapterUrl(`/api/board/survey/csv${query ? `?${query}` : ""}`)} download>
          Download CSV
        </a>
        {purging === null ? (
          <button type="button" className="btn btn-line" disabled={!data?.tests} onClick={() => setPurging("confirm")}>
            Delete test responses
          </button>
        ) : (
          <span className="admin-row confirm">
            <span>Delete {plural(data?.tests ?? 0, "test response")} for good?</span>
            <button type="button" className="btn" disabled={purging === "busy"} onClick={purge}>
              {purging === "busy" ? "Deleting…" : "Yes, delete"}
            </button>
            <button type="button" className="btn btn-line" disabled={purging === "busy"} onClick={() => setPurging(null)}>
              Keep them
            </button>
          </span>
        )}
      </div>
      {msg && (
        <p className={`msg ${msg.kind}`} role="status">
          {msg.text}
        </p>
      )}
      {loadError && (
        <p className="msg err" role="alert">
          {loadError}
        </p>
      )}
      {!data && !loadError && <p>Loading…</p>}

      {data && L && (
        <>
          <div className="sv-tiles">
            <div className="sv-tile">
              <b>{data.total}</b>
              <span>{data.total === 1 ? "response" : "responses"}</span>
            </div>
            {(["breakdown", "buying", "repair"] as const).map((s) => (
              <div className="sv-tile" key={s}>
                <b>{avgText(data.sections[s])}</b>
                <span>{DASH_LABELS[s]} (avg of 5)</span>
              </div>
            ))}
          </div>

          {data.total === 0 ? (
            <p className="empty">No responses match these filters yet.</p>
          ) : (
            <>
              <h3>Responses per week</h3>
              <BarList rows={data.perWeek.map((w) => ({ label: `Week of ${weekLabel(w.key)}`, n: w.n }))} max={maxWeek} />
              <div className="cols">
                <div>
                  <h3>By source</h3>
                  <BarList rows={data.bySource.map((s) => ({ label: s.key, n: s.n }))} />
                </div>
                <div>
                  <h3>By school</h3>
                  <BarList rows={data.bySchool.map((s) => ({ label: s.key === "skipped" ? "Skipped" : (L.demo.student.options[s.key] ?? s.key), n: s.n }))} />
                </div>
              </div>

              {(["breakdown", "buying", "repair"] as const).map((s) => (
                <div key={s} className="sv-sec">
                  <h3>
                    {L.sections[s].title} <span className="deep">· average {avgText(data.sections[s])}</span>
                  </h3>
                  {L.sectionItems[s].map((id) => (
                    <ItemRow key={id} id={id} text={L.items[id]} stat={data.items[id]} />
                  ))}
                </div>
              ))}

              <div className="sv-sec">
                <h3>{L.sections.fair.title}</h3>
                <p className="deep">
                  Each &ldquo;I expect&rdquo; item next to its &ldquo;People of my gender/race&rdquo; partner. Expect: average{" "}
                  {avgText(data.sections.fairExpect)} · People like me: average {avgText(data.sections.fairOthers)}
                </p>
                {L.pairs.map(([a, b]) => (
                  <div className="sv-pair" key={a}>
                    <ItemRow id={a} text={L.items[a]} stat={data.items[a]} />
                    <ItemRow id={b} text={L.items[b]} stat={data.items[b]} />
                  </div>
                ))}
              </div>

              <div className="sv-sec">
                <h3>Compare by group</h3>
                <label className="inline">
                  Split by
                  <select value={by} onChange={(e) => setBy(e.target.value as typeof by)}>
                    {SPLITS.map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="deep small">
                  Averages out of 5. Someone who picked more than one answer counts in each group. Groups with fewer than 5 responses
                  aren&apos;t shown.
                </p>
                <div className="sv-groups">
                  {data.splits[by].map((g) => (
                    <div className="sv-group" key={g.key}>
                      <h4>
                        {g.key === "skipped" ? "Skipped" : (L.demo[by].options[g.key] ?? g.key)}
                        {"n" in g && <span className="deep"> · {plural(g.n, "response")}</span>}
                      </h4>
                      {"hidden" in g ? (
                        <p className="deep">Too few responses to show.</p>
                      ) : (
                        (Object.keys(DASH_LABELS) as DashSection[]).map((s) => (
                          <Meter key={s} label={DASH_LABELS[s]} value={g.sections[s]} />
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

// Counts as horizontal bars, longest = max.
function BarList({ rows, max }: { rows: { label: string; n: number }[]; max?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.n));
  return (
    <ul className="sv-bars">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.n}`}>
          <span className="sv-bar-label">{r.label}</span>
          <span className="sv-bar-track">
            <span style={{ width: `${(r.n / top) * 100}%` }} />
          </span>
          <span className="sv-bar-n">{r.n}</span>
        </li>
      ))}
    </ul>
  );
}

// An average out of 5 as a bar.
function Meter({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="sv-meter-row" title={`${label}: ${avgText(value)} of 5`}>
      <span className="sv-bar-label">{label}</span>
      <span className="sv-bar-track">
        <span style={{ width: `${((value ?? 0) / 5) * 100}%` }} />
      </span>
      <span className="sv-bar-n">{avgText(value)}</span>
    </div>
  );
}

// One item: its wording, average and how many picked each of 1–5.
function ItemRow({ id, text, stat }: { id: string; text: string; stat: { n: number; avg: number | null; dist: number[] } }) {
  const top = Math.max(1, ...stat.dist);
  return (
    <div className="sv-item">
      <div className="sv-item-text">
        <span className="sv-id">{id}</span> {text}
      </div>
      <div className="sv-item-avg">
        <b>{avgText(stat.avg)}</b>
        <span>avg · {stat.n}</span>
      </div>
      <div className="sv-hist" role="img" aria-label={`${id}: ${stat.dist.map((c, i) => `${i + 1}: ${c}`).join(", ")}`}>
        {stat.dist.map((c, i) => (
          <div key={i} className="sv-hist-col" title={`${i + 1}: ${c} ${c === 1 ? "person" : "people"}`}>
            <span className="sv-hist-n">{c}</span>
            <span className="sv-hist-bar">
              <span style={{ height: `${(c / top) * 100}%` }} />
            </span>
            <span className="sv-hist-x">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
