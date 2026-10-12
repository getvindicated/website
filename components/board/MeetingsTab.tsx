"use client";

import { useState } from "react";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { fmt } from "./util";

const meetingFields = (attendance: boolean): FieldDef[] => [
  { key: "date", label: "Date", type: "date", pair: "d" },
  { key: "title", label: "Title", pair: "d" },
  ...(attendance ? [{ key: "absent", label: "Absent (and who was excused)" } as FieldDef] : []),
  { key: "summary", label: attendance ? "Notes and decisions" : "Summary", type: "textarea" },
  { key: "recordingUrl", label: attendance ? "Recording link" : "Zoom recording link", type: "url", placeholder: "https://…" },
];

export function MeetingsTab() {
  const { chapter, data, user, today } = useBoard();
  const { heading, note, attendance } = chapter.meetings;
  const MEETING_FIELDS = meetingFields(attendance);
  const admin = user.role === "admin";
  const [editing, setEditing] = useState<number | "new" | null>(null);

  return (
    <section>
      <h2>{heading}</h2>
      {note && <p>{note}</p>}
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
          initial={{ date: today, title: "Board meeting", ...(attendance ? { absent: "" } : {}), summary: "", recordingUrl: "" }}
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
            initial={{ date: m.date, title: m.title, ...(attendance ? { absent: m.absent } : {}), summary: m.summary, recordingUrl: m.recordingUrl }}
            onClose={() => setEditing(null)}
          />
        ) : (
          <div className="item" key={m.id}>
            <h3>
              {m.title} · {fmt(m.date, { month: "short", day: "numeric", year: "numeric" })}
            </h3>
            {attendance && <p>{m.absent ? `Absent: ${m.absent}` : "Full attendance."}</p>}
            {m.summary && <p>{m.summary}</p>}
            <p>
              Recording:{" "}
              {m.recordingUrl ? (
                <a href={m.recordingUrl} target="_blank" rel="noopener noreferrer">
                  {attendance ? "Open the recording" : "Zoom recording"}
                </a>
              ) : (
                <span className="deep">link to add</span>
              )}
            </p>
            {admin && (
              <div className="admin-row">
                <button type="button" className="linkbtn" onClick={() => setEditing(m.id)}>
                  Edit or remove
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
