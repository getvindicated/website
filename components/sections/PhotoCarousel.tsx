"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type CarouselPhoto = {
  src: string;
  alt: string;
  /** CSS object-position, e.g. "center 70%" to keep faces in frame */
  position?: string;
};

export function PhotoCarousel({
  photos,
  interval = 5000,
  label,
}: {
  photos: CarouselPhoto[];
  interval?: number;
  label: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || photos.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % photos.length),
      interval,
    );
    return () => clearInterval(id);
  }, [paused, photos.length, interval]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg h-[clamp(280px,42vw,560px)]"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {photos.map((photo, i) => {
        const isActive = i === active;
        return (
          <div
            key={photo.src}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none"
            style={{ opacity: isActive ? 1 : 0 }}
            aria-hidden={!isActive}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              priority={i === 0}
              className="object-cover motion-reduce:!transform-none"
              style={{
                objectPosition: photo.position ?? "center",
                transform: isActive ? "scale(1.06)" : "scale(1)",
                transition: `transform ${interval + 1400}ms linear`,
              }}
            />
          </div>
        );
      })}

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-current={i === active}
              className="h-2 rounded-full bg-white transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                width: i === active ? "24px" : "8px",
                opacity: i === active ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
