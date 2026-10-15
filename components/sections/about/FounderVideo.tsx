"use client";

import { useRef, useState } from "react";
import type { AboutPageDict } from "@/lib/i18n/dictionary";

export function FounderVideo({ dict }: { dict: AboutPageDict["video"] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    const v = videoRef.current;
    if (!v) return;
    setPlaying(true);
    v.play();
    v.focus();
  }

  return (
    <section className="pt0 fv-section" id="founder-video">
      <div className="wrap fv">
        <div className={`fv-player${playing ? " playing" : ""}`}>
          <video
            ref={videoRef}
            preload="metadata"
            playsInline
            controls={playing}
            poster="/images/about/founder-rana-poster.webp"
            aria-label={dict.label}
            onEnded={() => {
              setPlaying(false);
              videoRef.current?.load();
            }}
          >
            <source src="/videos/founder-rana.mp4" type="video/mp4" />
          </video>
          <button type="button" className="fv-play" aria-label={dict.play} onClick={play}>
            <span className="fv-btn">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="fv-len" aria-hidden="true">
              {dict.length}
            </span>
          </button>
        </div>
        <div className="fv-text">
          <h2 className="h2">{dict.title}</h2>
          <p className="lede">{dict.body}</p>
          <p className="fv-who">
            <b>{dict.name}</b>
            {dict.role}
          </p>
        </div>
      </div>
    </section>
  );
}
