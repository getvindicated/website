"use client";

import { useState } from "react";
import Image from "next/image";
import { PageHero, FadeUp, SectionTitle, Button } from "@/components/ui";
import { submitVolunteerApplication } from "@/app/actions/submitVolunteer";
import { submitContactForm } from "@/app/actions/email";

const CHAPTERS = [
  {
    value: "ucla",
    label: "UCLA Chapter",
    school: "University of California, Los Angeles",
    lead: "Rana Darwich, Founder & Executive Director",
    contact: "getvindicated@outlook.com",
    focus: "Built the interactive dealership risk map and leads VINdicated's core consumer research and data infrastructure.",
    mascot: "/ucla-mascot.png",
  },
  {
    value: "ucberkeley",
    label: "UC Berkeley Chapter",
    school: "University of California, Berkeley",
    lead: "Halima Cherif Hminat, Research & Outreach Lead · Ameerah Zafar, Data Engineer",
    contact: "halimacherif@berkeley.edu · azzafar@berkeley.edu",
    focus: "Currently building out its membership. Focused on consumer education and outreach.",
    mascot: "/berkeley-mascot.png",
  },
  {
    value: "ucsc",
    label: "UC Santa Cruz Chapter",
    school: "University of California, Santa Cruz",
    lead: "Ashwin Vinod, President · Gundeep Sambee, Outreach Lead",
    contact: "asvinod@ucsc.edu · gsambee@ucsc.edu",
    mascot: "/ucsc-mascot.png",
    focus: "Focused on algorithmic discrimination and AI bias in automotive retail, bringing a technical lens to consumer protection.",
  },
];

const ROLES = [
  { value: "research-analyst", label: "Research Analyst", min_hours: 5 },
  { value: "data-engineer", label: "Data Engineer / Analyst", min_hours: 5 },
  { value: "software-engineer", label: "Software Engineer", min_hours: 5 },
  { value: "outreach", label: "Outreach & Communications", min_hours: 3 },
  { value: "legal-research", label: "Legal Research", min_hours: 3 },
  { value: "design", label: "Graphic Design / Illustration", min_hours: 3 },
];

const TOPICS = [
  { value: "volunteer", label: "Volunteering with VINdicated" },
  { value: "research", label: "Participating in Research" },
  { value: "story", label: "Sharing My Story" },
  { value: "press", label: "Press & Media" },
  { value: "partnership", label: "Partnership or Collaboration" },
  { value: "grant", label: "Grants & Funding" },
  { value: "general", label: "General Inquiry" },
];

