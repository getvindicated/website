"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Assignment, AssignmentStatus, Round } from "@/lib/board/types";
import { UNASSIGNED } from "@/lib/board/static";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { SubmitForm } from "./SubmitForm";
import { roundTasks, unassignedTasks, type PersonTasks } from "./derive";
import { api, daysBetween, fmt } from "./util";

const STATUS_WORD: Record<AssignmentStatus, string> = {
  pending: "Not submitted",
  submitted: "Submitted",
  done: "Done",
  missing: "Missing",
  excused: "Excused",
};
// UCLA: one status per person, set by an admin.
const WEEKLY_STATUSES: AssignmentStatus[] = ["pending", "submitted", "missing", "excused"];
const STATUS_CLASS: Record<AssignmentStatus, string> = {
  pending: "st-prog",
  submitted: "st-done",
  done: "st-done",
  missing: "st-missing",
  excused: "st-excused",
};
const TICKS_KEY = "vin-board-ticks";

const submittedOn = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" });

type Filter = "All" | AssignmentStatus;

export function AssignmentsTab() {
  const { chapter, round, data, user, today, focus, setFocus, refresh } = useBoard();
  const admin = user.role === "admin";
  const weekly = chapter.weekly;
  const people = roundTasks(data, round?.round ?? null);
  const unassigned = admin ? unassignedTasks(data, round?.round ?? null) : [];
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [newFor, setNewFor] = useState("");
  const [submitFor, setSubmitFor] = useState("");
  const [adminError, setAdminError] = useState("");
  const [confirmWeek, setConfirmWeek] = useState(false);
  const formRef = useRef<HTMLHeadingElement>(null);

  // Personal checklist ticks stay in this browser only.
  useEffect(() => {
    try {
      setTicks(JSON.parse(localStorage.getItem(TICKS_KEY) || "{}"));
    } catch {
      /* private mode or blocked storage: start empty */
    }
  }, []);
  const tick = (id: number, on: boolean) => {
    const next = { ...ticks, [id]: on };
    setTicks(next);
    try {
      localStorage.setItem(TICKS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Opened from the Board tab's "View" link or My page.
  useEffect(() => {
    if (focus?.tab !== "assignments") return;
    setFilter("All");
    setOpen((s) => new Set(s).add(focus.key));
    setFocus(null);
    requestAnimationFrame(() => document.getElementById(`as-${focus.key}`)?.scrollIntoView({ block: "center" }));
  }, [focus, setFocus]);

  // Berkeley groups people as submitted or not; UCLA by each person's status.
  const statusOf = (p: PersonTasks): AssignmentStatus => (weekly ? p.status : p.submitted ? "submitted" : "pending");
  const filters: Filter[] = weekly ? ["All", ...WEEKLY_STATUSES] : ["All", "pending", "submitted"];
  const done = people.filter((p) => p.submitted).length;
  const left = round ? daysBetween(today, round.dueDate) : 0;
  const shown = people.filter((p) => filter === "All" || statusOf(p) === filter);
  const archived = data.rounds.filter((r) => !r.isCurrent);

  const memberOptions = useMemo(
    () => [...data.members.map((m) => ({ value: m.firstName, label: m.name })), { value: UNASSIGNED, label: "Unassigned (admins only)" }],
    [data.members],
  );
  const statusOptions = (weekly ? WEEKLY_STATUSES : (["pending", "submitted", "done", "missing"] as AssignmentStatus[])).map((s) => ({
    value: s,
    label: STATUS_WORD[s],
  }));
  const taskFields: FieldDef[] = [
    { key: "person", label: "Person", type: "select", options: memberOptions, pair: "p" },
    { key: "personRole", label: "Role shown", pair: "p" },
    { key: "task", label: "Task", type: "textarea" },
    ...(chapter.proofRequired ? [{ key: "proof", label: "Proof needed" } as FieldDef] : []),
    { key: "dueDate", label: "Due", type: "date", pair: "d" },
    ...(weekly ? [] : [{ key: "status", label: "Status", type: "select", options: statusOptions, pair: "d" } as FieldDef]),
  ];
  const editingTask = typeof editing === "number" ? data.assignments.find((a) => a.id === editing) : null;
  const taskInitial = (a: Assignment) => ({
    person: a.person,
    personRole: a.personRole,
    task: a.task,
    ...(chapter.proofRequired ? { proof: a.proof } : {}),
    dueDate: a.dueDate ?? "",
    ...(weekly ? {} : { status: a.status }),
  });

  async function run(path: string, method: string, body?: unknown) {
    setAdminError("");
    const err = await api(path, method, body);
    if (err) setAdminError(err);
    else refresh();
    return !err;
  }
  const mark = (a: Assignment, status: AssignmentStatus) => run(`/api/board/assignments/${a.id}`, "PATCH", { status });

  const startSubmit = (person: string) => {
    setSubmitFor(person);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const addFor = (person: string, role: string) => {
    setNewFor(person ? `${person}\u0000${role}` : "");
    setEditing("new");
  };
  const [newPerson, newRole] = newFor ? newFor.split("\u0000") : [memberOptions[0]?.value ?? "", ""];

  const taskItem = (a: Assignment, showTick: boolean) => (
    <li key={a.id} className={showTick && ticks[a.id] ? "ticked" : undefined}>
      {showTick && <input type="checkbox" id={`t-${a.id}`} checked={!!ticks[a.id]} onChange={(e) => tick(a.id, e.target.checked)} />}
      <div>
        <label htmlFor={`t-${a.id}`}>
          <span className="task-text">{a.task}</span>
          {!weekly && a.status !== "pending" && <span className={STATUS_CLASS[a.status]}> · {STATUS_WORD[a.status]}</span>}
        </label>
        {a.proof && (
          <div className="proof">
            <strong>Proof:</strong> {a.proof}
          </div>
        )}
        {admin && (
          <div className="admin-row">
            {!weekly && a.person !== UNASSIGNED && (
              <>
                <button type="button" className="linkbtn" onClick={() => mark(a, "done")}>
                  Mark done
                </button>
                <button type="button" className="linkbtn" onClick={() => mark(a, "missing")}>
                  Mark missing
                </button>
                {a.status !== "pending" && (
                  <button type="button" className="linkbtn" onClick={() => mark(a, "pending")}>
                    Reset
                  </button>
                )}
              </>
            )}
            <button type="button" className="linkbtn" onClick={() => setEditing(a.id)}>
              Edit or remove
            </button>
          </div>
        )}
        {editingTask?.id === a.id && (
          <RowEditor title="Edit task" table="assignments" id={a.id} fields={taskFields} initial={taskInitial(a)} onClose={() => setEditing(null)} />
        )}
      </div>
    </li>
  );

  return (
    <section>
      <h2>{round ? chapter.roundLabel(round, true) : "Deliverables"}</h2>
      {chapter.rule && (
        <p className="note">
          <strong>The rule:</strong> {chapter.rule}
        </p>
      )}
      {!chapter.rule && round?.note && <p className="note">{round.note}</p>}
      <p className="num">
        {done} of {people.length} people submitted
        {round && <> · {left > 1 ? `${left} days left` : left === 1 ? "1 day left" : left === 0 ? (weekly ? "due today" : "due tonight") : "deadline passed"}</>}
      </p>
      <div className="progress">
        <span style={{ width: `${people.length ? (done / people.length) * 100 : 0}%` }} />
      </div>
      <div className="bar" role="group" aria-label="Filter by status">
        {filters.map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s === "All" ? "All" : STATUS_WORD[s]}
            <span className="ct">{s === "All" ? people.length : people.filter((p) => statusOf(p) === s).length}</span>
          </button>
        ))}
        {admin && (
          <button type="button" className="chip" onClick={() => addFor("", "")}>
            Add a task
          </button>
        )}
      </div>

      {admin && weekly && round && (
        <div className="admin-tools">
          <h3>Admin</h3>
          <div className="bar" style={{ margin: 0 }}>
            <label htmlFor="due-input" className="inline">
              Due date
              <input
                id="due-input"
                type="date"
                defaultValue={round.dueDate}
                key={round.dueDate}
                onChange={(e) => e.target.value && run("/api/board/week", "PATCH", { dueDate: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="chip"
              onClick={async () => {
                if (!confirmWeek) return setConfirmWeek(true);
                setConfirmWeek(false);
                await run("/api/board/week", "POST");
              }}
            >
              {confirmWeek ? "Click again to start a new week" : "Start a new week"}
            </button>
          </div>
          <p style={{ margin: 0 }}>
            Open a person below to edit their tasks or set their status. Starting a new week moves this week into the archive and carries over anything
            not submitted or excused.
          </p>
        </div>
      )}
      {adminError && (
        <p className="msg err" role="alert">
          {adminError}
        </p>
      )}
      {editing === "new" && round && (
        <RowEditor
          title={newFor ? `Add a task for ${newPerson}` : "Add a task"}
          table="assignments"
          fields={taskFields}
          initial={{ round: round.round, person: newPerson, personRole: newRole, task: "", ...(chapter.proofRequired ? { proof: "" } : {}), dueDate: round.dueDate, ...(weekly ? {} : { status: "pending" }) }}
          onClose={() => setEditing(null)}
        />
      )}

      {unassigned.length > 0 && (
        <details className="assign" id="as-unassigned" open>
          <summary>
            <span className="who">
              Unassigned <span className="role">· only admins see this</span>
            </span>
            <span />
            <span className="st-prog">{unassigned.length} to assign</span>
          </summary>
          <div className="body">
            <p>Edit a task and choose a person to give it to them.</p>
            <ul className="tasks">{unassigned.map((a) => taskItem(a, false))}</ul>
          </div>
        </details>
      )}

      <div>
        {shown.map((p) => {
          const subs = data.submissions.filter((s) => s.person === p.person && (!s.assignmentId || p.items.some((i) => i.id === s.assignmentId)));
          const st = statusOf(p);
          return (
            <details
              key={p.person}
              id={`as-${p.person}`}
              className="assign"
              open={open.has(p.person)}
              onToggle={(e) => {
                const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                setOpen((s) => {
                  const n = new Set(s);
                  if (isOpen) n.add(p.person);
                  else n.delete(p.person);
                  return n;
                });
              }}
            >
              <summary>
                <span className="who">
                  {p.person} <span className="role">· {p.role}</span>
                </span>
                <span className="due num">{p.due ? fmt(p.due, { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                <span className={STATUS_CLASS[st]}>{STATUS_WORD[st]}</span>
              </summary>
              <div className="body">
                <ul className="tasks">{p.items.map((a) => taskItem(a, true))}</ul>
                {subs.length ? (
                  subs.map((s) => (
                    <div className="subs" key={s.id}>
                      <strong>Submitted {submittedOn(s.createdAt)}:</strong> {s.filenames.length ? s.filenames.join(", ") : "update in notes"}
                      {!s.assignmentId && <span className="deep"> ({s.taskLabel})</span>}
                    </div>
                  ))
                ) : (
                  <div className="subs">No submissions yet.</div>
                )}
                <div className="admin-row">
                  <button type="button" className="linkbtn" onClick={() => startSubmit(p.person)}>
                    Submit work for {p.person}
                  </button>
                  {admin && (
                    <button type="button" className="linkbtn" onClick={() => addFor(p.person, p.role)}>
                      Add a task for {p.person}
                    </button>
                  )}
                  {admin && weekly && (
                    <label className="inline">
                      Status
                      <select value={p.status} onChange={(e) => run("/api/board/person-status", "POST", { person: p.person, status: e.target.value })}>
                        {WEEKLY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_WORD[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>
            </details>
          );
        })}
        {shown.length === 0 && <p>No one in this group.</p>}
      </div>

      {archived.map((r) => (
        <Archive key={r.round} r={r} label={chapter.roundLabel(r, false)} />
      ))}

      <h2 ref={formRef}>Submit your work</h2>
      <p className="note">{chapter.submit.note}</p>
      <SubmitForm person={submitFor} onPerson={setSubmitFor} />
    </section>
  );
}

// A past round or week: who had what, and (unless the week was never
// marked) how it went.
function Archive({ r, label }: { r: Round; label: string }) {
  const { data } = useBoard();
  const people = roundTasks(data, r.round);
  const done = people.filter((p) => p.submitted || p.status === "excused").length;
  return (
    <details className="assign" style={{ marginTop: 18 }}>
      <summary>
        <span className="who">{label}</span>
        <span />
        <span className="deep">{r.showStatus ? `${done} of ${people.length} done` : `${people.length} people`}</span>
      </summary>
      <div className="body table">
        <table>
          <tbody>
            {people.map((p) => {
              const note = p.items.find((a) => a.statusNote)?.statusNote;
              const st: AssignmentStatus = p.submitted ? "submitted" : p.status;
              return (
                <tr key={p.person}>
                  <td>
                    <strong>{p.person}</strong>
                  </td>
                  <td>{p.items.map((a) => a.task).join("; ")}</td>
                  {r.showStatus && <td className={STATUS_CLASS[st]}>{note || STATUS_WORD[st]}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
