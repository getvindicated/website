"use client";

import { useState } from "react";
import type { Announcement, Member, SendSummary, Tab } from "@/lib/board/types";
import { audienceLabel } from "@/lib/board/audience";
import { useBoard } from "./BoardApp";
import { AnnouncementForm } from "./AnnouncementForm";
import { OtherHub } from "./OtherHub";
import { EditLink, KeyDatesEditor, PhotosEditor, QuickLinksEditor } from "./Editors";
import { roundTasks, inLeadership } from "./derive";
import { apiCall, daysBetween, fmt, listNames, photoSrc } from "./util";

type Editing = "links" | "dates" | "photos" | "new" | number | null;

export function HomeTab() {
  const { chapter, round, data, user, today, go } = useBoard();
  const admin = user.role === "admin";
  const [editing, setEditing] = useState<Editing>(null);
  const { settings } = data;

  const people = roundTasks(data, round?.round ?? null);
  const done = people.filter((p) => p.submitted).length;
  const glance: [string, string, Tab][] = [
    [String(data.members.length), chapter.glance.members, "board"],
    [`${done}/${people.length}`, chapter.glance.submissions, "assignments"],
    [String(data.socials.filter((s) => s.kind !== "org").length), chapter.glance.socials, "socials"],
    [String(data.members.filter(inLeadership).length), "people in leadership", "board"],
  ];
  const dates = [...settings.keyDates].sort((a, b) => (a.date < b.date ? -1 : 1));
  const close = () => setEditing(null);

  return (
    <section>
      <OtherHub chapter={chapter} />
      {editing === "photos" ? (
        <PhotosEditor onDone={close} />
      ) : (
        (settings.photos.length > 0 || admin) && (
          <div className="faces-wrap">
            {settings.photos.length > 0 && (
              <div className="faces" aria-label={`${chapter.title} board photos`}>
                {settings.photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.src + i} src={photoSrc(p.src)} alt="Board member" />
                ))}
              </div>
            )}
            {admin && (
              <p className="admin-row">
                <EditLink onClick={() => setEditing("photos")}>{settings.photos.length ? "Edit photos" : "Add a photo row"}</EditLink>
              </p>
            )}
          </div>
        )
      )}
      <div className="cols">
        <div>
          <h2>Logistics &amp; Quick Links</h2>
          {editing === "links" ? (
            <QuickLinksEditor onDone={close} />
          ) : (
            <>
              <ul>
                {settings.quickLinks.map((l, i) => (
                  <li key={i}>
                    {l.label && `${l.label}: `}
                    {l.tab ? (
                      <button className="linkbtn" onClick={() => go(l.tab as Tab)}>
                        {l.text}
                      </button>
                    ) : l.href ? (
                      <a href={l.href}>{l.text}</a>
                    ) : (
                      <>
                        {l.text} <span className="deep">(link to add)</span>
                      </>
                    )}
                  </li>
                ))}
                {settings.meetingTime && <li>Board meetings: {settings.meetingTime}</li>}
              </ul>
              {admin && (
                <p className="admin-row">
                  <EditLink onClick={() => setEditing("links")}>Edit quick links</EditLink>
                  <span>The board meeting time is edited on the Meetings tab.</span>
                </p>
              )}
            </>
          )}

          <h2>Announcements</h2>
          {admin && editing !== "new" && (
            <p>
              <button className="btn btn-line" type="button" onClick={() => setEditing("new")}>
                Post an announcement
              </button>
            </p>
          )}
          {!admin && data.viewerId === null && (
            <p>
              Choose your name on <button className="linkbtn" onClick={() => go("me")}>My page</button> to also see posts sent to your team or to you.
            </p>
          )}
          {editing === "new" && <AnnouncementForm onClose={close} />}
          {data.announcements.map((a) =>
            editing === a.id ? (
              <AnnouncementForm key={a.id} existing={a} onClose={close} />
            ) : (
              <AnnouncementItem key={a.id} a={a} admin={admin} sent={data.sends.find((s) => s.announcementId === a.id)} onEdit={() => setEditing(a.id)} />
            ),
          )}
          {data.announcements.length === 0 && <p>No announcements yet.</p>}
        </div>
        <div>
          <h2>Key Dates</h2>
          {editing === "dates" ? (
            <KeyDatesEditor onDone={close} />
          ) : (
            <>
              <ul className="dates">
                {dates.map(({ date: d, text: t }) => {
                  const diff = daysBetween(today, d);
                  const left = diff > 1 ? `in ${diff} days` : diff === 1 ? "tomorrow" : diff === 0 ? "today" : "";
                  return (
                    <li key={d + t}>
                      <span className="d">{fmt(d, { month: "short", day: "numeric" })}</span>
                      <span>
                        {t}
                        {left && <span className="left"> {left}</span>}
                        {diff < 0 && <span className="passed"> (passed)</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {admin && (
                <p className="admin-row">
                  <EditLink onClick={() => setEditing("dates")}>Edit key dates</EditLink>
                </p>
              )}
            </>
          )}

          <h2>At a Glance</h2>
          <ul className="dates">
            {glance.map(([n, t, tab]) => (
              <li key={t}>
                <span className="d">{n}</span>
                <span>
                  <button className="linkbtn" onClick={() => go(tab)}>
                    {t}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// "Leads only", "Data team", or the names for picked people.
function forLabel(a: Announcement, members: Member[]) {
  if (a.audience.kind !== "people") return audienceLabel(a.audience);
  const ids = a.audience.ids;
  const names = members.filter((m) => ids.includes(m.id)).map((m) => m.name);
  return names.length ? listNames(names) : audienceLabel(a.audience);
}

function AnnouncementItem({ a, admin, sent, onEdit }: { a: Announcement; admin: boolean; sent?: SendSummary; onEdit: () => void }) {
  const { data, go, refresh } = useBoard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function retry() {
    setBusy(true);
    setError("");
    const r = await apiCall(`/api/board/announce-email/${a.id}`, "POST", { kind: "retry" });
    setBusy(false);
    if (r.error) setError(r.error);
    refresh();
  }

  return (
    <div className="item">
      <h3>{a.title}</h3>
      {a.audience.kind !== "everyone" && <p className="deep">For: {forLabel(a, data.members)}</p>}
      {(a.body || a.linkLabel) && (
        <p>
          {a.body}
          {a.linkTab && a.linkLabel && (
            <>
              {" "}
              <button className="linkbtn" onClick={() => go(a.linkTab as Tab)}>
                {a.linkLabel}
              </button>
            </>
          )}
        </p>
      )}
      {admin && sent && (
        <p className="deep">
          {sent.kind === "update" ? "Update sent to" : "Sent to"}: {sent.audience ? `${sent.audience}, ` : ""}
          {sent.sent} {sent.sent === 1 ? "person" : "people"}, on{" "}
          {new Date(sent.at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" })}.
          {sent.failed.length > 0 && (
            <>
              {" "}
              <span className="st-missing">Didn&apos;t reach {sent.failed.map((f) => f.name || f.email).join(", ")}.</span>{" "}
              <button className="linkbtn" type="button" disabled={busy} onClick={retry}>
                {busy ? "Retrying…" : "Retry"}
              </button>
            </>
          )}
        </p>
      )}
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
      {admin && (
        <div className="admin-row">
          <button className="linkbtn" onClick={onEdit}>
            Edit or remove
          </button>
        </div>
      )}
    </div>
  );
}
