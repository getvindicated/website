"use client";

import { useEffect } from "react";

export function CarCursor() {
  useEffect(() => {
    // Inject cursor elements
    const cursorEl = document.createElement("div");
    cursorEl.id = "car-cursor";
    cursorEl.innerHTML = `
      <svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg" width="52" height="26">
        <rect x="8" y="16" width="64" height="14" rx="3" fill="#a78bfa"/>
        <path d="M20 16 L28 6 L52 6 L62 16Z" fill="#7c3aed"/>
        <circle cx="22" cy="31" r="6" fill="#1a0a2e" stroke="#a78bfa" stroke-width="2"/>
        <circle cx="22" cy="31" r="2.5" fill="#7c3aed"/>
        <circle cx="58" cy="31" r="6" fill="#1a0a2e" stroke="#a78bfa" stroke-width="2"/>
        <circle cx="58" cy="31" r="2.5" fill="#7c3aed"/>
        <rect x="52" y="8" width="6" height="5" rx="1" fill="#c9a84c" opacity="0.9"/>
        <rect x="12" y="18" width="10" height="6" rx="1" fill="rgba(255,255,255,0.15)"/>
        <rect x="24" y="8" width="14" height="6" rx="1" fill="rgba(255,255,255,0.2)"/>
        <rect x="40" y="8" width="10" height="6" rx="1" fill="rgba(255,255,255,0.2)"/>
        <circle cx="9" cy="23" r="2" fill="#c9a84c" opacity="0.7"/>
        <rect x="68" y="22" width="3" height="3" rx="0.5" fill="#d63b3b" opacity="0.8"/>
      </svg>
    `;
    document.body.prepend(cursorEl);

    const burstEl = document.createElement("div");
    burstEl.id = "click-burst";
    document.body.prepend(burstEl);

    const cursor = document.getElementById("car-cursor")!;
    const burst = document.getElementById("click-burst")!;

    const onMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    };

    const onDown = (e: MouseEvent) => {
      cursor.classList.add("clicking");
      burst.style.left = e.clientX + "px";
      burst.style.top = e.clientY + "px";
      burst.style.display = "block";
      burst.innerHTML = "";

      for (let i = 0; i < 8; i++) {
        const dot = document.createElement("span");
        const angle = (i / 8) * Math.PI * 2;
        const dist = 18 + Math.random() * 18;
        dot.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        dot.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        dot.style.left = "-3px";
        dot.style.top = "-3px";
        dot.style.background = i % 2 === 0 ? "#a78bfa" : "#c9a84c";
        burst.appendChild(dot);
      }

      setTimeout(() => {
        burst.style.display = "none";
      }, 450);
    };

    const onUp = () => cursor.classList.remove("clicking");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      cursorEl.remove();
      burstEl.remove();
    };
  }, []);

  return null;
}
