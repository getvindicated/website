"use client";

import { useState, type FormEvent } from "react";
import type { Assignment, Member, Round } from "@/lib/board/types";
import { useBoard } from "../BoardApp";
import { apiCall } from "../util";
import { Pill, dayLabel, firstName, taskState, useSimple } from "./shared";

// Tasks: this week's tasks by person. Admins add, edit and delete tasks and
// start a new week; earlier weeks are archived below, newest first.
export function TasksView() {
  const { data, round, chapter } = useBoard();
  const { admin } = useSimple();
  const [adding, setAdding] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const week = round ? data.assignments.filter((a) => a.round === round.round) : [];
  const earlier = data.rounds.filter((r) => !r.isCurrent).sort((a, b) => b.round - a.round);

  return (
    <section aria-labelledby="h-tasks">
      <h2 id="h-tasks">This week&apos;s tasks</h2>
      {admin && round && !adding && (
        <div className="row-btns" style={{ marginTop: 0 }}>
          <button type="button" className="b" onClick={() => setAdding(true)}>
            Add a task
          </button>
          <NewWeek />
        </div>
      )}
      {adding && round && <TaskForm round={round} onDone={() => setAdding(false)} />}
      {!round && <p className="empty">There&apos;s no current week yet.</p>}
      {round && week.length === 0 && <p className="empty">No tasks this week yet.</p>}
      <ByPerson tasks={week} members={data.members} editable={admin} />

      {earlier.length > 0 && (
        <>
          <div className="row-btns" style={{ marginTop: 32 }}>
            <button type="button" className="b soft" aria-expanded={showOld} onClick={() => setShowOld(!showOld)}>
              {showOld ? "Hide earlier weeks" : "Earlier weeks"}
            </button>
          </div>
          {showOld &&
            earlier.map((r) => (
              <div key={r.id}>
                <h2>{chapter.roundLabel(r, false)}</h2>
                <ByPerson tasks={data.assignments.filter((a) => a.round === r.round)} members={data.members} editable={admin} archived />
                {data.assignments.every((a) => a.round !== r.round) && <p className="empty">No tasks that week.</p>}
              </div>
            ))}
        </>
      )}
    </section>
  );
}

// Tasks grouped by person, in the board's order (people not on the list
// last). Archived weeks show Done / Not done instead of Late.
function ByPerson({ tasks, members, editable, archived = false }: { tasks: Assignment[]; members: Member[]; editable: boolean; archived?: boolean }) {
  const order = new Map(members.map((m, i) => [m.firstName, i]));
  const people = [...new Set(tasks.map((t) => t.person))].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999) || a.localeCompare(b));
  return (
    <>
      {people.map((p) => {
        const m = members.find((x) => x.firstName === p);
        const theirs = tasks.filter((t) => t.person === p);
        return (
          <div key={p}>
            <h3 className="person-head">
              {m?.name ?? p}
              <span>{m?.role ?? theirs[0]?.personRole ?? ""}</span>
            </h3>
            {theirs.map((t) => (
              <TaskRow key={t.id} task={t} editable={editable} archived={archived} />
            ))}
          </div>
        );
      })}
    </>
  );
}

function TaskRow({ task: t, editable, archived }: { task: Assignment; editable: boolean; archived: boolean }) {
  const { today, refresh, data } = useBoard();
  const { toast } = useSimple();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const state = taskState(t, today);
  const round = data.rounds.find((r) => r.round === t.round);

  async function remove() {
    setBusy(true);
    const { error } = await apiCall(`/api/board/assignments/${t.id}`, "DELETE");
    setBusy(false);
    if (error) return toast(error);
    toast("Task deleted.");
    refresh();
  }

  if (editing && round) return <TaskForm round={round} task={t} onDone={() => setEditing(false)} />;
  return (
    <div className="task">
      <div className="task-top">
        <div>
          <div className="task-text">{t.task}</div>
          {t.dueDate && !archived && <div className="due">Due {dayLabel(t.dueDate)}</div>}
        </div>
        {archived ? <span className={`pill${state === "done" ? " done" : ""}`}>{state === "done" ? "Done" : "Not done"}</span> : <Pill state={state} />}
      </div>
      {editable &&
        (confirm ? (
          <div className="row-btns">
            <button type="button" className="b danger" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Yes, delete it"}
            </button>
            <button type="button" className="b soft" onClick={() => setConfirm(false)}>
              Keep it
            </button>
          </div>
        ) : (
          <div className="row-actions">
            <button type="button" className="linkish" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="linkish" onClick={() => setConfirm(true)}>
              Delete
            </button>
          </div>
        ))}
    </div>
  );
}

