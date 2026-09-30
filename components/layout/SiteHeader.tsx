"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  localeLabels,
  locales,
  localizeHref,
  type Locale,
} from "@/lib/i18n/config";
import type { SiteDictionary } from "@/lib/i18n/dictionary";

type HeaderDict = Pick<SiteDictionary, "nav" | "ui">;

type NavItem = {
  key: string;
  href: string;
  // Routes (without locale) that mark this top-level item as active.
  match: string[];
  children?: { key: string; href: string }[];
};

const NAV: NavItem[] = [
  { key: "home", href: "/", match: ["/"] },
  {
    key: "about",
    href: "/about",
    match: ["/about", "/research"],
    children: [
      { key: "aboutWhoWeAre", href: "/about" },
      { key: "aboutMission", href: "/about#mission" },
      { key: "aboutFounder", href: "/about#story" },
      { key: "aboutProvides", href: "/about#provide" },
      { key: "projects", href: "/research" },
    ],
  },
  { key: "team", href: "/team", match: ["/team"] },
  {
    key: "learningResources",
    href: "/inspection",
    match: ["/inspection", "/fraud", "/documents", "/map"],
    children: [
      { key: "inspection", href: "/inspection" },
      { key: "fraud", href: "/fraud" },
      { key: "documents", href: "/documents" },
      // Dealer Map (/map) is hidden until its legal review is done.
    ],
  },
];

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: HeaderDict;
}) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close menus whenever the route changes.
  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const path = pathname.replace(`/${locale}`, "") || "/";
  const isActive = (item: NavItem) =>
    item.match.some((m) =>
      m === "/" ? path === "/" : path === m || path.startsWith(`${m}/`),
    );
  const label = (key: string) => dict.nav[key] ?? key;
  const href = (h: string) => localizeHref(locale, h);

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") + window.location.hash);
    setLangOpen(false);
  }

  return (
    <header className={`rd rd-hdr${open ? " open" : ""}`}>
      <div className="wrap nav">
        <Link className="logo" href={href("/")} aria-label={dict.ui.homeLabel}>
          <Image
            className="logo-img"
            src="/images/logo-vindicated.png"
            alt=""
            width={285}
            height={539}
            preload
          />
          VINdicated
        </Link>
        <ul className="links" id="site-links">
          {NAV.map((item) => (
            <li key={item.key}>
              <Link
                href={href(item.href)}
                className={isActive(item) ? "active" : undefined}
                aria-current={
                  isActive(item) && path === item.href ? "page" : undefined
                }
              >
                {label(item.key)}
              </Link>
              {item.children && (
                <div className="drop">
                  {item.children.map((c) => (
                    <Link key={c.key} href={href(c.href)}>
                      {label(c.key)}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
          <li>
            <Link className="btn btn-solid" href={href("/join")}>
              {label("getInvolved")}
            </Link>
          </li>
        </ul>
        <div className="right">
          <div className="lang" ref={langRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={dict.ui.languageSwitcher}
              onClick={() => setLangOpen((o) => !o)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
              </svg>
              {localeLabels[locale]}
            </button>
            {langOpen && (
              <ul role="listbox" aria-label={dict.ui.languageSwitcher}>
                {locales.map((l) => (
                  <li key={l}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={l === locale}
                      lang={l}
                      onClick={() => switchTo(l)}
                    >
                      {localeLabels[l]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            className="burger"
            aria-label={open ? dict.ui.closeMenu : dict.ui.openMenu}
            aria-expanded={open}
            aria-controls="site-links"
            onClick={() => setOpen((o) => !o)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
