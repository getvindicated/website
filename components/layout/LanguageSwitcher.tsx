"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchTo(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[0.85rem] font-semibold px-3 py-2 rounded-lg transition-colors duration-150"
        style={{
          color: "#fff",
          border: "1px solid var(--color-border)",
          background: open ? "rgba(149,51,165,0.14)" : "transparent",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {localeLabels[currentLocale]}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50 min-w-[160px]"
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
          role="listbox"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchTo(locale)}
              className="w-full text-left px-4 py-2.5 text-[0.9rem] transition-colors duration-150"
              style={{
                color: "#fff",
                background: locale === currentLocale ? "rgba(149,51,165,0.16)" : "transparent",
                fontWeight: locale === currentLocale ? 700 : 400,
              }}
              role="option"
              aria-selected={locale === currentLocale}
            >
              {localeLabels[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
