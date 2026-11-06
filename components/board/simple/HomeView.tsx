"use client";

import { useState, type FormEvent } from "react";
import { EVERYONE } from "@/lib/board/audience";
import { timeRange, upcomingDates } from "@/lib/board/schedule";
import type { Announcement, Assignment } from "@/lib/board/types";
import { useBoard } from "../BoardApp";
import { apiCall, chapterUrl } from "../util";
import { DateBox, Pill, dayLabel, longDay, taskState, useSimple } from "./shared";
import { SubmitSheet } from "./SubmitSheet";

// Home: your tasks this week, the newest announcements and the next meeting.
export function HomeView() {
  return (
    <>
      <MyTasks />
      <Announcements />
      <NextMeeting />
    </>
  );
}

function MyTasks() {
  const { data, round, today, refresh } = useBoard();
  const { me, toast } = useSimple();
  const [submitting, setSubmitting] = useState<Assignment | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  if (!me) return null;
  const mine = data.assignments.filter((a) => round && a.round === round.round && a.person === me.firstName);
  const allDone = mine.length > 0 && mine.every((a) => taskState(a, today) === "done");

  async function undo(a: Assignment) {
    setBusy(a.id);
    const { error } = await apiCall(`/api/board/tasks/${a.id}/undo`, "POST", {});
    setBusy(null);
    if (error) return toast(error);
    toast("Moved back to To do.");
    refresh();
  }

  return (
    <section aria-labelledby="h-mine">
      <h2 id="h-mine">Your tasks this week</h2>
      {mine.length === 0 && <p className="empty">No tasks for you this week yet.</p>}
      {allDone && <p className="empty">You&apos;re all caught up. Nice work!</p>}
      {mine.map((a) => {
        const state = taskState(a, today);
        return (
          <div className="task" key={a.id}>
            <div className="task-top">
              <div>
                <div className="task-text">{a.task}</div>
                {a.dueDate && <div className="due">Due {dayLabel(a.dueDate)}</div>}
              </div>
              <Pill state={state} />
            </div>
            <div className="row-btns">
              {state === "done" ? (
                <button type="button" className="b soft" disabled={busy === a.id} onClick={() => undo(a)}>
                  {busy === a.id ? "Undoing…" : "Undo"}
                </button>
              ) : (
                <button type="button" className="b submit" onClick={() => setSubmitting(a)}>
                  Submit
                </button>
              )}
            </div>
          </div>
        );
      })}
      {submitting && <SubmitSheet task={submitting} me={me} onClose={() => setSubmitting(null)} />}
    </section>
  );
}

const newestFirst = (a: Announcement, b: Announcement) => b.postedOn.localeCompare(a.postedOn) || b.id - a.id;

function Announcements() {
  const { data } = useBoard();
  const { admin } = useSimple();
  const [all, setAll] = useState(false);
  const [posting, setPosting] = useState(false);
  const posts = [...data.announcements].sort(newestFirst);
  const shown = all ? posts : posts.slice(0, 3);

  return (
    <section aria-labelledby="h-news">
      <h2 id="h-news">Announcements</h2>
      {admin && !posting && (
        <div className="row-btns" style={{ marginTop: 0, marginBottom: 12 }}>
          <button type="button" className="b" onClick={() => setPosting(true)}>
            Post
          </button>
        </div>
      )}
      {posting && <PostForm onDone={() => setPosting(false)} />}
      {posts.length === 0 && <p className="empty">No announcements yet.</p>}
      {shown.map((a) => (
        <Post key={a.id} a={a} />
      ))}
      {posts.length > 3 && (
        <button type="button" className="b soft" onClick={() => setAll(!all)}>
          {all ? "Show fewer" : `See all (${posts.length})`}
        </button>
      )}
    </section>
  );
}

function Post({ a }: { a: Announcement }) {
  const { refresh } = useBoard();
  const { admin, toast } = useSimple();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    const { error } = await apiCall(`/api/board/announcements/${a.id}`, "DELETE");
    setBusy(false);
    if (error) return toast(error);
    toast("Removed.");
    refresh();
  }
  return (
    <article className="card post">
      <h3>{a.title}</h3>
      <p className="by">{[a.author, dayLabel(a.postedOn)].filter(Boolean).join(" · ")}</p>
      {a.body && <p className="post-body">{a.body}</p>}
      {admin &&
        (confirm ? (
          <div className="row-btns">
            <button type="button" className="b danger" disabled={busy} onClick={remove}>
              {busy ? "Removing…" : "Yes, remove it"}
            </button>
            <button type="button" className="b soft" onClick={() => setConfirm(false)}>
              Keep it
            </button>
          </div>
        ) : (
          <div className="row-actions">
            <button type="button" className="linkish" onClick={() => setConfirm(true)}>
              Remove
            </button>
          </div>
        ))}
    </article>
  );
}

function PostForm({ onDone }: { onDone: () => void }) {
  const { today, refresh } = useBoard();
  const { me, toast } = useSimple();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function post(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Add a title.");
    setBusy(true);
    setError("");
    const { error: err, data } = await apiCall("/api/board/announcements", "POST", {
      title,
      body,
      postedOn: today,
      audience: EVERYONE,
      author: me?.name ?? "",
    });
    if (err) {
      setBusy(false);
      return setError(err);
    }
    let note = "Posted.";
    if (email) {
      const sent = await apiCall(`/api/board/announce-email/${data?.id}`, "POST", { kind: "post" }, { ms: 90_000, error: "Posted, but the email didn't go through." });
      note = sent.error ? `Posted, but the email didn't go out: ${sent.error}` : `Posted and emailed to ${sent.data?.sent ?? 0} people.`;
    }
    setBusy(false);
    toast(note);
    onDone();
    refresh();
  }

  return (
    <form className="panel" onSubmit={post} noValidate>
      <label className="f" htmlFor="post-title">
        Title
        <input id="post-title" type="text" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="f" htmlFor="post-body">
        Message
        <textarea id="post-body" value={body} maxLength={4000} onChange={(e) => setBody(e.target.value)} />
      </label>
      <label className="check">
        <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
        Also email the whole board
      </label>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <div className="row-btns">
        <button type="submit" className="b" disabled={busy}>
          {busy ? "Posting…" : "Post"}
        </button>
        <button type="button" className="b soft" disabled={busy} onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function NextMeeting() {
  const { data, today } = useBoard();
  const next = data.scheduled
    .filter((m) => (m.kind ?? "meeting") === "meeting")
    .flatMap((m) => upcomingDates(m, today).map((date) => ({ m, date })))
    .sort((x, y) => x.date.localeCompare(y.date) || x.m.startTime.localeCompare(y.m.startTime))[0];
  return (
    <section aria-labelledby="h-meet">
      <h2 id="h-meet">Next meeting</h2>
      {!next ? (
        <p className="empty">No meeting scheduled yet.</p>
      ) : (
        <div className="card">
          <div className="when">
            <DateBox iso={next.date} />
            <div className="when-text">
              <h3>{next.m.title}</h3>
              <p style={{ margin: "2px 0 0" }}>
                {longDay(next.date)} · {timeRange(next.m.startTime, next.m.endTime)}
              </p>
              {next.m.location && <p className="muted">{next.m.location}</p>}
            </div>
          </div>
          <div className="row-btns">
            <a className="b soft" href={chapterUrl(`/api/board/schedule/${next.m.id}/ics`)} download>
              Add to calendar
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
