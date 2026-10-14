import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import "../../minimal.css";

const FTC_ALERT =
  "https://consumer.ftc.gov/consumer-alerts/2026/09/scammers-are-spoofing-car-dealership-websites-what-you-need-know";
const FTC_REPORT = "https://reportfraud.ftc.gov/";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return getRouteMetadata(locale, "about", "/about");
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = (await getDictionary(locale as Locale)).aboutPage;
  const href = (h: string) => localizeHref(locale as Locale, h);
  const { hero, zoom, photos, mission, story, video, ai, quote, provide, cta } = dict;
  const last = provide.items.length - 1;

  return (
    <div className="rd rd-page mn">
      <div className="mn-col">
        <h1>{hero.title}</h1>
        <p className="mn-lead">{hero.body}</p>

        <h2 id="chapters">{photos.title}</h2>
        <p>{photos.body}</p>
        <p>{zoom.body}</p>

        <h2 id="mission">{mission.title}</h2>
        <p>{mission.body}</p>
        {mission.items.map((item) => (
          <div key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}

        <h2 id="story">{story.title}</h2>
        <p>{story.body}</p>
        {story.strikes.map((s) => (
          <div key={s.n}>
            <h3>{s.title}</h3>
            <p className="mn-meta">{s.tag}</p>
            <p>{s.body}</p>
          </div>
        ))}
        <blockquote>
          <p>{story.quote}</p>
          <p className="mn-meta">{story.quoteCite}</p>
        </blockquote>

        <h2 id="founder-video">{video.title}</h2>
        <p>{video.body}</p>
        <video
          controls
          preload="metadata"
          playsInline
          poster="/images/about/founder-rana-poster.webp"
          aria-label={video.label}
          style={{ display: "block", width: "100%", margin: "0 0 12px" }}
        >
          <source src="/videos/founder-rana.mp4" type="video/mp4" />
        </video>
        <p className="mn-meta">
          {video.name}, {video.role}
        </p>

        <h2 id="ai">{ai.title}</h2>
        <p>{ai.body}</p>
        <ol>
          {ai.steps.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong> {s.body}
            </li>
          ))}
        </ol>
        <p className="mn-meta">{ai.source}</p>
        <h3>
          {ai.saveStat}: {ai.saveTitle}
        </h3>
        <p>{ai.saveBody}</p>
        <p>
          <Link href={href("/fraud#law")}>{ai.saveCta}</Link>
        </p>
        <h3>{ai.tipsTitle}</h3>
        <ul>
          {ai.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="mn-links">
          <a href={FTC_ALERT} target="_blank" rel="noopener noreferrer">
            {ai.ftcCta}
          </a>
          <a href={FTC_REPORT} target="_blank" rel="noopener noreferrer">
            {ai.reportCta}
          </a>
        </div>

        <blockquote style={{ marginTop: 64 }}>
          <p>{quote.text}</p>
          <p className="mn-meta">{quote.cite}</p>
        </blockquote>

        <h2 id="provide">{provide.title}</h2>
        <p>{provide.body}</p>
        {provide.items.map((item, i) => (
          <div key={item.title}>
            <h3>{item.title}</h3>
            <p>
              {item.body}
              {i === last && (
                <>
                  {" "}
                  <Link href={href("/research")}>{provide.projectsLink}</Link>
                </>
              )}
            </p>
          </div>
        ))}

        <h2>{cta.title}</h2>
        <p>{cta.body}</p>
        <div className="mn-links">
          <Link className="mn-btn" href={href("/join")}>
            {cta.primary}
          </Link>
          <Link href={href("/team")}>{cta.secondary}</Link>
        </div>
      </div>
    </div>
  );
}
