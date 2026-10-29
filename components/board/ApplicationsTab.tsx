"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  EMAIL_TEMPLATES,
  STATUSES,
  STATUS_LABELS,
  YEAR_LABELS,
  type AdminApplication,
  type ApplyConfig,
  type NotifySignup,
  type Status,
  type TemplateKey,
  type Year,
} from "@/lib/apply/rules";
import { localeLabels, isValidLocale } from "@/lib/i18n/config";
import { useBoard } from "./BoardApp";
import { INVITE_TIMEOUT, apiCall, chapterUrl } from "./util";

// Admins only: board membership applications from the public /apply page.
// The chapter's open/closed switch, deadline, term and positions; the
// applications with their answers, resumes, private notes and status; and
// the "email me when they open" list. None of this is ever public.

type Loaded = {
  config: ApplyConfig;
  closedReason: "off" | "deadline" | "positions" | null;
  applications: AdminApplication[];
  notify: NotifySignup[];
  teams: string[];
};

type Msg = { kind: "ok" | "err"; text: string } | null;

const pacific = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", ...o });
const day = (iso: string) => pacific(iso, { month: "short", day: "numeric", year: "numeric" });
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

async function copy(list: string[], setMsg: (m: Msg) => void) {
  try {
    await navigator.clipboard.writeText(list.join(", "));
    setMsg({ kind: "ok", text: `Copied ${plural(list.length, "email")}.` });
  } catch {
    setMsg({ kind: "err", text: "Your browser didn't allow copying. Use Download CSV instead." });
  }
}