const SIDE_INFO = [
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

const fieldCls =
  "w-full bg-transparent border-b border-white/20 focus:border-white/60 outline-none text-white text-[1rem] pb-2 transition-colors";

type Tab = "contact" | "volunteer";
type FormState = "idle" | "submitting" | "success" | "error";

export default function JoinPage() {
  const [tab, setTab] = useState<Tab>("volunteer");

  return (
    <>
      <PageHero
        kicker=""
        title={<>Get <em>Involved.</em></>}
        subtitle="Volunteer with a chapter, share your story, participate in our research, or just say hello — pick what fits below."
      />

      <FadeUp>
        <section className="px-20 py-24 max-md:px-6 max-md:py-16">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] mb-14">
            Our <em>Chapters.</em>
          </h2>

          <div className="grid grid-cols-3 gap-10 max-lg:grid-cols-1 mb-24">
            {CHAPTERS.map((ch) => (
              <div key={ch.value}>
                {ch.mascot && (
                  <Image
                    src={ch.mascot}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-auto object-contain mb-4"
                  />
                )}
                <p className="text-[1.4rem] font-semibold text-white mb-1">{ch.label}</p>
                <p className="text-[1rem] text-white mb-5">{ch.school}</p>
                <p className="text-[0.95rem] text-white leading-[1.7] mb-5">{ch.focus}</p>
                <p className="text-[0.9rem] text-white mb-1">
                  <span className="font-semibold">Leads:</span> {ch.lead}
                </p>
                <p className="text-[0.9rem] text-white">
                  <span className="font-semibold">Contact:</span> {ch.contact}
                </p>
              </div>
            ))}
          </div>

          {/* Tab toggle */}
          <div
            className="flex gap-2 mb-14 w-fit"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <button
              onClick={() => setTab("volunteer")}
              className="px-5 py-3 text-[0.95rem] font-semibold transition-colors"
              style={{
                color: tab === "volunteer" ? "var(--color-accent)" : "rgba(255,255,255,0.6)",
                borderBottom: tab === "volunteer" ? "2px solid var(--color-accent)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              Apply to Volunteer
            </button>
            <button
              onClick={() => setTab("contact")}
              className="px-5 py-3 text-[0.95rem] font-semibold transition-colors"
              style={{
                color: tab === "contact" ? "var(--color-accent)" : "rgba(255,255,255,0.6)",
                borderBottom: tab === "contact" ? "2px solid var(--color-accent)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              General Contact
            </button>
          </div>

          {tab === "volunteer" ? <VolunteerPanel /> : <ContactPanel />}
        </section>
      </FadeUp>

      <FadeUp>
        <section className="px-20 py-16 max-md:px-6">
          <p className="text-[1.05rem] text-white leading-[1.75] max-w-[600px]">
            Questions? Email us at{" "}
            <a href="mailto:getvindicated@outlook.com" className="underline" style={{ color: "var(--color-accent)" }}>
              getvindicated@outlook.com
            </a>
          </p>
        </section>
      </FadeUp>
    </>
  );
}

// ── Volunteer application panel ──────────────────────────────
function VolunteerPanel() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const resumeFile = data.get("resume") as File | null;
    let resume: { filename: string; base64: string } | undefined;

    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > 5 * 1024 * 1024) {
        setState("error");
        setMessage("Your resume file is too large. Please upload a file under 5MB.");
        return;
      }
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(resumeFile);
      }).catch(() => undefined);
      if (base64) {
        resume = { filename: resumeFile.name, base64 };
      }
    }

    try {
      const result = await submitVolunteerApplication({
        name: data.get("name") as string,
        email: data.get("email") as string,
        phone: data.get("phone") as string,
        chapter: data.get("chapter") as string,
        role: data.get("role") as string,
        hours: Number(data.get("hours")),
        location: data.get("location") as string,
        background: data.get("background") as string,
        why: data.get("why") as string,
        student: data.get("student") as string,
        resume,
      });
      if (result.success) {
        setState("success");
        setMessage(result.message);
        form.reset();
      } else {
        setState("error");
        setMessage(result.message);
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again or email us directly at getvindicated@outlook.com.");
    }
  }

  if (state === "success") {
    return (
      <div className="max-w-[600px]">
        <SectionTitle className="mb-5">
          Application <em>received.</em>
        </SectionTitle>
        <p className="text-[1.05rem] text-white leading-[1.7]">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-20 items-start max-lg:grid-cols-1">
      <div>
        <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] mb-6">
          What we're <em>looking for.</em>
        </h2>
        <div>
          {ROLES.map((role) => (
            <div key={role.value} className="py-4">
              <p className="text-[1.05rem] font-semibold text-white">{role.label}</p>
              <p className="text-[0.9rem] text-white mt-1">{role.min_hours}+ hours per week</p>
            </div>
          ))}
        </div>
        <p className="text-[0.9rem] text-white leading-[1.6] mt-8">
          All positions are remote and unpaid. VINdicated is a volunteer-run nonprofit.
        </p>
      </div>

      <div>
        {state === "error" && (
          <p
            className="text-[0.95rem] leading-[1.6] mb-8 p-4 rounded-xl"
            style={{
              background: "rgba(214,59,59,0.08)",
              border: "1px solid rgba(214,59,59,0.3)",
              color: "var(--color-red)",
            }}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[0.85rem] text-white mb-2">Which chapter are you applying to?</label>
            <select name="chapter" required className={fieldCls} style={{ background: "var(--color-bg-page)" }}>
              <option value="" disabled>Select a chapter</option>
              {CHAPTERS.map((ch) => (
                <option key={ch.value} value={ch.value}>{ch.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Full name</label>
            <input name="name" required className={fieldCls} placeholder="Your full name" />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Email address</label>
            <input name="email" type="email" required className={fieldCls} placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Phone number</label>
            <input name="phone" type="tel" required className={fieldCls} placeholder="(555) 555-0100" />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Role you're applying for</label>
            <select name="role" required className={fieldCls} style={{ background: "var(--color-bg-page)" }}>
              <option value="" disabled>Select a role</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Hours available per week</label>
            <input name="hours" type="number" min="1" max="40" required className={fieldCls} placeholder="e.g. 8" />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Are you a current student or recent grad (within 2 years)?</label>
            <div className="flex gap-6 mt-1">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-white text-[1rem] cursor-pointer">
                  <input type="radio" name="student" value={opt} required />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Location (city, state or country)</label>
            <input name="location" required className={fieldCls} placeholder="e.g. Los Angeles, CA" />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Relevant background for this role</label>
            <textarea name="background" required rows={3} className={`${fieldCls} resize-none`} placeholder="Coursework, projects, jobs, or experience relevant to the role you picked" />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Resume (optional, PDF preferred, 5MB max)</label>
            <input
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className={`${fieldCls} text-[0.9rem] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[0.8rem] file:font-semibold file:cursor-pointer`}
              style={{ color: "var(--color-light)" }}
            />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Why VINdicated?</label>
            <textarea name="why" required rows={3} className={`${fieldCls} resize-none`} placeholder="What draws you to this work specifically" />
          </div>

          <button
            type="submit"
            disabled={state === "submitting"}
            className="inline-block px-8 py-[0.9rem] text-[0.85rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--color-vivid)" }}
          >
            {state === "submitting" ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── General contact panel ────────────────────────────────────
function ContactPanel() {
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
    } catch {
      setError("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-20 items-start max-lg:grid-cols-1">
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <div>
              <label className="block text-[0.85rem] text-white mb-2">First name</label>
              <input name="firstName" required className={fieldCls} placeholder="Your" />
            </div>
            <div>
              <label className="block text-[0.85rem] text-white mb-2">Last name</label>
              <input name="lastName" required className={fieldCls} placeholder="Name" />
            </div>
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Email address</label>
            <input name="email" type="email" required className={fieldCls} placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">I'm reaching out about…</label>
            <select name="topic" required className={fieldCls} style={{ background: "var(--color-bg-page)" }}>
              <option value="" disabled>Select a topic</option>
              {TOPICS.map((t) => (
                <option key={t.value} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.85rem] text-white mb-2">Message</label>
            <textarea name="message" required rows={5} className={`${fieldCls} resize-none`} placeholder="Tell us what's on your mind..." />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-block px-8 py-[0.9rem] text-[0.85rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--color-vivid)" }}
          >
            {isSubmitting ? "Sending..." : "Send it"}
          </button>

          {error && (
            <p
              className="text-[0.95rem] leading-[1.6] p-4 rounded-xl"
              style={{
                background: "rgba(214,59,59,0.08)",
                border: "1px solid rgba(214,59,59,0.3)",
                color: "var(--color-red)",
              }}
            >
              {error}
            </p>
          )}

          {submitted && (
            <p
              className="text-[0.95rem] leading-[1.6] p-4 rounded-xl text-white"
              style={{
                background: "rgba(149,51,165,0.1)",
                border: "1px solid var(--color-border)",
              }}
            >
              Message received. We&apos;ll be in touch soon.
            </p>
          )}
        </form>
      </div>

      <div>
        <SectionTitle className="mb-10">
          <em>Join the movement.</em>
        </SectionTitle>

        <div className="mb-12" style={{ borderTop: "1px solid var(--color-border)" }}>
          {SIDE_INFO.map(({ cat, body }) => (
            <div key={cat} className="py-7" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <h3 className="text-[1.15rem] leading-[1.3] mb-2" style={{ fontFamily: "var(--font-heading), Georgia, serif" }}>
                {cat}
              </h3>
              <p className="text-[0.95rem] text-white leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button href="https://linkedin.com/company/vindicated" variant="outline" className="flex-1 text-center" external>
            LinkedIn
          </Button>
          <Button href="https://instagram.com" variant="outline" className="flex-1 text-center" external>
            Instagram
          </Button>
        </div>
      </div>
    </div>
  );
}
