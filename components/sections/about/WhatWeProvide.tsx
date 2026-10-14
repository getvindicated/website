import Link from "next/link";
import type { AboutPageDict } from "@/lib/i18n/dictionary";

const ICONS = [
  <path key="people" d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a3 3 0 1 0 0-6M21 20c0-2.6-1.6-4.8-4-5.6" />,
  <path key="doc" d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5" />,
  <path key="wrench" d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  <path key="bars" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
];

export function WhatWeProvide({
  dict,
  projectsHref,
}: {
  dict: AboutPageDict["provide"];
  projectsHref: string;
}) {
  const last = dict.items.length - 1;
  return (
    <section className="band" id="provide">
      <div className="wrap">
        <div className="center">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="provide4 mt56">
          {dict.items.map((item, i) => (
            <div className="pcard" key={item.title}>
              <div className="icon" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9533A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[i]}
                </svg>
              </div>
              <h3>{item.title}</h3>
              <p>
                {item.body}
                {i === last && (
                  <>
                    {" "}
                    <Link className="inline-link" href={projectsHref}>
                      {dict.projectsLink}
                    </Link>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
