"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";
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
    "inline-block px-8 py-[0.9rem] text-[0.85rem] font-bold tracking-wide no-underline rounded-2xl border-2 transition-all duration-150 ease-out " +
    "shadow-[4px_4px_0_var(--color-light)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-light)] " +
    "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";
  const styles = {
    primary: "text-white",
    outline: "text-white hover:text-[var(--color-light)]",
  };

  const style: CSSProperties =
    variant === "primary"
      ? { background: "var(--color-vivid)", borderColor: "var(--color-light)" }
      : { background: "transparent", borderColor: "var(--color-light)" };

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

// ── Section Title ────────────────────────────────────────────
export function SectionTitle({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
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

// ── FadeUp wrapper ───────────────────────────────────────────
export function FadeUp({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Content already in view on initial load (e.g. the hero) shouldn't
    // wait on IntersectionObserver's async first callback, which can lag
    // noticeably behind mount — reveal it immediately instead.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("visible");
      return;
    }
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
    <div ref={ref} className={`fade-up ${className}`} style={style}>
      {children}
    </div>
  );
}

// ── Page Hero ────────────────────────────────────────────────
export function PageHero({
  kicker,
  title,
  subtitle,
  titleStyle,
  contained,
  children,
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: string;
  titleStyle?: CSSProperties;
  contained?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden px-20 pt-40 pb-20 max-md:px-6 max-md:pt-28 max-md:pb-12">

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(180,130,210,0.12) 0%, transparent 60%)",
        }}
      />
      <div className={contained ? "relative max-w-[1400px] mx-auto" : ""}>
      {kicker && (
        <p
          className="relative text-[1rem] font-semibold mb-5"
          style={{ color: "var(--color-light)" }}
        >
          {kicker}
        </p>
      )}
      <h1
        className="relative text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[1] tracking-[-0.02em] max-w-[900px] mb-6"
        style={titleStyle}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="relative text-xl text-white max-w-[750px] leading-[1.75]">
          {subtitle}
        </p>
      )}
      {children}
      </div>
    </div>
  );
}

