"use client";

import { useState, type FormEvent } from "react";
import type { ApplyPageDict } from "@/lib/i18n/dictionary";

// "Email me when they open": saves an email for a closed chapter. Only the
// chapter's hub admins see the list.

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

export function NotifyForm({ dict, chapters, locale }: { dict: ApplyPageDict["closed"]; chapters: { id: string; name: string }[]; locale: string }) {
  const [chapter, setChapter] = useState(chapters[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/apply/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chapter, email, locale, company: data.get("company") ?? "" }),
      });
      const name = chapters.find((c) => c.id === chapter)?.name ?? "";
      setMsg(res.ok ? { ok: true, text: fill(dict.notifyDone, { email, chapter: name }) } : { ok: false, text: dict.notifyError });
    } catch {
      setMsg({ ok: false, text: dict.notifyError });
    } finally {
      setBusy(false);
    }
  }

  if (!chapters.length) return null;
  return (
    <form className="apply notify" noValidate onSubmit={onSubmit}>
      <h3 className="full">{dict.notifyTitle}</h3>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {chapters.length > 1 && (
        <div className="fld">
          <label htmlFor="nf-chapter">{dict.notifyChapter}</label>
          <select id="nf-chapter" value={chapter} onChange={(e) => setChapter(e.target.value)}>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="fld">
        <label htmlFor="nf-email">{dict.notifyEmail}</label>
        <input id="nf-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      </div>
      <div className={msg?.ok ? "form-ok" : "form-note"} role="status" aria-live="polite">
        {msg?.text}
      </div>
      <div>
        <button className="btn btn-line" type="submit" disabled={busy}>
          {busy ? dict.notifySending : dict.notifySubmit}
        </button>
      </div>
    </form>
  );
}
