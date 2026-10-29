"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ApplyPageDict } from "@/lib/i18n/dictionary";
import { MAX_POSITIONS, MAX_RESUME_BYTES, MAX_WORDS, YEARS, checkApplication, wordCount, type InputError } from "@/lib/apply/rules";

// The board application form on /apply. Only open chapters are offered,
// with their open positions. The form checks the answers the same way the
// server does (lib/apply/rules.ts), and the server checks them again.

export type OpenChapter = { id: string; name: string; positions: string[] };

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));

export function BoardApplyForm({ dict, chapters, locale }: { dict: ApplyPageDict; chapters: OpenChapter[]; locale: string }) {
  const f = dict.form;
  const [chapter, setChapter] = useState(chapters.length === 1 ? chapters[0].id : "");
  const [picked, setPicked] = useState<string[]>([]);
  const [why, setWhy] = useState("");
  const [bring, setBring] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ email: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const positions = chapters.find((c) => c.id === chapter)?.positions ?? [];

  // ?chapter=ucla from the Get Involved page.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("chapter");
    if (c && chapters.some((x) => x.id === c)) setChapter(c);
  }, [chapters]);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  function toggle(p: string, on: boolean) {
    setPicked((now) => (on ? [...now, p].slice(0, MAX_POSITIONS) : now.filter((x) => x !== p)));
  }

  // Shows the problem and moves to its field.
  function problem(code: string) {
    setError((dict.errors as Record<string, string>)[code] ?? dict.errors.failed);
    const field = formRef.current?.querySelector<HTMLElement>(`[data-field="${code}"]`);
    field?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "");
    if (!chapters.some((c) => c.id === chapter)) return problem("chapter");
    const checked = checkApplication(
      {
        chapter,
        positions: picked,
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        year: get("year"),
        major: get("major"),
        why,
        bring,
        hours: Number(get("hours")),
        link: get("link"),
        heard: get("heard"),
        commit: data.get("commit") === "yes",
      },
      positions,
      locale,
    );
    if (!checked.ok) return problem(checked.field satisfies InputError);
    const resume = data.get("resume");
    if (resume instanceof File && resume.size > 0) {
      if (!/\.pdf$/i.test(resume.name)) return problem("resumeType");
      if (resume.size > MAX_RESUME_BYTES) return problem("resumeSize");
    } else {
      data.delete("resume");
    }
    data.set("chapter", chapter);
    data.delete("positions");
    for (const p of picked) data.append("positions", p);
    data.set("locale", locale);

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/apply", { method: "POST", body: data });
      const j = await res.json().catch(() => null);
      if (res.ok && j?.ok) {
        setDone({ email: j.email });
        return;
      }
      problem(typeof j?.error === "string" ? j.error : "failed");
    } catch {
      problem("failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="apply-done" ref={doneRef} tabIndex={-1} role="status">
        <h3>{dict.done.title}</h3>
        <p>{fill(dict.done.body, { email: done.email })}</p>
      </div>
    );
  }

  const words = (text: string) => {
    const n = wordCount(text, locale);
    return (
      <span className={`words${n > MAX_WORDS ? " over" : ""}`} aria-live="polite">
        {fill(f.words, { n, max: MAX_WORDS })}
      </span>
    );
  };

  return (
    <form className="apply board-apply" ref={formRef} noValidate onSubmit={onSubmit}>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className="fld full">
        <label htmlFor="ba-chapter">{f.chapter}</label>
        <select
          id="ba-chapter"
          data-field="chapter"
          value={chapter}
          required
          onChange={(e) => (setChapter(e.target.value), setPicked([]))}
        >
          {chapters.length > 1 && <option value="">{f.chapterPick}</option>}
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="fld full">
        <legend>{f.positions}</legend>
        {positions.length === 0 ? (
          <p className="hint">{f.positionsPickChapter}</p>
        ) : (
          <>
            <p className="hint" id="ba-pos-hint">
              {f.positionsHint}
            </p>
            <div className="checks" aria-describedby="ba-pos-hint">
              {positions.map((p, i) => {
                const on = picked.includes(p);
                return (
                  <label key={p} className={`pick${on ? " on" : ""}`}>
                    <input
                      type="checkbox"
                      data-field={i === 0 ? "positions" : undefined}
                      checked={on}
                      disabled={!on && picked.length >= MAX_POSITIONS}
                      onChange={(e) => toggle(p, e.target.checked)}
                    />
                    {p}
                  </label>
                );
              })}
            </div>
          </>
        )}
      </fieldset>
      <div className="fld">
        <label htmlFor="ba-name">{f.name}</label>
        <input id="ba-name" name="name" dir="auto" data-field="name" autoComplete="name" required maxLength={120} />
      </div>
      <div className="fld">
        <label htmlFor="ba-email">{f.email}</label>
        <input id="ba-email" name="email" data-field="email" type="email" autoComplete="email" required maxLength={254} />
      </div>
      <div className="fld">
        <label htmlFor="ba-phone">{f.phone}</label>
        <input id="ba-phone" name="phone" data-field="phone" type="tel" autoComplete="tel" maxLength={40} />
      </div>
      <div className="fld">
        <label htmlFor="ba-year">{f.year}</label>
        <select id="ba-year" name="year" data-field="year" required defaultValue="">
          <option value="">{f.yearPick}</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {f.years[y]}
            </option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label htmlFor="ba-major">{f.major}</label>
        <input id="ba-major" name="major" dir="auto" data-field="major" required maxLength={120} />
      </div>
      <div className="fld">
        <label htmlFor="ba-hours">{f.hours}</label>
        <input id="ba-hours" name="hours" data-field="hours" type="number" inputMode="numeric" min={1} max={40} step={1} required />
      </div>
      <div className="fld full">
        <label htmlFor="ba-why">{f.why}</label>
        <textarea id="ba-why" name="why" dir="auto" data-field="why" value={why} onChange={(e) => setWhy(e.target.value)} required aria-describedby="ba-why-n" />
        <span id="ba-why-n">{words(why)}</span>
      </div>
      <div className="fld full">
        <label htmlFor="ba-bring">{f.bring}</label>
        <textarea id="ba-bring" name="bring" dir="auto" data-field="bring" value={bring} onChange={(e) => setBring(e.target.value)} required aria-describedby="ba-bring-n" />
        <span id="ba-bring-n">{words(bring)}</span>
      </div>
      <div className="fld full">
        <label htmlFor="ba-resume">{f.resume}</label>
        <input id="ba-resume" name="resume" data-field="resumeType" type="file" accept="application/pdf,.pdf" />
      </div>
      <div className="fld">
        <label htmlFor="ba-link">{f.link}</label>
        <input id="ba-link" name="link" data-field="link" type="url" inputMode="url" maxLength={300} placeholder="https://" dir="ltr" />
      </div>
      <div className="fld">
        <label htmlFor="ba-heard">{f.heard}</label>
        <input id="ba-heard" name="heard" dir="auto" data-field="heard" maxLength={300} />
      </div>
      <label className="fld full commit">
        <input type="checkbox" name="commit" value="yes" data-field="commit" required />
        <span>{f.commit}</span>
      </label>
      <div className="form-note" role="alert">
        {error}
      </div>
      <div>
        <button className="btn btn-solid" type="submit" disabled={busy}>
          {busy ? f.sending : f.submit}
        </button>
      </div>
    </form>
  );
}
