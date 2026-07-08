import Link from "next/link";
import { footerNav } from "@/lib/constants";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { SiteDictionary } from "@/lib/i18n/dictionary";

type FooterDict = Pick<SiteDictionary, "nav" | "footer">;

// Maps a footer link's canonical href to its dictionary-covered nav
// label, where one exists. Links without an entry here (Team,
// LinkedIn, Instagram, "Get in Touch") keep their literal label from
// lib/constants.ts.
const DICT_KEY_BY_HREF: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/team": "team",
  "/inspection": "inspection",
  "/fraud": "fraud",
  "/documents": "documents",
  "/research": "research",
  "/contact": "contact",
  "/join": "getInvolved",
};

const FOOTER_HEADING_KEY: Record<string, keyof SiteDictionary["footer"]["columns"]> = {
  Navigate: "navigate",
  Resources: "resources",
  Connect: "connect",
};

const FOOTER_LINK_KEY: Record<string, keyof SiteDictionary["footer"]["links"]> = {
  LinkedIn: "linkedIn",
  Instagram: "instagram",
  "Get in Touch": "getInTouch",
};

export function Footer({ locale, dict }: { locale: Locale; dict: FooterDict }) {
  return (
    <footer
      className="border-t border-white/[0.08] px-20 max-md:px-6 pt-16 max-md:pt-10 pb-8"
      style={{ background: "var(--color-bg-page)" }}
    >
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 max-md:gap-8 mb-12 max-lg:grid-cols-2 max-md:grid-cols-1">
        {/* Brand */}
        <div>
          <Link
            href={localizeHref(locale, "/")}
            className="text-2xl font-extrabold text-white no-underline block mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span style={{ color: "var(--color-light)" }}>VIN</span>dicated
          </Link>
          <p className="text-sm max-md:text-xs text-white leading-relaxed max-w-[280px]">
            {dict.footer.mission}
          </p>
        </div>

        {/* Nav columns */}
        {footerNav.map((col) => (
          <div key={col.heading}>
            <h4
              className="text-[0.8rem] font-bold mb-5"
              style={{ color: "var(--color-light)" }}
            >
              {dict.footer.columns[FOOTER_HEADING_KEY[col.heading]] ?? col.heading}
            </h4>
            <ul className="list-none space-y-2">
              {col.links.map((link) => {
                const key = DICT_KEY_BY_HREF[link.href];
                const isExternal = "external" in link && link.external;
                const footerLinkKey = FOOTER_LINK_KEY[link.label];
                const label = footerLinkKey
                  ? (dict.footer.links[footerLinkKey] ?? link.label)
                  : key
                    ? (dict.nav?.[key] ?? link.label)
                    : link.label;
                return (
                  <li key={link.href}>
                    <Link
                      href={isExternal ? link.href : localizeHref(locale, link.href)}
                      className="text-[0.85rem] max-md:text-[0.78rem] text-white no-underline transition-colors hover:text-white"
                      {...(isExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.08] pt-6 flex justify-between items-center flex-wrap gap-2 max-md:flex-col max-md:text-center">
        <p className="text-[0.78rem] max-md:text-[0.68rem] text-white">
          {dict.footer.copyright}
        </p>
        <p className="text-[0.78rem] max-md:text-[0.68rem] text-white">
          {dict.footer.mission}
        </p>
      </div>
    </footer>
  );
}
