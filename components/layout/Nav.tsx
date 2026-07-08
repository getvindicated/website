"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/constants";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { SiteDictionary } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// Types
type NavLinkType = {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
};

type NavDict = Pick<SiteDictionary, "nav" | "ui">;

const DICT_KEY_BY_HREF: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/about#mission": "aboutMission",
  "/about#story": "aboutFounder",
  "/about#vindicated-from": "aboutProvides",
  "/team": "team",
  "/inspection": "inspection",
  "/inspection#engine-diagram": "inspectionEngine",
  "/inspection#what-to-inspect": "inspectionChecks",
  "/inspection#where-to-get": "inspectionWhere",
  "/inspection#dealer-locators": "inspectionDealership",
  "/fraud": "fraud",
  "/fraud#red-flags": "fraudRedFlags",
  "/fraud#know-your-rights": "fraudRights",
  "/fraud#after": "fraudAfter",
  "/documents": "documents",
  "/volunteer": "volunteer",
  "/research": "research",
  "/contact": "contact",
};

const DICT_KEY_BY_LABEL: Record<string, string> = {
  "Who We Are": "aboutWhoWeAre",
  "What Is a PPI?": "inspectionPpi",
  Overview: "fraudOverview",
};

function labelFor(link: { label: string; href: string }, dict: NavDict) {
  const key = DICT_KEY_BY_LABEL[link.label] ?? DICT_KEY_BY_HREF[link.href];
  return key ? (dict.nav[key] ?? link.label) : link.label;
}

function expandLabel(dict: NavDict, label: string) {
  return dict.ui.expandSection.replace("{label}", label);
}

export function Nav({ locale, dict }: { locale: Locale; dict: NavDict }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    const target = localizeHref(locale, href);
    return href === "/" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-18 max-md:px-5 py-[1.1rem] max-md:py-3 border-b border-white/[0.08] backdrop-blur-xl transition-all duration-300"
        style={{
          background: scrolled || menuOpen
            ? "rgba(13,10,20,0.97)"
            : "rgba(13,10,20,0.85)",
        }}
      >
        {/* Logo */}
        <Link
          href={localizeHref(locale, "/")}
          className="flex items-center gap-3 no-underline relative z-[102]"
          onClick={closeMenu}
        >
          <Image
            src="/icon-nav.png"
            alt="VINdicated logo"
            width={52}
            height={52}
            className="h-[52px] max-md:h-[40px] w-auto object-contain"
          />
          <span
            className="text-2xl max-md:text-xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="font-extrabold text-(--color-light)">VIN</span>
            dicated
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex gap-8 list-none">
            {navLinks.map((link) => (
              <DesktopNavItem
                key={link.href}
                link={link as NavLinkType}
                label={labelFor(link, dict)}
                locale={locale}
                dict={dict}
                active={isActive(link.href)}
                isOpen={activeDropdown === link.href}
                onMouseEnter={() => {
                  clearCloseTimer();
                  setActiveDropdown(link.href);
                }}
                onMouseLeave={() => {
                  closeTimer.current = setTimeout(
                    () => setActiveDropdown(null),
                    300,
                  );
                }}
              />
            ))}
          </ul>
          <LanguageSwitcher
            currentLocale={locale}
            label={dict.ui.languageSwitcher}
          />
        </div>

        {/* Hamburger / Close toggle */}
        <button
          className="relative z-[102] flex lg:hidden justify-center items-center w-10 h-10 bg-transparent border-none"
          aria-label={menuOpen ? dict.ui.closeMenu : dict.ui.openMenu}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="relative w-6 h-5 flex flex-col justify-center items-center">
            <span
              className="absolute block w-6 h-[2px] bg-white transition-all duration-300 ease-in-out"
              style={{
                transform: menuOpen
                  ? "rotate(45deg)"
                  : "translateY(-7px)",
              }}
            />
            <span
              className="absolute block w-6 h-[2px] bg-white transition-all duration-300 ease-in-out"
              style={{
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
              }}
            />
            <span
              className="absolute block w-6 h-[2px] bg-white transition-all duration-300 ease-in-out"
              style={{
                transform: menuOpen
                  ? "rotate(-45deg)"
                  : "translateY(7px)",
              }}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu rendered outside <nav> to avoid z-index issues */}
      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        isActive={isActive}
        locale={locale}
        dict={dict}
      />
    </>
  );
}

