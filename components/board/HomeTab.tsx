"use client";

import { useState } from "react";
import { TABS, type Announcement, type Tab } from "@/lib/board/types";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { roundTasks, inLeadership } from "./derive";
import { daysBetween, fmt } from "./util";

const LINK_TABS = [{ value: "", label: "No link" }, ...TABS.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))];

const ANNOUNCEMENT_FIELDS: FieldDef[] = [
  { key: "title", label: "Title" },
  { key: "body", label: "Text", type: "textarea" },
  { key: "postedOn", label: "Date", type: "date", pair: "a" },
  { key: "linkTab", label: "Link to a tab", type: "select", options: LINK_TABS, pair: "a" },
  { key: "linkLabel", label: "Link text", placeholder: "See your tasks" },
  { key: "adminsOnly", label: "Board admins only", type: "checkbox" },
];

export function HomeTab() {
  const { chapter, round, data, user, today, go } = useBoard();
  const admin = user.role === "admin";
  const [editing, setEditing] = useState<number | "new" | null>(null);

  const people = roundTasks(data, round?.round ?? null);
  const done = people.filter((p) => p.submitted).length;
  const glance: [string, string, Tab][] = [
    [String(data.members.length), chapter.glance.members, "board"],
    [`${done}/${people.length}`, chapter.glance.submissions, "assignments"],
    [String(data.socials.filter((s) => s.kind !== "org").length), chapter.glance.socials, "socials"],
    [String(data.members.filter(inLeadership).length), "people in leadership", "board"],
  ];
  const dates = [...chapter.keyDates].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const editingRow = typeof editing === "number" ? data.announcements.find((a) => a.id === editing) : null;

  return (
    <section>
      {chapter.photos.length > 0 && (
        <div className="faces" aria-label={`${chapter.title} board photos`}>
          {chapter.photos.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="Board member" />
          ))}
        </div>
      )}
      <div className="cols">
        <div>
          <h2>Logistics &amp; Quick Links</h2>
          <ul>
            {chapter.quickLinks.map((l) => (
              <li key={l.text}>
                {l.label && `${l.label}: `}
                {l.tab ? (
                  <button className="linkbtn" onClick={() => go(l.tab!)}>
                    {l.text}
                  </button>
                ) : l.href ? (
                  <a href={l.href}>{l.text}</a>
                ) : l.href === null ? (
                  <>
                    {l.text} <span className="deep">(link to add)</span>
                  </>
                ) : (
                  l.text
                )}
              </li>
            ))}
          </ul>

          <h2>Announcements</h2>
          {admin && editing === null && (
            <p>
              <button className="btn btn-line" type="button" onClick={() => setEditing("new")}>
                Add an announcement
              </button>
            </p>
          )}
          {editing === "new" && (
            <RowEditor
              title="Add an announcement"
              table="announcements"
              fields={ANNOUNCEMENT_FIELDS}
              initial={{ title: "", body: "", postedOn: today, linkTab: "", linkLabel: "", adminsOnly: false }}
              onClose={() => setEditing(null)}
            />
          )}
          {data.announcements.map((a) =>
            editingRow?.id === a.id ? (
              <RowEditor
                key={a.id}
                title={`Edit ${a.title}`}
                table="announcements"
                id={a.id}
                fields={ANNOUNCEMENT_FIELDS}
                initial={{ title: a.title, body: a.body, postedOn: a.postedOn, linkTab: a.linkTab, linkLabel: a.linkLabel, adminsOnly: a.adminsOnly }}
                onClose={() => setEditing(null)}
              />
            ) : (
              <AnnouncementItem key={a.id} a={a} admin={admin} onEdit={() => setEditing(a.id)} />
            ),
          )}
          {data.announcements.length === 0 && <p>No announcements yet.</p>}
        </div>
        <div>
          <h2>Key Dates</h2>
          <ul className="dates">
            {dates.map(([d, t]) => {
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

function AnnouncementItem({ a, admin, onEdit }: { a: Announcement; admin: boolean; onEdit: () => void }) {
  const { go } = useBoard();
  return (
    <div className="item">
      <h3>{a.title}</h3>
      {a.adminsOnly && <p className="deep">Board admins only</p>}
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
