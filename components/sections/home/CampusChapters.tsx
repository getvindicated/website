import Image from "next/image";
import Link from "next/link";
import type { HomePageDict } from "@/lib/i18n/dictionary";
import { ArrowRightIcon } from "./icons";

// Arched frames echo the arches of Royce Hall and the Campanile.
const CAMPUSES = [
  {
    chapter: "ucla",
    frame: "royce",
    src: "/images/campus/royce-hall.webp",
    width: 697,
    height: 358,
    sizes: "(max-width: 720px) 60vw, 280px",
  },
  {
    chapter: "berkeley",
    frame: "tower",
    src: "/images/campus/campanile.webp",
    width: 523,
    height: 477,
    sizes: "(max-width: 720px) 80vw, 400px",
  },
  {
    chapter: "ucsc",
    frame: "photo",
    src: "/images/campus/quarry-amphitheater.webp",
    width: 1200,
    height: 800,
    sizes: "(max-width: 720px) 78vw, 380px",
  },
] as const;

export function CampusChapters({
  dict,
  joinHref,
}: {
  dict: HomePageDict["chapters"];
  // Base join URL; the chapter is passed as ?chapter= to preselect the form.
  joinHref: string;
}) {
  return (
    <section className="pt0" id="chapters-home">
      <div className="wrap">
        <div className="center">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="campus-grid">
          {CAMPUSES.map((c, i) => {
            const item = dict.items[i];
            return (
              <Link
                key={c.chapter}
                className="campus"
                href={`${joinHref}?chapter=${c.chapter}#apply`}
              >
                <div className={`campus-img ${c.frame}`}>
                  <Image
                    src={c.src}
                    alt={item.alt}
                    width={c.width}
                    height={c.height}
                    sizes={c.sizes}
                  />
                </div>
                <div className="campus-body">
                  <span className="tag">{item.tag}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span className="campus-go">
                    {item.cta} <ArrowRightIcon />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
