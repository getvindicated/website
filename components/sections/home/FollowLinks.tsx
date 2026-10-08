import type { HomePageDict } from "@/lib/i18n/dictionary";
import { SOCIAL_URLS } from "@/lib/social";

const LINKS = [
  SOCIAL_URLS.linkedin,
  SOCIAL_URLS.instagramUcla,
  SOCIAL_URLS.instagramBerkeley,
  SOCIAL_URLS.instagramUcsc,
];

export function FollowLinks({ dict }: { dict: HomePageDict["follow"] }) {
  return (
    <section className="pt0" id="social">
      <div className="wrap split-head">
        <div>
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <ul className="follow-list">
          {LINKS.map((url, i) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <span>{dict.links[i].platform}</span>
                <b>{dict.links[i].handle}</b>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
