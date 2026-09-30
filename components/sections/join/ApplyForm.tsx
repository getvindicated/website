"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { JoinPageDict } from "@/lib/i18n/dictionary";
import { submitVolunteerApplication } from "@/app/actions/submitVolunteer";

type Dict = JoinPageDict;
type Status = "idle" | "submitting" | "success" | "error";

// Values must match CHAPTER_RECIPIENTS in app/actions/submitVolunteer.ts.
const CHAPTER_VALUES = ["ucla", "ucberkeley", "ucsc"] as const;
const ROLE_VALUES = [
  "research-analyst",
  "data-engineer",
  "software-engineer",
  "outreach",
  "legal-research",
  "design",
] as const;

// Short keys used by links elsewhere on the site (?chapter=&role=).
const CHAPTER_ALIASES: Record<string, string> = {
  ucla: "ucla",
  berkeley: "ucberkeley",
  ucberkeley: "ucberkeley",
  ucsc: "ucsc",
};
const ROLE_ALIASES: Record<string, string> = {
  research: "research-analyst",
  data: "data-engineer",
  software: "software-engineer",
  outreach: "outreach",
  legal: "legal-research",
  design: "design",
};

const MAX_RESUME = 5 * 1024 * 1024;

export function ApplyForm({ dict }: { dict: Dict }) {
  const f = dict.form;
  const [chapter, setChapter] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Preselect from ?chapter= and ?role= (campus cards, project buttons).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = CHAPTER_ALIASES[q.get("chapter") ?? ""];
    const r = ROLE_ALIASES[q.get("role") ?? ""];
    if (c) setChapter(c);
    if (r) setRole(r);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const missing = ["chapter", "role", "name", "email"].filter((k) => !get(k));
    if (missing.length) {
      setStatus("error");
      setMessage(f.missing);
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(get("email"))) {
      setStatus("error");
      setMessage(f.badEmail);
      form.querySelector<HTMLElement>('[name="email"]')?.focus();
      return;
    }

    const file = data.get("resume") as File | null;
    let resume: { filename: string; base64: string } | undefined;
    if (file && file.size > 0) {
      if (file.size > MAX_RESUME) {
        setStatus("error");
        setMessage(f.tooLarge);
        return;
      }
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      }).catch(() => undefined);
      if (base64) resume = { filename: file.name, base64 };
    }

    setStatus("submitting");
    setMessage("");
    try {
      const result = await submitVolunteerApplication({
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        chapter: get("chapter"),
        role: get("role"),
        hours: Number(get("hours")),
        location: get("location"),
        background: get("background"),
        why: get("why"),
        student: get("student"),
        resume,
      });
      setStatus(result.success ? "success" : "error");
      setMessage(result.message);
      if (result.success) {
        form.reset();
        setChapter("");
        setRole("");
      }
    } catch {
      setStatus("error");
      setMessage(f.failed);
    }
  }

  return (
    <form className="apply" ref={formRef} noValidate onSubmit={onSubmit}>
      <div className="fld">
        <label htmlFor="f-ch">{f.chapter}</label>
        <select id="f-ch" name="chapter" required value={chapter} onChange={(e) => setChapter(e.target.value)}>
          <option value="">{f.chapterPlaceholder}</option>
          {CHAPTER_VALUES.map((v, i) => (
            <option key={v} value={v}>
              {dict.chapters.items[i].name}
            </option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label htmlFor="f-role">{f.role}</label>
        <select id="f-role" name="role" required value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">{f.rolePlaceholder}</option>
          {ROLE_VALUES.map((v, i) => (
            <option key={v} value={v}>
              {dict.roles.items[i]}
            </option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label htmlFor="f-name">{f.name}</label>
        <input id="f-name" name="name" autoComplete="name" required />
      </div>
      <div className="fld">
        <label htmlFor="f-email">{f.email}</label>
        <input id="f-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="fld">
        <label htmlFor="f-phone">{f.phone}</label>
        <input id="f-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="fld">
        <label htmlFor="f-hrs">{f.hours}</label>
        <input id="f-hrs" name="hours" type="number" min={1} max={40} />
      </div>
      <fieldset className="fld">
        <legend>{f.student}</legend>
        <div className="radios">
          <label>
            <input type="radio" name="student" value="yes" /> {f.yes}
          </label>
          <label>
            <input type="radio" name="student" value="no" /> {f.no}
          </label>
        </div>
      </fieldset>
      <div className="fld">
        <label htmlFor="f-loc">{f.location}</label>
        <input id="f-loc" name="location" />
      </div>
      <div className="fld full">
        <label htmlFor="f-bg">{f.background}</label>
        <textarea id="f-bg" name="background" />
      </div>
      <div className="fld full">
        <label htmlFor="f-cv">{f.resume}</label>
        <input id="f-cv" name="resume" type="file" accept=".pdf,.doc,.docx" />
      </div>
      <div className="fld full">
        <label htmlFor="f-why">{f.why}</label>
        <textarea id="f-why" name="why" />
      </div>
      <div className={status === "success" ? "form-ok" : "form-note"} role="status" aria-live="polite">
        {message}
      </div>
      <div>
        <button className="btn btn-solid" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? f.submitting : f.submit}
        </button>
      </div>
    </form>
  );
}
