import Link from "next/link";
import type { AboutPageDict } from "@/lib/i18n/dictionary";

export function WhatWeProvide({
  dict,
  projectsHref,
}: {
  dict: AboutPageDict["provide"];
  projectsHref: string;
}) {
  const last = dict.items.length - 1;
  return (
    <section id="provide">
      <div className="wrap split-head">
        <div>
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <dl className="def-list">
          {dict.items.map((item, i) => (
            <div key={item.title}>
              <dt>{item.title}</dt>
              <dd>
                {item.body}
                {i === last && (
                  <>
                    {" "}
                    <Link className="inline-link" href={projectsHref}>
                      {dict.projectsLink}
                    </Link>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
