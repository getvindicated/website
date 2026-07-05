import Link from "next/link";
import { footerNav } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      className="border-t border-white/[0.08] px-20 max-md:px-6 pt-16 max-md:pt-10 pb-8"
      style={{ background: "var(--color-bg-page)" }}
    >
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 max-md:gap-8 mb-12 max-lg:grid-cols-2 max-md:grid-cols-1">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="text-2xl font-extrabold text-white no-underline block mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span style={{ color: "var(--color-light)" }}>VIN</span>dicated
          </Link>
          <p className="text-sm max-md:text-xs text-white leading-relaxed max-w-[280px]">
            A nonprofit committed to gender equity in automotive commerce.
          </p>
        </div>

        {/* Nav columns */}
        {footerNav.map((col) => (
          <div key={col.heading}>
            <h4
              className="text-[0.8rem] font-bold mb-5"
              style={{ color: "var(--color-light)" }}
            >
              {col.heading}
            </h4>
            <ul className="list-none space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.85rem] max-md:text-[0.78rem] text-white no-underline transition-colors hover:text-white"
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.08] pt-6 flex justify-between items-center flex-wrap gap-2 max-md:flex-col max-md:text-center">
        <p className="text-[0.78rem] max-md:text-[0.68rem] text-white">
          © 2026 VINdicated. All rights reserved. Founded by Rana Darwich.
        </p>
        <p className="text-[0.78rem] max-md:text-[0.68rem] text-white">
          A nonprofit committed to gender equity in automotive commerce.
        </p>
      </div>
    </footer>
  );
}
