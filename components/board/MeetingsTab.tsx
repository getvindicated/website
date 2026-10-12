"use client";

import { useState } from "react";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { ScheduleForm } from "./ScheduleForm";
import { EditLink, TextSetting } from "./Editors";
import { api, fmt } from "./util";
import { pastDates, repeatText, shortDate, timeRange, upcomingDates, type ScheduledMeeting } from "@/lib/board/schedule";

const meetingFields = (attendance: boolean): FieldDef[] => [
  { key: "date", label: "Date", type: "date", pair: "d" },
  { key: "title", label: "Title", pair: "d" },
  ...(attendance ? [{ key: "absent", label: "Absent (and who was excused)" } as FieldDef] : []),
  { key: "summary", label: attendance ? "Notes and decisions" : "Summary", type: "textarea" },
  { key: "recordingUrl", label: attendance ? "Recording link" : "Zoom recording link", type: "url", placeholder: "https://…" },
];

export function MeetingsTab() {
  const { chapter, data, user, today } = useBoard();
  const { heading, attendance } = chapter.meetings;
  const meetingTime = data.settings.meetingTime;
  const [editingTime, setEditingTime] = useState(false);
  const MEETING_FIELDS = meetingFields(attendance);
  const admin = user.role === "admin";
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [scheduling, setScheduling] = useState<number | "new" | null>(null);
  // A past date of a scheduled meeting being logged: "<id>|<date>".
  const [logging, setLogging] = useState<string | null>(null);

  const upcoming = data.scheduled.filter((m) => upcomingDates(m, today).length > 0);
  // Past dates of scheduled meetings with nothing logged yet (most recent first).
  const logged = new Set(data.meetings.map((m) => m.date));
  const toLog = admin
    ? data.scheduled
        .flatMap((m) => pastDates(m, today).map((d) => ({ m, d })))
        .filter(({ d }) => !logged.has(d))
        .sort((a, b) => (a.d < b.d ? 1 : -1))
        .slice(0, 4)
    : [];

  return (
    <section>
      <h2>{heading}</h2>
      {(meetingTime || admin) && (
        <p>
          {meetingTime ? `${meetingTime}.` : "No regular meeting time set."}
          {admin && !editingTime && (
            <>
              {" "}
              <EditLink onClick={() => setEditingTime(true)}>Edit the meeting time</EditLink>
            </>
          )}
        </p>
      )}
      {editingTime && <TextSetting k="meetingTime" label="Board meeting time" value={meetingTime} onDone={() => setEditingTime(false)} />}

      <h3>Upcoming</h3>
      {admin && scheduling === null && (
        <p>
          <button className="btn" type="button" onClick={() => setScheduling("new")}>
            Schedule a meeting
          </button>
        </p>
      )}
      {scheduling === "new" && <ScheduleForm onClose={() => setScheduling(null)} />}
      {upcoming.map((m) =>
        scheduling === m.id ? (
          <ScheduleForm key={m.id} existing={m} onClose={() => setScheduling(null)} />
        ) : (
          <Upcoming key={m.id} m={m} admin={admin} onEdit={() => setScheduling(m.id)} />
        ),
      )}
      {upcoming.length === 0 && scheduling === null && <p>No meetings scheduled yet.</p>}

      {toLog.length > 0 && (
        <>
          <h3>Waiting to be logged</h3>
          {toLog.map(({ m, d }) =>
            logging === `${m.id}|${d}` ? (
              <RowEditor
                key={`${m.id}|${d}`}
                title={`Log the ${shortDate(d)} meeting`}
                table="meetings"
                fields={MEETING_FIELDS}
                initial={{ date: d, title: m.title, ...(attendance ? { absent: "" } : {}), summary: "", recordingUrl: "" }}
                onClose={() => setLogging(null)}
              />
            ) : (
              <div className="item" key={`${m.id}|${d}`}>
                <h3>
                  {m.title} · {fmt(d, { month: "short", day: "numeric", year: "numeric" })}
                </h3>
                <div className="admin-row">
                  <button type="button" className="linkbtn" onClick={() => setLogging(`${m.id}|${d}`)}>
                    Fill in attendance, notes and the recording
                  </button>
                </div>
              </div>
            ),
          )}
        </>
      )}

      <h3>Past meetings</h3>
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

// One scheduled meeting, with its next date and admin controls.
function Upcoming({ m, admin, onEdit }: { m: ScheduledMeeting; admin: boolean; onEdit: () => void }) {
  const { today, refresh } = useBoard();
  const dates = upcomingDates(m, today);
  const [date, setDate] = useState(dates[0]);
  const [confirm, setConfirm] = useState<"one" | "all" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel(which: "one" | "all") {
    if (confirm !== which) return setConfirm(which);
    setBusy(true);
    setError("");
    const err = await api(`/api/board/schedule/${m.id}${which === "one" ? `?date=${date}` : ""}`, "DELETE");
    setBusy(false);
    setConfirm(null);
    if (err) setError(err);
    else refresh();
  }

  return (
    <div className="item">
      <h3>{m.title}</h3>
      <p>
        <strong>Next:</strong> {shortDate(dates[0])} · {timeRange(m.startTime, m.endTime)}
      </p>
      {m.weekly && <p>{repeatText(m)}</p>}
      {m.location && (
        <p>
          <strong>Where:</strong>{" "}
          {/^https?:\/\//.test(m.location) ? (
            <a href={m.location} target="_blank" rel="noopener noreferrer">
              {m.location}
            </a>
          ) : (
            m.location
          )}
        </p>
      )}
      <p>
        <strong>Invited:</strong> {m.audience} ({m.invitees.length} {m.invitees.length === 1 ? "invite" : "invites"} sent)
      </p>
      {m.notes && <p>{m.notes}</p>}
      {admin && (
        <div className="admin-row">
          <button type="button" className="linkbtn" onClick={onEdit}>
            Edit and resend
          </button>
          {m.weekly && dates.length > 1 && (
            <label className="inline">
              Cancel one date
              <select value={date} onChange={(e) => (setDate(e.target.value), setConfirm(null))}>
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {shortDate(d)}
                  </option>
                ))}
              </select>
              <button type="button" className="linkbtn" disabled={busy} onClick={() => cancel("one")}>
                {confirm === "one" ? `Click again to cancel ${shortDate(date)}` : "Cancel this date"}
              </button>
            </label>
          )}
          <button type="button" className="linkbtn" disabled={busy} onClick={() => cancel("all")}>
            {confirm === "all" ? "Click again to cancel the whole meeting" : m.weekly ? "Cancel the whole series" : "Cancel the meeting"}
          </button>
        </div>
      )}
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