export function ApplicationsTab() {
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState<Status | "">("");
  const [position, setPosition] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [purging, setPurging] = useState<"confirm" | "busy" | null>(null);

  const load = useCallback(async () => {
    const { error, data: d } = await apiCall("/api/board/applications", "GET");
    if (error) return setLoadError(error);
    setLoadError("");
    setData(d as unknown as Loaded);
  }, []);

  useEffect(() => {
    load();
    // The chapter's notice email links to ?application=ID#applications.
    const id = Number(new URLSearchParams(window.location.search).get("application"));
    if (Number.isInteger(id) && id > 0) setOpen(id);
  }, [load]);

  const apps = useMemo(() => data?.applications ?? [], [data]);
  const positions = useMemo(
    () => [...new Set([...(data?.config.positions ?? []), ...apps.flatMap((a) => a.positions)])].sort((a, b) => a.localeCompare(b)),
    [data, apps],
  );
  const shown = apps.filter((a) => (!status || a.status === status) && (!position || a.positions.includes(position)));
  const term = data?.config.term ?? "";
  const pastTerms = apps.filter((a) => a.term !== term).length;
  const csv = chapterUrl(`/api/board/applications/csv?${new URLSearchParams({ ...(status ? { status } : {}), ...(position ? { position } : {}) })}`);

  async function purge() {
    setPurging("busy");
    const { error, data: d } = await apiCall("/api/board/applications/purge", "POST", {});
    setPurging(null);
    if (error) return setMsg({ kind: "err", text: error });
    setMsg({ kind: "ok", text: `Deleted ${plural(Number(d?.deleted ?? 0), "application")} from past terms.` });
    load();
  }

  return (
    <section className="apps-tab">
      <h2>Applications</h2>
      <p>
        Board membership applications from the public <a href={`/en/apply`}>Apply page</a>. Only admins see this tab. Applicants get a
        confirmation when they apply; nothing else is emailed unless you send it with &ldquo;Email applicant&rdquo;.
      </p>
      {loadError && (
        <p className="msg err" role="alert">
          {loadError}
        </p>
      )}
      {!data && !loadError && <p>Loading…</p>}
      {data && (
        <>
          <Settings data={data} onSaved={load} />

          <h3>
            {term} applications <span className="deep">({plural(apps.filter((a) => a.term === term).length, "application")})</span>
          </h3>
          <div className="admin-row apps-filters">
            <label className="inline">
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value as Status | "")}>
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]} ({apps.filter((a) => a.status === s).length})
                  </option>
                ))}
              </select>
            </label>
            <label className="inline">
              Position
              <select value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="">All</option>
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="admin-row">
            <span className="deep">Showing {plural(shown.length, "application")}.</span>
            <button type="button" className="btn btn-line" disabled={!shown.length} onClick={() => copy(shown.map((a) => a.email), setMsg)}>
              Copy emails
            </button>
            <a className="btn btn-line" href={csv} download aria-disabled={!shown.length}>
              Download CSV
            </a>
            {pastTerms > 0 && (
              <button type="button" className="btn btn-line" onClick={() => (setPurging("confirm"), setMsg(null))}>
                Delete all from past terms
              </button>
            )}
          </div>
          {purging && (
            <div className="admin-row confirm">
              <strong>
                Delete {plural(pastTerms, "application")} from terms before {term}, with their resumes? This can&apos;t be undone.
              </strong>
              <button type="button" className="btn" disabled={purging === "busy"} onClick={purge}>
                {purging === "busy" ? "Deleting…" : "Yes, delete them"}
              </button>
              <button type="button" className="btn btn-line" disabled={purging === "busy"} onClick={() => setPurging(null)}>
                Keep them
              </button>
            </div>
          )}
          {msg && (
            <p className={`msg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>
              {msg.text}
            </p>
          )}
          {shown.length === 0 ? (
            <p>{apps.length ? "No applications match these filters." : "No applications yet."}</p>
          ) : (
            <div className="table">
              <table className="apps-list">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Positions</th>
                    <th>Year</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((a) => (
                    <tr key={a.id} className={open === a.id ? "on" : undefined}>
                      <td>
                        <button type="button" className="linkbtn" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? null : a.id)}>
                          {a.name}
                        </button>
                        {a.term !== term && <span className="deep"> · {a.term}</span>}
                      </td>
                      <td>{a.positions.join(", ")}</td>
                      <td>{YEAR_LABELS[a.year as Year] ?? a.year}</td>
                      <td>{day(a.createdAt)}</td>
                      <td>
                        <span className={`app-st app-st-${a.status}`}>{STATUS_LABELS[a.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {open !== null &&
            (apps.find((a) => a.id === open) ? (
              <Detail key={open} app={apps.find((a) => a.id === open)!} teams={data.teams} onChanged={load} onClose={() => setOpen(null)} />
            ) : (
              <p className="msg err">That application isn&apos;t here anymore.</p>
            ))}

          <NotifyList list={data.notify} onChanged={load} />
        </>
      )}
    </section>
  );
}

function Settings({ data, onSaved }: { data: Loaded; onSaved: () => void }) {
  const [c, setC] = useState<ApplyConfig>(data.config);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const id = useId();
  const dirty = JSON.stringify(c) !== JSON.stringify(data.config);

  useEffect(() => setC(data.config), [data.config]);

  async function save(next: ApplyConfig) {
    setBusy(true);
    setMsg(null);
    const { error } = await apiCall("/api/board/applications", "PUT", next);
    setBusy(false);
    if (error) return setMsg({ kind: "err", text: error });
    setMsg({ kind: "ok", text: "Saved." });
    onSaved();
  }

  const state =
    data.closedReason === null
      ? `Open now${data.config.deadline ? `, until the end of ${day(`${data.config.deadline}T20:00:00Z`)}, Pacific` : ", until you switch it off"}.`
      : data.closedReason === "deadline"
        ? "Closed: the deadline passed. Pick a later deadline to open again."
        : data.closedReason === "positions"
          ? "Closed: add at least one position."
          : "Closed.";

  return (
    <div className="card apps-settings">
      <h3>Applications for this chapter</h3>
      <p className={data.closedReason === null ? "st-done" : "deep"}>
        <strong>{state}</strong>
      </p>
      <form
        className="stack wide"
        onSubmit={(e) => {
          e.preventDefault();
          save(c);
        }}
      >
        <label className="check">
          <input type="checkbox" checked={c.open} onChange={(e) => setC({ ...c, open: e.target.checked })} />
          Applications open
        </label>
        <div className="pair">
          <label htmlFor={`${id}-deadline`}>
            Deadline (optional)
            <input id={`${id}-deadline`} type="date" value={c.deadline ?? ""} onChange={(e) => setC({ ...c, deadline: e.target.value || null })} />
            <span className="deep">Closes at the end of that day, Pacific.</span>
          </label>
          <label htmlFor={`${id}-term`}>
            Term
            <input id={`${id}-term`} type="text" value={c.term} maxLength={40} onChange={(e) => setC({ ...c, term: e.target.value })} />
            <span className="deep">One application per email per term. Applying again updates it.</span>
          </label>
        </div>
        <fieldset className="stack">
          <legend>Open positions</legend>
          {c.positions.length === 0 && <p className="deep">No positions yet. Add the ones you&apos;re recruiting for.</p>}
          {c.positions.map((p, i) => (
            <div key={i} className="admin-row position-row">
              <input
                type="text"
                aria-label={`Position ${i + 1}`}
                value={p}
                maxLength={80}
                onChange={(e) => setC({ ...c, positions: c.positions.map((x, j) => (j === i ? e.target.value : x)) })}
              />
              <button type="button" className="chip" onClick={() => setC({ ...c, positions: c.positions.filter((_, j) => j !== i) })}>
                Remove
              </button>
            </div>
          ))}
          <div>
            <button type="button" className="btn btn-line" onClick={() => setC({ ...c, positions: [...c.positions, ""] })}>
              Add a position
            </button>
          </div>
        </fieldset>
        <div className="admin-row">
          <button type="submit" className="btn" disabled={busy || !dirty}>
            {busy ? "Saving…" : "Save"}
          </button>
          {dirty && (
            <button type="button" className="btn btn-line" disabled={busy} onClick={() => setC(data.config)}>
              Undo changes
            </button>
          )}
        </div>
        {msg && (
          <p className={`msg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>
            {msg.text}
          </p>
        )}
      </form>
    </div>
  );
}

