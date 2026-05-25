"use client";

import { useEffect, useRef, ReactNode } from "react";
import Link from "next/link";

// ── Button ──────────────────────────────────────────────────
type ButtonProps = {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  children: ReactNode;
  className?: string;
  external?: boolean;
};
export function Button({
  href,
  onClick,
  variant = "primary",
  children,
  className = "",
  external,
}: ButtonProps) {
  const base =
    "inline-block px-8 py-[0.9rem] text-[0.85rem] font-semibold tracking-wide no-underline transition-all duration-200";
  const styles = {
    primary: "text-white hover:-translate-y-0.5",
    outline:
      "text-white border border-white/[0.08] hover:border-[var(--color-light)] hover:text-[var(--color-light)]",
  };

  const style =
    variant === "primary" ? { background: "var(--color-vivid)" } : {};

  const cls = `${base} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        style={style}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
}

// ── Section Label ────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] mb-5"
      style={{ color: "var(--color-light)" }}
    >
      {children}
    </p>
  );
}

// ── Section Title ────────────────────────────────────────────
export function SectionTitle({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      className={`text-[clamp(2.5rem,5vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] ${className}`}
      style={style}
    >
      {children}
    </h2>
  );
}

// ── Divider ──────────────────────────────────────────────────
export function Divider() {
  return (
    <hr
      className="border-none h-px mx-20 max-md:mx-6"
      style={{ background: "var(--color-border)" }}
    />
  );
}

// ── FadeUp wrapper ───────────────────────────────────────────
export function FadeUp({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`fade-up ${className}`}>
      {children}
    </div>
  );
}

// ── Page Hero ────────────────────────────────────────────────
export function PageHero({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden px-20 pt-40 pb-20 border-b border-white/[0.08] max-md:px-6 max-md:pt-28 max-md:pb-12">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(180,130,210,0.12) 0%, transparent 60%)",
        }}
      />
      <p
        className="relative text-[0.7rem] font-semibold uppercase tracking-[0.1em] mb-5"
        style={{ color: "var(--color-light)" }}
      >
        {kicker}
      </p>
      <h1 className="relative text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[1] tracking-[-0.02em] max-w-[900px] mb-6">
        {title}
      </h1>
      {subtitle && (
        <p className="relative text-xl text-white/80 max-w-[600px] leading-[1.75]">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// ── Pullquote ────────────────────────────────────────────────
export function Pullquote({ quote, cite }: { quote: string; cite: string }) {
  return (
    <blockquote
      className="my-8 px-8 py-6"
      style={{
        borderLeft: "4px solid var(--color-vivid)",
        background: "rgba(90,48,105,0.06)",
      }}
    >
      <p
        className="text-[1.3rem] italic leading-[1.5] mb-3"
        style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
      >
        {quote}
      </p>
      <cite
        className="not-italic text-[0.65rem] uppercase tracking-widest"
        style={{ color: "var(--color-light)" }}
      >
        {cite}
      </cite>
    </blockquote>
  );
}

// ── Warning Box ──────────────────────────────────────────────
export function WarningBox({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="my-8 px-8 py-6"
      style={{
        background: "rgba(214,59,59,0.08)",
        border: "1px solid rgba(214,59,59,0.3)",
        borderLeft: "4px solid var(--color-red)",
      }}
    >
      {label && (
        <p
          className="text-[0.78rem] font-bold mb-3"
          style={{ color: "var(--color-red)" }}
        >
          {label}
        </p>
      )}
      <div className="text-[0.95rem] leading-[1.65]">{children}</div>
    </div>
  );
}

// ── Info Box ─────────────────────────────────────────────────
export function InfoBox({
  label,
  children,
  className = "",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`my-8 px-8 py-6 ${className}`}
      style={{
        background: "rgba(124,58,237,0.08)",
        border: "1px solid var(--color-border)",
        borderLeft: "4px solid var(--color-vivid)",
      }}
    >
      {label && (
        <p
          className="text-[0.65rem] tracking-wide mb-3"
          style={{ color: "var(--color-light)" }}
        >
          {label}
        </p>
      )}
      <div className="text-[0.95rem] leading-[1.65]">{children}</div>
    </div>
  );
}

// ── Checklist ────────────────────────────────────────────────
export function Checklist({
  items,
}: {
  items: { strong: string; text?: string }[];
}) {
  return (
    <ul className="list-none mt-6">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-4 py-4 text-[1.05rem] leading-[1.7]"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span
            style={{
              color: "var(--color-light)",
              flexShrink: 0,
              marginTop: "0.1rem",
            }}
          >
            →
          </span>
          <span>
            <strong className="text-white">{item.strong}</strong>
            {item.text && " " + item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Tag ──────────────────────────────────────────────────────
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-[0.72rem] font-medium px-3 py-1 mr-1 mt-1"
      style={{
        background: "rgba(124,58,237,0.15)",
        border: "1px solid var(--color-border)",
        color: "var(--color-light)",
      }}
    >
      {children}
    </span>
  );
}

// ── Accordion ────────────────────────────────────────────────
import { useState } from "react";

type AccordionItem = {
  trigger: string;
  body: ReactNode;
  defaultOpen?: boolean;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    items.findIndex((i) => i.defaultOpen),
  );

  return (
    <div
      className="mt-8"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
          <button
            className="w-full text-left py-7 flex justify-between items-center gap-4 bg-transparent border-none"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <h3 className="text-[1.25rem] leading-[1.3]">
              {item.trigger}
            </h3>
            <span
              className="text-[1.4rem] flex-shrink-0 transition-transform duration-300"
              style={{
                color: "var(--color-accent)",
                transform: openIndex === i ? "rotate(45deg)" : "none",
              }}
            >
              +
            </span>
          </button>
          {openIndex === i && (
            <div className="pb-8 text-[1.1rem] leading-[1.9]">{item.body}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Card Grid ────────────────────────────────────────────────
type CardData = {
  num: string;
  title: string;
  body: ReactNode;
  link?: { href: string; label: string };
};
export function CardGrid({ cards }: { cards: CardData[] }) {
  return (
    <div
      className="grid gap-[1.5px] mt-12"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        background: "var(--color-border)",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.num}
          className="p-10 transition-colors duration-200"
          style={{ background: "var(--color-bg-surface)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background =
              "rgba(90,48,105,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background =
              "var(--color-bg-surface)";
          }}
        >
          <p
            className="text-[0.75rem] font-semibold mb-4"
            style={{ color: "var(--color-light)" }}
          >
            {card.num}
          </p>
          <h3 className="text-[1.25rem] mb-3 leading-[1.2]">
            {card.title}
          </h3>
          <div className="text-base text-white/80 leading-[1.7]">
            {card.body}
          </div>
          {card.link && (
            <Link
              href={card.link.href}
              className="mt-4 block text-[0.68rem] no-underline transition-colors hover:underline"
              style={{ color: "var(--color-accent)" }}
            >
              {card.link.label} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