// Add a task (no `task`) or edit one: who, what, due date, and when
// editing, whether it's done.
function TaskForm({ round, task, onDone }: { round: Round; task?: Assignment; onDone: () => void }) {
  const { data, refresh } = useBoard();
  const { toast } = useSimple();
  const members = data.members;
  const start = task ? members.find((m) => m.firstName === task.person) : undefined;
  const [who, setWho] = useState(start ? String(start.id) : task ? `name:${task.person}` : "");
  const [text, setText] = useState(task?.task ?? "");
  const [due, setDue] = useState(task?.dueDate ?? round.dueDate);
  const [done, setDone] = useState(task ? task.status === "submitted" || task.status === "done" : false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    const m = members.find((x) => String(x.id) === who);
    const person = m ? firstName(m) : who.startsWith("name:") ? who.slice(5) : "";
    if (!person) return setError("Choose who it's for.");
    if (!text.trim()) return setError("Add the task.");
    setBusy(true);
    setError("");
    const body = {
      person,
      personRole: m?.role ?? task?.personRole ?? "",
      task: text,
      dueDate: due || null,
      ...(task ? { status: done ? "done" : "pending" } : { round: round.round }),
    };
    const { error: err } = task ? await apiCall(`/api/board/assignments/${task.id}`, "PATCH", body) : await apiCall("/api/board/assignments", "POST", body);
    setBusy(false);
    if (err) return setError(err);
    toast(task ? "Task saved." : "Task added.");
    onDone();
    refresh();
  }

  return (
    <form className="panel" onSubmit={save} noValidate>
      <label className="f" htmlFor={`who-${task?.id ?? "new"}`}>
        Who
        <select id={`who-${task?.id ?? "new"}`} value={who} onChange={(e) => setWho(e.target.value)}>
          <option value="">Choose someone</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
          {task && !start && <option value={`name:${task.person}`}>{task.person}</option>}
        </select>
      </label>
      <label className="f" htmlFor={`what-${task?.id ?? "new"}`}>
        Task
        <input id={`what-${task?.id ?? "new"}`} type="text" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} />
      </label>
      <label className="f" htmlFor={`due-${task?.id ?? "new"}`}>
        Due date
        <input id={`due-${task?.id ?? "new"}`} type="date" value={due ?? ""} onChange={(e) => setDue(e.target.value)} />
      </label>
      {task && (
        <label className="check">
          <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />
          Done
        </label>
      )}
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <div className="row-btns">
        <button type="submit" className="b" disabled={busy}>
          {busy ? "Saving…" : task ? "Save" : "Add task"}
        </button>
        <button type="button" className="b soft" disabled={busy} onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function NewWeek() {
  const { refresh } = useBoard();
  const { toast } = useSimple();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  async function start() {
    setBusy(true);
    const { error } = await apiCall("/api/board/week", "POST", {});
    setBusy(false);
    setConfirm(false);
    if (error) return toast(error);
    toast("New week started. Last week is under Earlier weeks.");
    refresh();
  }
  if (!confirm) {
    return (
      <button type="button" className="b soft" onClick={() => setConfirm(true)}>
        Start a new week
      </button>
    );
  }
  return (
    <div className="panel" style={{ width: "100%" }}>
      <p>
        <b>Start a new week?</b> This week&apos;s tasks move to Earlier weeks as they are (done or not), and the list starts empty.
      </p>
      <div className="row-btns">
        <button type="button" className="b" disabled={busy} onClick={start}>
          {busy ? "Starting…" : "Yes, start a new week"}
        </button>
        <button type="button" className="b soft" disabled={busy} onClick={() => setConfirm(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