// ── Pullquote ────────────────────────────────────────────────
// Styled as a price tag / hangtag: a die-cut shape with a pointed
// tip and a punched "string hole," subtly rotated like it's hanging.
export function Pullquote({
  quote,
  cite,
  size = "default",
}: {
  quote: ReactNode;
  cite: string;
  size?: "default" | "large";
}) {
  const large = size === "large";

  if (large) {
    return (
      <div className="my-32 max-md:my-16 max-w-[900px] mx-auto">
        <blockquote
          className="rounded-2xl px-12 py-10 max-md:px-7 max-md:py-8"
          style={{
            background: "rgba(149,51,165,0.08)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-[clamp(1.3rem,3vw,1.7rem)] italic leading-[1.5] mb-4"
            style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
          >
            {quote}
          </p>
          <cite
            className="not-italic text-[0.9rem] font-bold"
            style={{ color: "var(--color-light)" }}
          >
            {cite}
          </cite>
        </blockquote>
      </div>
    );
  }

  return (
    <div className="my-8 max-w-[780px] mx-auto text-center">
      <blockquote>
        <span
          aria-hidden="true"
          className="block text-[3.5rem] leading-none mb-2"
          style={{
            fontFamily: "var(--font-heading), Georgia, serif",
            color: "var(--color-accent)",
          }}
        >
          &ldquo;
        </span>
        <p
          className="text-[clamp(1.2rem,2.8vw,1.6rem)] italic leading-[1.55]"
          style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
        >
          {quote}
        </p>
        <div className="flex items-center justify-center gap-3 mt-7">
          <span
            className="w-8 h-px"
            style={{ background: "var(--color-border)" }}
          />
          <cite
            className="not-italic text-[0.85rem] font-bold tracking-wide"
            style={{ color: "var(--color-light)" }}
          >
            {cite}
          </cite>
          <span
            className="w-8 h-px"
            style={{ background: "var(--color-border)" }}
          />
        </div>
      </blockquote>
    </div>
  );
}

// ── Warning Box ──────────────────────────────────────────────
export function WarningBox({
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
      className={`my-8 max-w-[720px] px-8 max-md:px-5 py-6 rounded-2xl ${className}`}
      style={{
        background: "rgba(214,59,59,0.08)",
        border: "1px solid rgba(214,59,59,0.3)",
      }}
    >
      {label && (
        <p
          className="text-[0.85rem] font-bold mb-3"
          style={{ color: "var(--color-red)" }}
        >
          {label}
        </p>
      )}
      <div className="text-[0.95rem] leading-[1.65] text-white">{children}</div>
    </div>
  );
}

// ── Info Box ─────────────────────────────────────────────────
export function InfoBox({
  label,
  children,
  className = "",
  style,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`my-8 max-w-[720px] px-8 max-md:px-5 py-6 rounded-2xl ${className}`}
      style={{
        background: "rgba(149,51,165,0.08)",
        border: "1px solid var(--color-border)",
        ...style,
      }}
    >
      {label && (
        <p
          className="text-[0.85rem] font-bold mb-3"
          style={{ color: "var(--color-light)" }}
        >
          {label}
        </p>
      )}
      <div className="text-[0.95rem] leading-[1.65] text-white">{children}</div>
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
        background: "rgba(149,51,165,0.15)",
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
    <div className="mt-14">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i}>
            <button
              className="group flex text-left py-7 px-3 mx-2 max-md:px-2 max-md:mx-1 justify-between items-center gap-4 rounded-xl bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.05]"
              style={{ width: "calc(100% - 1rem)" }}
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
            >
              <h3
                className="text-[clamp(1rem,2.5vw,1.25rem)] leading-[1.3] transition-colors duration-200"
                style={{ color: open ? "var(--color-light)" : undefined }}
              >
                {item.trigger}
              </h3>
              <span
                className="text-[1.4rem] flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  color: "var(--color-accent)",
                  transform: open ? "rotate(45deg)" : "none",
                }}
              >
                +
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pb-8 text-[1.1rem] leading-[1.9]">
                  {item.body}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Card Grid ────────────────────────────────────────────────
// A compact 2-up grid of option cards. The recommended option gets
// an accent border and a "Recommended" badge instead of relying on
// width alone to carry emphasis.
type CardData = {
  num: string;
  title: string;
  body: ReactNode;
  link?: { href: string; label: string };
  recommended?: boolean;
};
export function CardGrid({ cards }: { cards: CardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 mt-12">
      {cards.map((card) => {
        const recommended = card.recommended ?? false;
        return (
          <div
            key={card.num}
            className={`relative flex flex-col p-8 max-md:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
              recommended
                ? "border-[var(--color-accent)] hover:shadow-[0_16px_40px_-16px_rgba(149,51,165,0.5)]"
                : "border-[var(--color-border)] hover:border-white/25 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]"
            }`}
            style={{ background: "var(--color-bg-surface)" }}
          >
            {recommended && (
              <span
                className="absolute -top-3 right-7 max-md:right-6 rounded-full px-3 py-1 text-[0.68rem] font-bold tracking-wide text-white"
                style={{ background: "var(--color-accent)" }}
              >
                Recommended
              </span>
            )}
            <h3
              className="text-[1.25rem] mb-3 leading-[1.2]"
              style={{ color: "#d8b4fe" }}
            >
              {card.title}
            </h3>
            <div className="text-base text-white leading-[1.7]">
              {card.body}
            </div>
            {card.link && (
              <Link
                href={card.link.href}
                className="mt-4 inline-block text-[0.75rem] font-semibold no-underline transition-colors hover:text-white"
                style={{ color: "var(--color-accent)" }}
              >
                {card.link.label} →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
