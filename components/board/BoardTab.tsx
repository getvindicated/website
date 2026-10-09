"use client";

import { useState } from "react";
import type { Member } from "@/lib/board/types";
import { TEAM_ORDER } from "@/lib/board/static";
import { useBoard } from "./BoardApp";
import { RowEditor, type FieldDef } from "./RowEditor";
import { currentRound } from "./derive";
import { fmt } from "./util";

const ALL_TEAMS = ["All", "Executive", ...TEAM_ORDER];
const TEAM_OPTIONS = ["Executive", ...TEAM_ORDER].map((t) => ({ value: t, label: t }));

const MEMBER_FIELDS: FieldDef[] = [
  { key: "name", label: "Full name" },
  { key: "role", label: "Role", placeholder: "Data Engineer" },
  { key: "team", label: "Team", type: "select", options: TEAM_OPTIONS, pair: "t" },
  { key: "alsoTeam", label: "Also leads (optional)", type: "select", options: [{ value: "", label: "None" }, ...TEAM_ORDER.map((t) => ({ value: t, label: t }))], pair: "t" },
  { key: "tier", label: "Top of chart", type: "select", options: [{ value: "", label: "No" }, { value: "0", label: "President row" }, { value: "1", label: "Executive row" }] },
  { key: "isLead", label: "Team lead", type: "checkbox" },
  { key: "email", label: "Email", type: "email", pair: "c" },
  { key: "phone", label: "Phone", type: "tel", pair: "c" },
];

const inTeam = (m: Member, t: string) => t === "All" || m.team === t || m.alsoTeam === t;

