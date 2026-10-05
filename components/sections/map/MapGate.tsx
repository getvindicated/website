"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MapPageDict } from "@/lib/i18n/dictionary";

type Dict = MapPageDict["gate"];

// Shared with public/vindimap/index.html (same origin), so accepting here
// also skips the gate inside the embedded map, and vice versa.
const ACK_KEY = "vd-ack";

function readAck() {
  try {
    return sessionStorage.getItem(ACK_KEY) === "1";
  } catch {
    return false;
  }
}

function writeAck() {
  try {
    sessionStorage.setItem(ACK_KEY, "1");
  } catch {
    // Storage blocked (private mode, etc.): the gate just shows again.
  }
}

// Short disclaimer shown before the map loads. The map itself is only
// mounted after the visitor accepts.
export function MapGate({
  dict,
  mapSrc,
  methodsHref,
}: {
  dict: Dict;
  mapSrc: string;
  methodsHref: string;
}) {
  // null until we've read sessionStorage on the client.
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccepted(readAck());
  }, []);

  function open() {
    writeAck();
    setAccepted(true);
    requestAnimationFrame(() => mapRef.current?.focus());
  }

  if (accepted === null) {
    return <div className="map-slot" aria-hidden="true" />;
  }

  if (!accepted) {
    return (
      <div className="vd vd-short" role="region" aria-labelledby="map-gate-title">
        <h2 className="vd-title" id="map-gate-title">
          {dict.title}
        </h2>
        <p className="vd-lede">{dict.body}</p>
        <div className="vd-accept">
          <label className="vd-check">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <span>{dict.check}</span>
          </label>
          <button type="button" className="vd-go" disabled={!checked} onClick={open}>
            {dict.open}
          </button>
        </div>
        <Link className="vd-methods" href={methodsHref}>
          {dict.methodsLink}
        </Link>
      </div>
    );
  }

  return (
    <div className="map-embed" ref={mapRef} tabIndex={-1}>
      <iframe src={mapSrc} title={dict.frameTitle} />
      <div className="map-embed-links">
        <a href={mapSrc} target="_blank" rel="noopener">
          {dict.fullScreen}
        </a>
        <Link href={methodsHref}>{dict.methodsLink}</Link>
      </div>
    </div>
  );
}
