import Image from "next/image";
import Link from "next/link";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { SiteDictionary } from "@/lib/i18n/dictionary";
import { SOCIAL_URLS } from "@/lib/social";

type FooterDict = Pick<SiteDictionary, "nav" | "footer">;

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: FooterDict;
}) {
  const { nav, footer } = dict;
  const href = (h: string) => localizeHref(locale, h);

  const columns: { heading: string; links: { label: string; href: string }[] }[] = [
    {
      heading: footer.columns.organization,
      links: [
        { label: footer.links.aboutUs, href: href("/about") },
        { label: nav.team, href: href("/team") },
        { label: nav.projects, href: href("/research") },
        { label: nav.getInvolved, href: href("/join") },
      ],
    },
    {
      heading: footer.columns.resources,
      links: [
        { label: nav.inspection, href: href("/inspection") },
        { label: nav.fraud, href: href("/fraud") },
        { label: nav.documents, href: href("/documents") },
        { label: nav.dealerMap, href: href("/map") },
      ],
    },
    {
      heading: footer.columns.connect,
      links: [
        { label: footer.links.linkedIn, href: SOCIAL_URLS.linkedin },
        { label: footer.links.instagramUcla, href: SOCIAL_URLS.instagramUcla },
        {
          label: footer.links.instagramBerkeley,
          href: SOCIAL_URLS.instagramBerkeley,
        },
        { label: footer.links.instagramUcsc, href: SOCIAL_URLS.instagramUcsc },
        { label: footer.links.getInTouch, href: href("/join#apply") },
      ],
    },
  ];

  return (
    <footer className="rd rd-ftr">
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link className="logo" href={href("/")}>
              <Image
                className="logo-img"
                src="/images/logo-vindicated.png"
                alt=""
                width={285}
                height={539}
              />
              VINdicated
            </Link>
            <p>{footer.about}</p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="fbot">
          <span>{footer.rights}</span>
          <span>{footer.founded}</span>
        </div>
      </div>
    </footer>
  );
}