// ── Mobile Menu ──────────────────────────────────────────────
function MobileMenu({
  open,
  onClose,
  isActive,
  locale,
  dict,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
  locale: Locale;
  dict: NavDict;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Reset expanded state when menu closes
  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  return (
    <div
      className="fixed inset-0 z-[99] flex flex-col lg:hidden transition-all duration-300 ease-in-out"
      style={{
        background: "var(--color-bg-page)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        visibility: open ? "visible" : "hidden",
      }}
    >
      {/* Scrollable link area, starts below the fixed nav bar */}
      <div className="flex-1 overflow-y-auto pt-[72px] pb-10 px-6">
        <ul className="list-none flex flex-col mt-4">
          {navLinks.map((link) => {
            const hasChildren = "children" in link && link.children;
            const active = isActive(link.href);
            const isExpanded = expanded === link.href;

            return (
              <li
                key={link.href}
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                {/* Top-level link row */}
                <div className="flex items-center">
                  <Link
                    href={localizeHref(locale, link.href)}
                    onClick={onClose}
                    className="flex-1 py-4 text-[1.1rem] font-medium no-underline transition-colors"
                    style={{
                      color: active
                        ? "var(--color-accent)"
                        : "#fff",
                    }}
                  >
                    {labelFor(link, dict)}
                  </Link>
                  {hasChildren && (
                    <button
                      className="flex items-center justify-center w-11 h-11 bg-transparent border-none -mr-2"
                      aria-label={expandLabel(dict, labelFor(link, dict))}
                      onClick={() =>
                        setExpanded(isExpanded ? null : link.href)
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="transition-transform duration-200"
                        style={{
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      >
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="var(--color-light)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Expandable sub-links */}
                {hasChildren && (
                  <div
                    className="overflow-hidden transition-all duration-200 ease-in-out"
                    style={{
                      maxHeight: isExpanded
                        ? `${(link as NavLinkType).children!.length * 44}px`
                        : "0px",
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <div className="pl-4 pb-3 flex flex-col gap-0.5">
                      {(link as NavLinkType).children!.map((child) => (
                        <Link
                          key={child.href}
                          href={localizeHref(locale, child.href)}
                          onClick={onClose}
                          className="py-2 text-[0.88rem] no-underline transition-colors"
                          style={{ color: "var(--color-light)" }}
                        >
                          {labelFor(child, dict)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Language switcher, reachable on mobile too */}
        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
          <LanguageSwitcher
            currentLocale={locale}
            label={dict.ui.languageSwitcher}
          />
        </div>
      </div>
    </div>
  );
}

// ── Desktop Nav Item ────────────────────────────────────────
function DesktopNavItem({
  link,
  label,
  locale,
  dict,
  active,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  link: NavLinkType;
  label: string;
  locale: Locale;
  dict: NavDict;
  active: boolean;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <li
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={localizeHref(locale, link.href)}
        className="text-[0.95rem] no-underline transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0a14] rounded-sm"
        style={{
          color: "white",
          fontFamily: "var(--font-heading), Georgia, serif",
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
      </Link>
      {link.children && isOpen && (
        <div
          className="absolute top-full left-0 mt-2 min-w-[200px] rounded border border-white/[0.08] py-1 z-[99999]"
          style={{
            background: "#1a0a2e",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {link.children.map((child) => (
            <Link
              key={child.href}
              href={localizeHref(locale, child.href)}
              className="block px-4 py-2 text-[0.82rem] text-white no-underline whitespace-nowrap transition-colors hover:text-white hover:bg-[#9630a6]/30"
            >
              {labelFor(child, dict)}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}
