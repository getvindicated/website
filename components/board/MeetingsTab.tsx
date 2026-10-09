"use client";

import { useState } from "react";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { fmt } from "./util";

const MEETING_FIELDS: FieldDef[] = [
  { key: "date", label: "Date", type: "date", pair: "d" },
  { key: "title", label: "Title", pair: "d" },
  { key: "summary", label: "Summary", type: "textarea" },
  { key: "recordingUrl", label: "Zoom recording link", type: "url", placeholder: "https://…" },
];

export function MeetingsTab() {
  const { data, user, today } = useBoard();
  const admin = user.role === "admin";
  const [editing, setEditing] = useState<number | "new" | null>(null);

  return (
    <section>
      <h2>Meeting Summaries &amp; Recordings</h2>
      {admin && editing === null && (
        <p>
          <button className="btn btn-line" type="button" onClick={() => setEditing("new")}>
            Add a meeting
          </button>
        </p>
      )}
      {editing === "new" && (
        <RowEditor
          title="Add a meeting"
          table="meetings"
          fields={MEETING_FIELDS}
          initial={{ date: today, title: "Board meeting", summary: "", recordingUrl: "" }}
          onClose={() => setEditing(null)}
        />
      )}
      {data.meetings.map((m) =>
        editing === m.id ? (
          <RowEditor
            key={m.id}
            title="Edit meeting"
            table="meetings"
            id={m.id}
            fields={MEETING_FIELDS}
            initial={{ date: m.date, title: m.title, summary: m.summary, recordingUrl: m.recordingUrl }}
            onClose={() => setEditing(null)}
          />
        ) : (
          <div className="item" key={m.id}>
            <h3>
              {m.title} · {fmt(m.date, { month: "short", day: "numeric", year: "numeric" })}
            </h3>
            {m.summary && <p>{m.summary}</p>}
            <p>
              Recording:{" "}
              {m.recordingUrl ? (
                <a href={m.recordingUrl} target="_blank" rel="noopener noreferrer">
                  Zoom recording
                </a>
              ) : (
                <span className="deep">link to add</span>
              )}
            </p>
            {admin && (
              <div className="admin-row">
                <button type="button" className="linkbtn" onClick={() => setEditing(m.id)}>
                  Edit
                </button>
              </div>
            )}
          </div>
        ),
      )}
      {data.meetings.length === 0 && <p>No meetings yet.</p>}
    </section>
  );
}
