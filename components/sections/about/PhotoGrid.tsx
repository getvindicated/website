import Image from "next/image";
import type { AboutPageDict } from "@/lib/i18n/dictionary";

// Same order as aboutPage.photos.items.
const PHOTOS = [
  { src: "/images/about/berkeley-tabling-1.webp", width: 1800, height: 1177 },
  { src: "/images/about/berkeley-tabling-2.webp", width: 800, height: 524 },
  { src: "/images/about/img_8120.webp", width: 1800, height: 1013 },
  { src: "/images/about/img_8126.webp", width: 1800, height: 1013 },
];

export function PhotoGrid({ dict }: { dict: AboutPageDict["photos"] }) {
  return (
    <section className="pt0">
      <div className="wrap">
        <div className="intro">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
        </div>
        <div className="photo-grid">
          {PHOTOS.map((p, i) => (
            <figure key={p.src}>
              <Image
                src={p.src}
                alt={dict.items[i].alt}
                width={p.width}
                height={p.height}
                sizes="(max-width: 760px) calc(100vw - 40px), 560px"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
