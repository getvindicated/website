import Link from "next/link";
import { footerNav } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      className="border-t border-white/[0.08] px-20 pt-16 pb-8 bg-[var(--color-bg-page)]"
    >
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-lg:grid-cols-2 max-md:grid-cols-1">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="mb-4 block text-2xl font-black text-white no-underline"
          >
            <span className="text-[var(--color-light)]">VIN</span>dicated
          </Link>
          <p className="text-sm text-white/60 leading-relaxed max-w-[280px]">
            A nonprofit committed to gender equity in automotive commerce.
          </p>
        </div>

        {/* Nav columns */}
        {footerNav.map((col) => (
          <div key={col.heading}>
            <h4
              className="text-[0.8rem] font-bold mb-5 text-[var(--color-light)]"
            >
              {col.heading}
            </h4>
            <ul className="list-none space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.85rem] text-white/60 no-underline transition-colors hover:text-white"
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
        <p className="text-[0.78rem] text-white/50">
          © 2026 VINdicated. All rights reserved. Founded by Rana Darwich.
        </p>
        <p className="text-[0.78rem] text-white/50">
          A nonprofit committed to gender equity in automotive commerce.
        </p>
      </div>
    </footer>
  );
}
