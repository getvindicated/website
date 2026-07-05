"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/actions/email";
import {
  PageHero,
  FadeUp,
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
    body: "We have teams for tech, content, design, and operations. If you want to contribute skills to a mission that matters, we'd love to have you.",
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
  w-full bg-transparent border-b-2 border-white/20 focus:border-[#ff2d78] outline-none text-white text-[0.95rem] pb-2 transition-colors duration-200 placeholder:text-white/30
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
  className="flex items-center gap-3 px-8 py-[0.9rem] text-[0.95rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
  style={{ background: "var(--color-vivid)" }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
  {isSubmitting ? "Sending..." : "Send it"}
</button>
      
      {error && (
        <div
          className="rounded-xl px-5 py-4 text-[0.9rem]"
          style={{
            background: "rgba(214,59,59,0.1)",
            border: "1px solid rgba(214,59,59,0.3)",
            color: "#fca5a5"
          }}
        >
          {error}
        </div>
      )}

      {submitted && (
        <div
          className="rounded-xl px-5 py-4 text-[0.9rem]"
          style={{
            background: "rgba(149,51,165,0.1)",
            border: "1px solid var(--color-border)",
            color: "#fff",
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
        kicker=""
        title={
          <>
            We want to
            <br />
            <em>hear from you.</em>
          </>
        }
        subtitle="Whether you want to share your story, volunteer with our team, participate in our research, or partner with VINdicated, reach out."
      />

      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <div
            className="grid grid-cols-[1fr_1fr] gap-24 max-lg:gap-16 items-start max-lg:grid-cols-1"
          >
            {/* Form */}
            <div>
              <ContactForm />
            </div>

            {/* Side info */}
            <div>
              <SectionTitle className="mb-10">
                <em>Join the movement.</em>
              </SectionTitle>

              <div
                className="mb-12"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                {sideInfo.map(({ cat, body }) => (
                  <div
                    key={cat}
                    className="py-7"
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <h3 className="text-[1.15rem] leading-[1.3] mb-2" style={{ fontFamily: "var(--font-heading), Georgia, serif" }}>
  {cat}
</h3>
<p className="text-[0.95rem] text-white leading-[1.7]">{body}</p>
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
