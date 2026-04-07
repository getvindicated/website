"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/actions/email";
import {
  PageHero,
  FadeUp,
  SectionLabel,
  SectionTitle,
  Button,
} from "@/components/ui";

const topics = [
  { value: "volunteer", label: "Volunteering with VINdicated" },
  { value: "research", label: "Participating in Research" },
  { value: "story", label: "Sharing My Story" },
  { value: "press", label: "Press & Media" },
  { value: "partnership", label: "Partnership or Collaboration" },
  { value: "grant", label: "Grants & Funding" },
  { value: "general", label: "General Inquiry" },
];

const sideInfo = [
  {
    cat: "Volunteer",
    body: "We have teams for tech, content, design, and operations. If you want to contribute skills to a mission that matters — we'd love to have you.",
  },
  {
    cat: "Research Participants",
    body: "Our correspondence audit studies need testers. Participation is remote, anonymous, and directly contributes to publishable research on automotive discrimination.",
  },
  {
    cat: "Share Your Story",
    body: "Have you experienced discriminatory treatment at a dealership or from a private seller? Your story may contribute to our research or help us better serve our community.",
  },
  {
    cat: "Press & Media",
    body: "For media inquiries about VINdicated or our research, reach out directly. Our founder is available for comment on automotive consumer discrimination.",
  },
];

const inputCls = `
  w-full px-4 py-[0.9rem] text-[0.95rem] font-[Arial] outline-none transition-colors duration-200
  bg-white/[0.04] border border-white/[0.08] text-white
  focus:border-[#5a3069] focus:bg-[rgba(124,58,237,0.06)]
`;

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSubmitted(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      topic: formData.get("topic") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await submitContactForm(data);
      if (res.success) {
        setSubmitted(true);
        form.reset();
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(res.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        {["First Name", "Last Name"].map((label) => (
          <div key={label} className="flex flex-col gap-2">
            <label
              className="text-[0.8rem] font-semibold"
              style={{ color: "var(--color-light)" }}
            >
              {label}
            </label>
            <input
              type="text"
              name={label === "First Name" ? "firstName" : "lastName"}
              required
              className={inputCls}
              placeholder={label === "First Name" ? "Your" : "Name"}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-[0.8rem] font-semibold"
          style={{ color: "var(--color-light)" }}
        >
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          className={inputCls}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-[0.8rem] font-semibold"
          style={{ color: "var(--color-light)" }}
        >
          I’m reaching out about…
        </label>
        <select
          name="topic"
          required
          className={inputCls}
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <option value="">Select a topic</option>
          {topics.map((t) => (
            <option
              key={t.value}
              value={t.label}
              style={{ background: "#0d0814" }}
            >
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-[0.8rem] font-semibold"
          style={{ color: "var(--color-light)" }}
        >
          Message
        </label>
        <textarea
          name="message"
          required
          rows={6}
          className={inputCls}
          style={{ resize: "vertical", minHeight: 120 }}
          placeholder="Tell us what's on your mind..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-[0.9rem] text-[0.85rem] font-semibold tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        style={{ background: "var(--color-vivid)" }}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      {error && (
        <div
          className="px-5 py-4 text-[0.9rem]"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderLeft: "4px solid #ef4444",
            color: "#fca5a5"
          }}
        >
          {error}
        </div>
      )}

      {submitted && (
        <div
          className="px-5 py-4 text-[0.9rem]"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(90,48,105,0.2)",
            borderLeft: "4px solid var(--color-vivid)",
          }}
        >
          Message received. We&apos;ll be in touch soon.
        </div>
      )}
    </form>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Get in Touch"
        title={
          <>
            We want to
            <br />
            <em>hear from you.</em>
          </>
        }
        subtitle="Whether you want to share your story, volunteer with our team, participate in our research, or partner with VINdicated — reach out."
      />

      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div
            className="grid gap-24 items-start max-lg:grid-cols-1"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            {/* Form */}
            <div>
              <SectionLabel>Send a Message</SectionLabel>
              <ContactForm />
            </div>

            {/* Side info */}
            <div>
              <SectionLabel>Ways to Connect</SectionLabel>
              <SectionTitle className="mb-10">
                <em>Join the movement.</em>
              </SectionTitle>

              <div
                className="flex flex-col gap-[1.5px] mb-12"
                style={{ background: "var(--color-border)" }}
              >
                {sideInfo.map(({ cat, body }) => (
                  <div
                    key={cat}
                    className="px-8 py-8"
                    style={{ background: "var(--color-bg-surface)" }}
                  >
                    <p
                      className="text-[0.65rem] tracking-wide mb-2"
                      style={{ color: "var(--color-light)" }}
                    >
                      {cat}
                    </p>
                    <p className="text-[0.9rem] leading-[1.6]">{body}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  href="https://linkedin.com/company/vindicated"
                  variant="outline"
                  className="flex-1 text-center"
                  external
                >
                  LinkedIn
                </Button>
                <Button
                  href="https://instagram.com"
                  variant="outline"
                  className="flex-1 text-center"
                  external
                >
                  Instagram
                </Button>
              </div>
            </div>
          </div>
        </section>
      </FadeUp>
    </>
  );
}
