"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Assignment, AssignmentStatus } from "@/lib/board/types";
import { ARCHIVE_ROUND, CURRENT_ROUND, RULE } from "@/lib/board/static";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { SubmitForm } from "./SubmitForm";
import { currentRound } from "./derive";
import { api, daysBetween, fmt } from "./util";

const STATUS_WORD: Record<AssignmentStatus, string> = {
  pending: "Not submitted",
  submitted: "Submitted",
  done: "Done",
  missing: "Missing",
};
const TICKS_KEY = "vin-board-ticks";

const submittedOn = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" });

export function AssignmentsTab() {
  const { data, user, today, focus, setFocus, refresh } = useBoard();
  const admin = user.role === "admin";
  const people = currentRound(data);
  const [filter, setFilter] = useState<"All" | "Not submitted" | "Submitted">("All");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [submitFor, setSubmitFor] = useState("");
  const [adminError, setAdminError] = useState("");
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

  // Opened from the Board tab's "View" link.
  useEffect(() => {
    if (focus?.tab !== "assignments") return;
    setFilter("All");
    setOpen((s) => new Set(s).add(focus.key));
    setFocus(null);
    requestAnimationFrame(() => document.getElementById(`as-${focus.key}`)?.scrollIntoView({ block: "center" }));
  }, [focus, setFocus]);

  const done = people.filter((p) => p.submitted).length;
  const left = daysBetween(today, CURRENT_ROUND.due);
  const shown = people.filter((p) => filter === "All" || (filter === "Submitted") === p.submitted);
  const archive = data.assignments.filter((a) => a.round === ARCHIVE_ROUND.round);
  const archiveDone = archive.filter((a) => a.status !== "missing" && a.status !== "pending").length;

  const memberOptions = useMemo(
    () => data.members.map((m) => ({ value: m.firstName, label: m.name })),
    [data.members],
  );
  const taskFields: FieldDef[] = [
    { key: "person", label: "Person", type: "select", options: memberOptions, pair: "p" },
    { key: "personRole", label: "Role shown", pair: "p" },
    { key: "task", label: "Task", type: "textarea" },
    { key: "proof", label: "Proof needed" },
    { key: "dueDate", label: "Due", type: "date", pair: "d" },
    { key: "status", label: "Status", type: "select", options: (Object.keys(STATUS_WORD) as AssignmentStatus[]).map((s) => ({ value: s, label: STATUS_WORD[s] })), pair: "d" },
  ];
  const editingTask = typeof editing === "number" ? data.assignments.find((a) => a.id === editing) : null;

  async function mark(a: Assignment, status: AssignmentStatus) {
    setAdminError("");
    const err = await api(`/api/board/assignments/${a.id}`, "PATCH", { status });
    if (err) setAdminError(err);
    else refresh();
  }

  const startSubmit = (person: string) => {
    setSubmitFor(person);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section>
      <h2>{CURRENT_ROUND.label}</h2>
      <p className="note">
        <strong>The rule:</strong> {RULE}
      </p>
      <p className="num">
        {done} of {people.length} people submitted · {left > 0 ? `${left} days left` : left === 0 ? "due tonight" : "deadline passed"}
      </p>
      <div className="progress">
        <span style={{ width: `${people.length ? (done / people.length) * 100 : 0}%` }} />
      </div>
      <div className="bar" role="group" aria-label="Filter by status">
        {(["All", "Not submitted", "Submitted"] as const).map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s}
            <span className="ct">{s === "All" ? people.length : people.filter((p) => (s === "Submitted") === p.submitted).length}</span>
          </button>
        ))}
        {admin && (
          <button type="button" className="chip" onClick={() => setEditing("new")}>
            Add a task
          </button>
        )}
      </div>
      {adminError && <p className="msg err" role="alert">{adminError}</p>}
      {editing === "new" && (
        <RowEditor
          title="Add a task"
          table="assignments"
          fields={taskFields}
          initial={{ round: CURRENT_ROUND.round, person: memberOptions[0]?.value ?? "", personRole: "", task: "", proof: "", dueDate: CURRENT_ROUND.due, status: "pending" }}
          onClose={() => setEditing(null)}
        />
      )}

      <div>
        {shown.map((p) => {
          const subs = data.submissions.filter((s) => s.person === p.person && (!s.assignmentId || p.items.some((i) => i.id === s.assignmentId)));
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
                <span className={p.submitted ? "st-done" : "st-prog"}>{p.submitted ? "Submitted" : "Not submitted"}</span>
              </summary>
              <div className="body">
                <ul className="tasks">
                  {p.items.map((a) => (
                    <li key={a.id} className={ticks[a.id] ? "ticked" : undefined}>
                      <input type="checkbox" id={`t-${a.id}`} checked={!!ticks[a.id]} onChange={(e) => tick(a.id, e.target.checked)} />
                      <div>
                        <label htmlFor={`t-${a.id}`}>
                          <span className="task-text">{a.task}</span>
                          {a.status !== "pending" && <span className={`st-${a.status}`}> · {STATUS_WORD[a.status]}</span>}
                        </label>
                        <div className="proof">
                          <strong>Proof:</strong> {a.proof}
                        </div>
                        {admin && (
                          <div className="admin-row">
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
                            <button type="button" className="linkbtn" onClick={() => setEditing(a.id)}>
                              Edit task
                            </button>
                          </div>
                        )}
                        {editingTask?.id === a.id && (
                          <RowEditor
                            title="Edit task"
                            table="assignments"
                            id={a.id}
                            fields={taskFields}
                            initial={{ person: a.person, personRole: a.personRole, task: a.task, proof: a.proof, dueDate: a.dueDate ?? "", status: a.status }}
                            onClose={() => setEditing(null)}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {subs.length ? (
                  subs.map((s) => (
                    <div className="subs" key={s.id}>
                      <strong>Submitted {submittedOn(s.createdAt)}:</strong> {s.filenames.length ? s.filenames.join(", ") : "link in notes"}
                      {!s.assignmentId && <span className="deep"> ({s.taskLabel})</span>}
                    </div>
                  ))
                ) : (
                  <div className="subs">No submissions yet.</div>
                )}
                <button type="button" className="linkbtn" onClick={() => startSubmit(p.person)}>
                  Submit work for {p.person}
                </button>
              </div>
            </details>
          );
        })}
        {shown.length === 0 && <p>No one in this group.</p>}
      </div>

      <details className="assign" style={{ marginTop: 18 }}>
        <summary>
          <span className="who">{ARCHIVE_ROUND.label}</span>
          <span />
          <span className="deep">
            {archiveDone} of {archive.length} done
          </span>
        </summary>
        <div className="body table">
          <table>
            <tbody>
              {archive.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.person}</strong>
                  </td>
                  <td>{a.task}</td>
                  <td className={a.status === "missing" || a.status === "pending" ? "st-prog" : "st-done"}>{a.statusNote || STATUS_WORD[a.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <h2 ref={formRef}>Submit your work</h2>
      <p className="note">This form emails your submission and any files to Rana. Attach proof or paste a link to it in the notes.</p>
      <SubmitForm person={submitFor} onPerson={setSubmitFor} />
    </section>
  );
}
