import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";

// Area of the image a numbered marker outlines, as fractions of the image.
export type MarkerRect = { x: number; y: number; w: number; h: number };

// A static document image with numbered boxes, beside a numbered list
// explaining each box.
export function AnnotatedImage({
  image,
  rects,
  items,
  intro,
}: {
  image: { src: string; alt: string; width: number; height: number };
  rects: (MarkerRect & { red?: boolean })[];
  items: ReactNode[];
  intro?: string;
}) {
  return (
    <div className="annot">
      <div className="annot-img">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 900px) calc(100vw - 40px), 560px"
        />
        {rects.map((r, i) => (
          <span
            key={i}
            className={`annot-box${r.red ? " red" : ""}`}
            style={
              {
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                width: `${r.w * 100}%`,
                height: `${r.h * 100}%`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <span className="annot-n">{i + 1}</span>
          </span>
        ))}
      </div>
      <div>
        {intro && <p className="annot-intro">{intro}</p>}
        <ol className="annot-list">
          {items.map((item, i) => (
            <li key={i}>
              <span className={`annot-n${rects[i]?.red ? " red" : ""}`} aria-hidden="true">
                {i + 1}
              </span>
              <div>{item}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
