"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Chapter, Social, TeamVideo } from "@/lib/team";
import type { TeamPageDict } from "@/lib/i18n/dictionary";

export type RosterMember = {
  name: string;
  position: string;
  bio: string;
  major?: string;
  chapter: Chapter;
  photo: string | null;
  socials?: Social[];
  video?: TeamVideo;
};

type Filter = "all" | Chapter;
const FILTERS: Filter[] = ["all", "leadership", "ucla", "ucb", "ucsc"];
const BIO_LIMIT = 200;

const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const firstName = (name: string) => name.split(" ")[0];
const fill = (template: string, name: string) =>
  template.replace("{name}", name);

export function TeamRoster({
  members,
  dict,
}: {
  members: RosterMember[];
  dict: TeamPageDict;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [playing, setPlaying] = useState<RosterMember | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const shown = members.filter((m) => filter === "all" || m.chapter === filter);

  function openVideo(m: RosterMember, from: HTMLElement) {
    returnFocus.current = from;
    setPlaying(m);
  }

  return (
    <>
      <div className="intro">
        <div className="tabs filters" role="group" aria-label={dict.filterLabel}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {dict.filters[f]}
            </button>
          ))}
        </div>
      </div>
      <div className="team">
        {shown.map((m) => (
          <MemberCard key={m.name} member={m} dict={dict} onPlay={openVideo} />
        ))}
      </div>
      <VideoDialog
        member={playing}
        dict={dict}
        onClose={() => {
          setPlaying(null);
          returnFocus.current?.focus();
        }}
      />
    </>
  );
}

function MemberCard({
  member: m,
  dict,
  onPlay,
}: {
  member: RosterMember;
  dict: TeamPageDict;
  onPlay: (m: RosterMember, from: HTMLElement) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const long = m.bio.length > BIO_LIMIT;
  const short = long ? m.bio.slice(0, m.bio.lastIndexOf(" ", 190)) + "…" : m.bio;
  const school = [m.chapter === "leadership" ? "" : dict.filters[m.chapter], m.major]
    .filter(Boolean)
    .join(" · ");
  const first = firstName(m.name);

  const face = m.photo ? (
    <Image
      className="avatar-img"
      src={m.photo}
      alt={m.video ? "" : m.name}
      width={96}
      height={96}
      sizes="96px"
    />
  ) : (
    <div className="avatar" aria-hidden="true">
      {initials(m.name)}
    </div>
  );

  return (
    <div className={`card member${m.video ? " has-video" : ""}`}>
      {m.video ? (
        <button
          type="button"
          className="avatar-play"
          aria-label={fill(dict.watchLabel, first)}
          onClick={(e) => onPlay(m, e.currentTarget)}
        >
          {face}
          <span className="ap-badge" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      ) : (
        face
      )}
      <div>
        <h3>{m.name}</h3>
        <div className="role">{m.position}</div>
        {school && <div className="school">{school}</div>}
      </div>
      {m.bio && <p className="bio">{expanded ? m.bio : short}</p>}
      {long && (
        <button
          type="button"
          className="more"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? dict.showLess : dict.readMore}
        </button>
      )}
      {m.video && (
        <button
          type="button"
          className="watch"
          onClick={(e) => onPlay(m, e.currentTarget)}
        >
          <span className="w-ico" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {fill(dict.watch, first)}{" "}
          <span className="w-len">{m.video.length}</span>
        </button>
      )}
      {m.socials && m.socials.length > 0 && (
        <div className="socials">
          {m.socials.map((s) => (
            <a
              key={s.href}
              className="ln"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dict.socials[s.platform]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoDialog({
  member,
  dict,
  onClose,
}: {
  member: RosterMember | null;
  dict: TeamPageDict;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d || !member) return;
    d.showModal();
    videoRef.current?.play().catch(() => {});
  }, [member]);

  function close() {
    videoRef.current?.pause();
    dialogRef.current?.close();
    onClose();
  }

  const v = member?.video;
  return (
    <dialog
      ref={dialogRef}
      className={`vbox${v?.portrait ? " portrait" : ""}`}
      aria-label={dict.dialogLabel}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="vbox-in">
        <button type="button" className="vbox-x" aria-label={dict.close} onClick={close}>
          ×
        </button>
        {member && v && (
          <>
            <video
              ref={videoRef}
              key={v.src}
              src={v.src}
              poster={v.poster}
              playsInline
              controls
              preload="metadata"
            />
            <div className="vbox-cap">
              <b>{member.name}</b>
              {member.position} · {dict.filters[member.chapter]}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
