"use client";

import { useState, type FormEvent } from "react";
import type { JoinPageDict } from "@/lib/i18n/dictionary";
import { submitContactForm } from "@/app/actions/email";

type Status = "idle" | "submitting" | "success" | "error";

// Sent in the notification email, so kept in English regardless of the
// page's language. Same order as joinPage.contact.topics.
const TOPIC_VALUES = [
  "Volunteering with VINdicated",
  "Participating in Research",
  "Sharing My Story",
  "Press & Media",
  "Partnership or Collaboration",
  "Grants & Funding",
  "General Inquiry",
];

export function ContactForm({ dict, locale }: { dict: JoinPageDict["contact"]; locale: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    if (!get("email") || !get("message")) {
      setStatus("error");
      setMessage(dict.missing);
      form.querySelector<HTMLElement>(get("email") ? '[name="message"]' : '[name="email"]')?.focus();
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const topic = get("topic");
      const res = await submitContactForm(
        {
          firstName: get("firstName"),
          lastName: get("lastName"),
          email: get("email"),
          topic,
          topicLabel: dict.topics[TOPIC_VALUES.indexOf(topic)],
          message: get("message"),
          company: get("company"),
        },
        locale,
      );
      if (res.success) {
        setStatus("success");
        setMessage(dict.sent);
        form.reset();
      } else {
        setStatus("error");
        setMessage(res.code === "missing" ? dict.missing : res.code === "tooMany" ? dict.tooMany : dict.failed);
      }
    } catch {
      setStatus("error");
      setMessage(dict.failed);
    }
  }

  return (
    <form className="apply" noValidate onSubmit={onSubmit}>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className="fld">
        <label htmlFor="c-first">{dict.firstName}</label>
        <input id="c-first" name="firstName" autoComplete="given-name" />
      </div>
      <div className="fld">
        <label htmlFor="c-last">{dict.lastName}</label>
        <input id="c-last" name="lastName" autoComplete="family-name" />
      </div>
      <div className="fld">
        <label htmlFor="c-email">{dict.email}</label>
        <input id="c-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="fld">
        <label htmlFor="c-topic">{dict.topic}</label>
        <select id="c-topic" name="topic" defaultValue="">
          <option value="">{dict.topicPlaceholder}</option>
          {TOPIC_VALUES.map((v, i) => (
            <option key={v} value={v}>
              {dict.topics[i]}
            </option>
          ))}
        </select>
      </div>
      <div className="fld full">
        <label htmlFor="c-msg">{dict.message}</label>
        <textarea id="c-msg" name="message" required />
      </div>
      <div className={status === "success" ? "form-ok" : "form-note"} role="status" aria-live="polite">
        {message}
      </div>
      <div>
        <button className="btn btn-solid" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? dict.submitting : dict.submit}
        </button>
      </div>
    </form>
  );
}