export function BoardTab() {
  const { data, user, go, setFocus } = useBoard();
  const admin = user.role === "admin";
  const people = data.members;
  const [team, setTeam] = useState("All");
  const [query, setQuery] = useState("");
  const [list, setList] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);

  const q = query.trim().toLowerCase();
  const matches = (m: Member) => !q || [m.name, m.role, m.team, m.email].join(" ").toLowerCase().includes(q);
  const visible = (m: Member) => inTeam(m, team) && matches(m);
  const filtering = team !== "All" || !!q;

  const tasks = currentRound(data);
  const person = open !== null ? people.find((m) => m.id === open) ?? null : null;
  const editingMember = typeof editing === "number" ? people.find((m) => m.id === editing) : null;

  const btn = (m: Member) => (
    <button
      key={m.id}
      type="button"
      className={`person${m.isLead ? " lead" : ""}${filtering && visible(m) ? " match" : ""}`}
      aria-expanded={open === m.id}
      onClick={() => setOpen(open === m.id ? null : m.id)}
    >
      <span className="n">{m.name}</span>
      <span className="r">{m.role}</span>
    </button>
  );

  const copy = async (el: HTMLButtonElement, v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      el.textContent = "Copied";
      setTimeout(() => (el.textContent = "Copy"), 1400);
    } catch {
      el.textContent = v;
    }
  };

  return (
    <section>
      <h2>Board Chart</h2>
      <div className="bar" role="group" aria-label="Filter by team">
        {ALL_TEAMS.map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={team === t} onClick={() => setTeam(t)}>
            {t}
            <span className="ct">{t === "All" ? people.length : people.filter((m) => inTeam(m, t)).length}</span>
          </button>
        ))}
      </div>
      <div className="bar">
        <input type="search" placeholder="Search by name, role, or email" aria-label="Search members" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" className="chip" aria-pressed={list} onClick={() => setList(!list)}>
          List view
        </button>
        {admin && (
          <button type="button" className="chip" onClick={() => setEditing("new")}>
            Add a member
          </button>
        )}
      </div>

      {editing === "new" && (
        <RowEditor title="Add a member" table="members" fields={MEMBER_FIELDS} initial={{ name: "", role: "", team: "Data", alsoTeam: "", tier: "", isLead: false, email: "", phone: "" }} onClose={() => setEditing(null)} />
      )}

      {!list ? (
        <div>
          <div className="chart">
            <div className="tier">{people.filter((m) => m.tier === 0).map(btn)}</div>
            <div className="tier">{people.filter((m) => m.tier === 1).map(btn)}</div>
            <div className="teams">
              {TEAM_ORDER.map((t) => (
                <div className="team" key={t}>
                  <h3>{t}</h3>
                  {people
                    .filter((m) => m.team !== t && m.alsoTeam === t && m.tier === 0)
                    .map((m) => (
                      <div key={m.id} className="person lead static">
                        <span className="n">{m.name}</span>
                        <span className="r">{t === "Research & Legal" ? "Research Lead" : m.role}</span>
                      </div>
                    ))}
                  {people.filter((m) => m.team === t).map(btn)}
                </div>
              ))}
            </div>
          </div>
          {person && editingMember?.id !== person.id && (
            <PersonCard
              m={person}
              tasks={tasks.find((p) => p.person === person.firstName)}
              admin={admin}
              copy={copy}
              onEdit={() => setEditing(person.id)}
              onTasks={() => {
                setFocus({ tab: "assignments", key: person.firstName });
                go("assignments");
              }}
            />
          )}
        </div>
      ) : (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Team</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {people.filter(visible).map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.role}</td>
                  <td>{m.team}</td>
                  <td style={{ overflowWrap: "anywhere" }}>{m.email}</td>
                  <td className="num" style={{ whiteSpace: "nowrap" }}>
                    {m.phone}
                  </td>
                </tr>
              ))}
              {people.filter(visible).length === 0 && (
                <tr>
                  <td colSpan={5}>No one matches that search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingMember && (
        <RowEditor
          key={editingMember.id}
          title={`Edit ${editingMember.name}`}
          table="members"
          id={editingMember.id}
          fields={MEMBER_FIELDS}
          initial={{
            name: editingMember.name,
            role: editingMember.role,
            team: editingMember.team,
            alsoTeam: editingMember.alsoTeam ?? "",
            tier: editingMember.tier === null ? "" : String(editingMember.tier),
            isLead: editingMember.isLead,
            email: editingMember.email,
            phone: editingMember.phone,
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function PersonCard({
  m,
  tasks,
  admin,
  copy,
  onEdit,
  onTasks,
}: {
  m: Member;
  tasks?: ReturnType<typeof currentRound>[number];
  admin: boolean;
  copy: (el: HTMLButtonElement, v: string) => void;
  onEdit: () => void;
  onTasks: () => void;
}) {
  const phoneIsNumber = /\d{3}.*\d{4}/.test(m.phone);
  return (
    <div className="card">
      <h3>{m.name}</h3>
      <div className="row">
        <span>Role</span>
        <span>
          {m.role} · {m.team}
        </span>
      </div>
      <div className="row">
        <span>Email</span>
        <span>{m.email || "Not added"}</span>
        {m.email && (
          <button type="button" className="linkbtn" onClick={(e) => copy(e.currentTarget, m.email)}>
            Copy
          </button>
        )}
      </div>
      <div className="row">
        <span>Phone</span>
        <span className="num">{m.phone || "Not added"}</span>
        {phoneIsNumber && (
          <button type="button" className="linkbtn" onClick={(e) => copy(e.currentTarget, m.phone)}>
            Copy
          </button>
        )}
      </div>
      {tasks && (
        <div className="row">
          <span>Tasks</span>
          <span>
            {tasks.items.length} due {tasks.due ? fmt(tasks.due, { month: "short", day: "numeric", year: "numeric" }) : ""} ·{" "}
            <span className={tasks.submitted ? "st-done" : "st-prog"}>{tasks.submitted ? "Submitted" : "Not submitted"}</span> ·{" "}
            <button type="button" className="linkbtn" onClick={onTasks}>
              View
            </button>
          </span>
        </div>
      )}
      {admin && (
        <div className="admin-row">
          <button type="button" className="linkbtn" onClick={onEdit}>
            Edit member
          </button>
        </div>
      )}
    </div>
  );
}