function Detail({ app: a, teams, onChanged, onClose }: { app: AdminApplication; teams: string[]; onChanged: () => void; onClose: () => void }) {
  const { chapter } = useBoard();
  const [notes, setNotes] = useState(a.notes);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"email" | "member" | "delete" | null>(null);
  const id = useId();
  const lang = isValidLocale(a.locale) && a.locale !== "en" ? localeLabels[a.locale] : null;

  async function patch(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    const { error } = await apiCall(`/api/board/applications/${a.id}`, "PATCH", body);
    setBusy(false);
    if (error) return setMsg({ kind: "err", text: error });
    setMsg({ kind: "ok", text: ok });
    onChanged();
  }

  async function remove() {
    setBusy(true);
    const { error } = await apiCall(`/api/board/applications/${a.id}`, "DELETE");
    setBusy(false);
    if (error) return setMsg({ kind: "err", text: error });
    onClose();
    onChanged();
  }

  const rows: [string, React.ReactNode][] = [
    ["Positions", a.positions.join(", ")],
    ["Email", <a key="e" href={`mailto:${a.email}`}>{a.email}</a>],
    ["Phone", a.phone || "—"],
    ["Year", YEAR_LABELS[a.year as Year] ?? a.year],
    ["Major", a.major],
    ["Hours / week", String(a.hours)],
    [
      "Resume",
      a.hasResume ? (
        <a key="r" href={chapterUrl(`/api/board/applications/${a.id}/resume`)} download>
          Download {a.resumeName || "resume"}
        </a>
      ) : (
        "None"
      ),
    ],
    [
      "Link",
      a.link ? (
        <a key="l" href={a.link} target="_blank" rel="noopener noreferrer nofollow">
          {a.link}
        </a>
      ) : (
        "—"
      ),
    ],
    ["Heard via", a.heard || "—"],
    ["Term", a.term],
    ["Submitted", `${pacific(a.createdAt, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })} Pacific${a.updatedAt !== a.createdAt ? ` · updated ${day(a.updatedAt)}` : ""}`],
  ];

  return (
    <div className="card app-detail" id={`application-${a.id}`}>
      <div className="admin-row app-head">
        <h3>{a.name}</h3>
        <button type="button" className="linkbtn" onClick={onClose}>
          Close
        </button>
      </div>
      {lang && <p className="deep">Applied in {lang}; their confirmation email was in {lang}.</p>}
      <dl className="app-facts">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <h4>Why do you want to join VINdicated&apos;s board?</h4>
      <p className="answer">{a.why}</p>
      <h4>What would you bring to this role?</h4>
      <p className="answer">{a.bring}</p>

      <div className="pair app-review">
        <label htmlFor={`${id}-status`}>
          Status
          <select id={`${id}-status`} value={a.status} disabled={busy} onChange={(e) => patch({ status: e.target.value }, `Marked ${STATUS_LABELS[e.target.value as Status]}.`)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${id}-notes`}>
          Reviewer notes (private, admins only)
          <textarea id={`${id}-notes`} value={notes} maxLength={10000} onChange={(e) => setNotes(e.target.value)} />
          <span>
            <button type="button" className="btn btn-line btn-small" disabled={busy || notes === a.notes} onClick={() => patch({ notes }, "Notes saved.")}>
              Save notes
            </button>
          </span>
        </label>
      </div>

      <div className="admin-row">
        <button type="button" className="btn" onClick={() => (setMode(mode === "email" ? null : "email"), setMsg(null))}>
          Email applicant
        </button>
        {a.memberId ? (
          <span className="deep">On the Board tab.</span>
        ) : (
          <button type="button" className="btn btn-line" onClick={() => (setMode(mode === "member" ? null : "member"), setMsg(null))}>
            Add to board
          </button>
        )}
        <button type="button" className="btn btn-line" onClick={() => (setMode("delete"), setMsg(null))}>
          Delete
        </button>
      </div>
      {mode === "email" && <EmailForm app={a} chapterName={chapter.title.replace(/^VINdicated at /, "")} sender={chapter.contact} onDone={(sent) => (setMode(null), sent && setMsg({ kind: "ok", text: `Sent to ${a.email}.` }))} />}
      {mode === "member" && <AddMember app={a} teams={teams} onDone={(added) => (setMode(null), added && (setMsg({ kind: "ok", text: `Added ${a.name} to the Board tab. Finish their details there.` }), onChanged()))} />}
      {mode === "delete" && (
        <div className="admin-row confirm">
          <strong>Delete {a.name}&apos;s application and resume for good? This can&apos;t be undone.</strong>
          <button type="button" className="btn" disabled={busy} onClick={remove}>
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
          <button type="button" className="btn btn-line" disabled={busy} onClick={() => setMode(null)}>
            Keep it
          </button>
        </div>
      )}
      {msg && (
        <p className={`msg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

function EmailForm({ app: a, chapterName, sender, onDone }: { app: AdminApplication; chapterName: string; sender: string; onDone: (sent: boolean) => void }) {
  const pick = (k: TemplateKey) => {
    const vars = { first: a.name.split(/\s+/)[0], position: a.positions[0] ?? "a board member", chapter: chapterName, sender };
    return { subject: fill(EMAIL_TEMPLATES[k].subject, vars), body: fill(EMAIL_TEMPLATES[k].body, vars) };
  };
  const start: TemplateKey = a.status === "accepted" ? "accepted" : a.status === "declined" ? "declined" : "interview";
  const [template, setTemplate] = useState<TemplateKey>(start);
  const [m, setM] = useState(pick(start));
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = useId();

  async function send() {
    setBusy(true);
    setError("");
    const { error: err } = await apiCall(`/api/board/applications/${a.id}/email`, "POST", m, INVITE_TIMEOUT);
    setBusy(false);
    if (err) return (setConfirm(false), setError(err));
    onDone(true);
  }

  return (
    <div className="card app-email">
      <h4>Email {a.name}</h4>
      <div className="stack wide">
        <label htmlFor={`${id}-tpl`}>
          Start from
          <select
            id={`${id}-tpl`}
            value={template}
            onChange={(e) => {
              const k = e.target.value as TemplateKey;
              setTemplate(k);
              setM(pick(k));
              setConfirm(false);
            }}
          >
            {(Object.keys(EMAIL_TEMPLATES) as TemplateKey[]).map((k) => (
              <option key={k} value={k}>
                {EMAIL_TEMPLATES[k].label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${id}-subject`}>
          Subject
          <input id={`${id}-subject`} type="text" value={m.subject} maxLength={200} onChange={(e) => (setM({ ...m, subject: e.target.value }), setConfirm(false))} />
        </label>
        <label htmlFor={`${id}-body`}>
          Message
          <textarea id={`${id}-body`} className="tall" value={m.body} maxLength={10000} onChange={(e) => (setM({ ...m, body: e.target.value }), setConfirm(false))} />
          <span className="deep">Replace anything in [brackets] before sending. It goes from the chapter&apos;s email address; replies come to {sender}.</span>
        </label>
        {!confirm ? (
          <div className="admin-row">
            <button type="button" className="btn" disabled={!m.subject.trim() || !m.body.trim()} onClick={() => setConfirm(true)}>
              Review and send
            </button>
            <button type="button" className="btn btn-line" onClick={() => onDone(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="admin-row confirm">
            <strong>
              Send &ldquo;{m.subject}&rdquo; to {a.email}?
            </strong>
            {/\[[^\]]+\]/.test(m.body) && <span className="msg err">The message still has [brackets] to fill in.</span>}
            <button type="button" className="btn" disabled={busy} onClick={send}>
              {busy ? "Sending…" : "Yes, send it"}
            </button>
            <button type="button" className="btn btn-line" disabled={busy} onClick={() => setConfirm(false)}>
              Keep editing
            </button>
          </div>
        )}
        {error && (
          <p className="msg err" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function AddMember({ app: a, teams, onDone }: { app: AdminApplication; teams: string[]; onDone: (added: boolean) => void }) {
  const [role, setRole] = useState(a.positions[0] ?? "");
  const [team, setTeam] = useState(teams.find((t) => t !== "Executive") ?? teams[0] ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = useId();

  async function add() {
    setBusy(true);
    setError("");
    const { error: err } = await apiCall(`/api/board/applications/${a.id}/member`, "POST", { role, team });
    setBusy(false);
    if (err) return setError(err);
    onDone(true);
  }

  return (
    <div className="card app-member">
      <h4>Add {a.name} to the board</h4>
      <p className="deep">Makes a Board tab entry with their name, email and phone. Finish the rest (tier, lead, hub admin) on the Board tab.</p>
      <div className="pair">
        <label htmlFor={`${id}-role`}>
          Role
          <select id={`${id}-role`} value={role} onChange={(e) => setRole(e.target.value)}>
            {a.positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${id}-team`}>
          Team
          <select id={`${id}-team`} value={team} onChange={(e) => setTeam(e.target.value)}>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="admin-row confirm">
        <strong>
          Add {a.name} as {role || "…"} on {team || "…"}?
        </strong>
        <button type="button" className="btn" disabled={busy || !role || !team} onClick={add}>
          {busy ? "Adding…" : "Yes, add them"}
        </button>
        <button type="button" className="btn btn-line" disabled={busy} onClick={() => onDone(false)}>
          Cancel
        </button>
      </div>
      {error && (
        <p className="msg err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function NotifyList({ list, onChanged }: { list: NotifySignup[]; onChanged: () => void }) {
  const [msg, setMsg] = useState<Msg>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove(id?: number) {
    setBusy(true);
    const { error } = await apiCall("/api/board/applications/notify", "DELETE", id ? { id } : {});
    setBusy(false);
    setConfirm(false);
    if (error) return setMsg({ kind: "err", text: error });
    onChanged();
  }

  return (
    <div className="apps-notify">
      <h3>
        &ldquo;Email me when they open&rdquo; <span className="deep">({plural(list.length, "person", "people")})</span>
      </h3>
      <p className="deep">People who asked to hear when this chapter opens board applications. Nothing is sent automatically: copy the emails and send them a note when you open.</p>
      {list.length > 0 && (
        <>
          <ul className="notify-list">
            {list.map((n) => (
              <li key={n.id}>
                {n.email}
                <span className="deep"> · {day(n.createdAt)}{n.locale !== "en" && isValidLocale(n.locale) ? ` · ${localeLabels[n.locale]}` : ""}</span>{" "}
                <button type="button" className="linkbtn" disabled={busy} onClick={() => remove(n.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="admin-row">
            <button type="button" className="btn btn-line" onClick={() => copy(list.map((n) => n.email), setMsg)}>
              Copy emails
            </button>
            <button type="button" className="btn btn-line" onClick={() => setConfirm(true)}>
              Clear the list
            </button>
          </div>
          {confirm && (
            <div className="admin-row confirm">
              <strong>Remove all {plural(list.length, "email")}? Do this after you&apos;ve let them know.</strong>
              <button type="button" className="btn" disabled={busy} onClick={() => remove()}>
                {busy ? "Removing…" : "Yes, clear it"}
              </button>
              <button type="button" className="btn btn-line" disabled={busy} onClick={() => setConfirm(false)}>
                Keep it
              </button>
            </div>
          )}
        </>
      )}
      {msg && (
        <p className={`msg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
