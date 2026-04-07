"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/constants";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-12 py-[1.1rem] border-b border-white/[0.08] backdrop-blur-xl transition-all duration-300"
      style={{
        background: scrolled ? "rgba(13,10,20,0.97)" : "rgba(13,10,20,0.85)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 no-underline">
        <Image
          src="/icon-nav.png"
          alt="VINdicated logo"
          width={52}
          height={52}
          className="h-[52px] w-auto object-contain"
        />
        <span
          className="text-[1.3rem] font-bold tracking-tight"
          style={{ color: "var(--color-light)" }}
        >
          <span className="font-extrabold">VIN</span>dicated
        </span>
      </Link>

      {/* Desktop nav */}
      <ul className="hidden md:flex gap-8 list-none">
        {navLinks.map((link) => (
          <NavItem
            key={link.href}
            link={link as NavLinkType}
            active={isActive(link.href)}
          />
        ))}
      </ul>

      {/* Hamburger */}
      <button
        className="flex md:hidden flex-col gap-[5px] bg-transparent border-none p-1"
        aria-label="Menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-6 h-[2px] bg-white/80 transition-all duration-300"
          />
        ))}
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-10"
          style={{ background: "var(--color-bg-page)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-white/80 no-underline hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// Types
type NavLinkType = {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
};

function NavItem({ link, active }: { link: NavLinkType; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={link.href}
        className="text-[0.82rem] font-medium no-underline transition-colors duration-200"
        style={{
          color: active ? "var(--color-light)" : "rgba(255,255,255,0.8)",
          textDecorationLine: active ? "underline" : "none",
          textDecorationColor: "var(--color-light)",
          textUnderlineOffset: "4px",
        }}
      >
        {link.label}
      </Link>

      {link.children && open && (
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
              href={child.href}
              className="block px-4 py-2 text-[0.82rem] text-white/75 no-underline whitespace-nowrap transition-colors hover:text-white hover:bg-[#5a3069]/30"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}
