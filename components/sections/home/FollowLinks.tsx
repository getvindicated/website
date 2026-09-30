import type { HomePageDict } from "@/lib/i18n/dictionary";
import { SOCIAL_URLS } from "@/lib/social";
import { ArrowUpRightIcon } from "./icons";

const LINKS = [
  { url: SOCIAL_URLS.linkedin, kind: "linkedin" },
  { url: SOCIAL_URLS.instagramUcla, kind: "instagram" },
  { url: SOCIAL_URLS.instagramBerkeley, kind: "instagram" },
  { url: SOCIAL_URLS.instagramUcsc, kind: "instagram" },
] as const;

export function FollowLinks({ dict }: { dict: HomePageDict["follow"] }) {
  return (
    <section className="pt0" id="social">
      <div className="wrap">
        <div className="center">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="socials-grid">
          {LINKS.map((l, i) => (
            <a
              key={l.url}
              className="soc"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="soc-ic" aria-hidden="true">
                {l.kind === "linkedin" ? <LinkedInIcon /> : <InstagramIcon />}
              </span>
              <span className="soc-txt">
                <span className="soc-pf">{dict.links[i].platform}</span>
                <b>{dict.links[i].handle}</b>
              </span>
              <ArrowUpRightIcon className="soc-go" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function LinkedInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
