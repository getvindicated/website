"use client";

import Link from "next/link";
import { useLocaleStrings } from "@/components/layout/LocaleStrings";
import { localizeHref } from "@/lib/i18n/config";

// 404 in the visitor's language, inside the site's header and footer.
export default function LocaleNotFound() {
  const s = useLocaleStrings();
  if (!s) return null;
  return (
    <div className="rd rd-page">
      <title>{`${s.notFound.title} | VINdicated`}</title>
      <div className="phero">
        <div className="wrap center">
          <h1>{s.notFound.title}</h1>
          <p>{s.notFound.body}</p>
          <div className="ctas">
            <Link className="btn btn-solid" href={localizeHref(s.locale, "/")}>
              {s.notFound.home}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
