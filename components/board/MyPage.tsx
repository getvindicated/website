"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/board/types";
import { useBoard } from "./BoardApp";
import { roundTasks } from "./derive";
import { daysBetween, fmt, setViewer } from "./util";
import { timeRange, upcomingDates } from "@/lib/board/schedule";

// Who "My page" is for. Everyone signs in with a shared password, so the
// viewer picks themselves and the choice is remembered in this browser (a
// cookie, so Home also gets announcements addressed to them). When
// per-person sign-in exists, return the signed-in member here and drop the
// picker; nothing else on the page needs to change.
function useViewer(members: Member[]) {
  const { chapter, data, refresh } = useBoard();
  const [id, setId] = useState<number | null>(data.viewerId);
  // A choice saved before the cookie existed: move it over once.
  useEffect(() => {
    if (data.viewerId) return;
    try {
      const key = `vin-board-viewer-${chapter.id}`;
      const saved = Number(localStorage.getItem(key));
      localStorage.removeItem(key);
      if (saved && members.some((m) => m.id === saved)) {
        setId(saved);
        setViewer(saved);
        refresh();
      }
    } catch {
      /* private mode: start unpicked */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pick = (next: number | null) => {
    setId(next);
    setViewer(next);
    refresh();
  };
  return { viewer: members.find((m) => m.id === id) ?? null, pick, canPick: true };
}

// The person someone reports to: team members to their team lead, leads
// and the executive row to the president.
function leadOf(m: Member, members: Member[]): Member | null {
  const president = members.find((x) => x.tier === 0) ?? null;
  if (m.tier === 0) return null;
  if (m.tier === 1 || m.isLead) return president;
  return members.find((x) => x !== m && x.isLead && (x.team === m.team || x.alsoTeam === m.team)) ?? president;
}

export function MyPage() {
  const { chapter, round, data, today, go, setFocus } = useBoard();
  const { viewer: me, pick, canPick } = useViewer(data.members);

  if (data.members.length === 0) {
    return (
      <section>
        <h2>My page</h2>
        <p>The member list hasn&apos;t been loaded yet. Ask {chapter.contact}.</p>
      </section>
    );
  }

  const picker = canPick && (
    <div className="bar">
      <label htmlFor="me-pick" className="inline">
        Viewing as
        <select id="me-pick" value={me?.id ?? ""} onChange={(e) => pick(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Choose your name</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} · {m.role}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  if (!me) {
    return (
      <section>
        <h2>My page</h2>
        {picker}
        <p>Choose your name to see your tasks, your team and what&apos;s coming up. This browser remembers it.</p>
      </section>
    );
  }

  const lead = leadOf(me, data.members);
  const mine = roundTasks(data, round?.round ?? null).find((p) => p.person === me.firstName);
  const left = round ? daysBetween(today, round.dueDate) : null;
  const dueDay = round ? fmt(round.dueDate, { weekday: "short", month: "short", day: "numeric" }) : "";
  const dueText = left === null ? "" : left > 1 ? `Due ${dueDay} · ${left} days left` : left === 1 ? `Due tomorrow, ${dueDay}` : left === 0 ? "Due today" : "Past due";
  const teammates = data.members.filter((x) => x.id !== me.id && (x.team === me.team || x.alsoTeam === me.team));
  const upcoming = data.socials.filter((s) => s.date >= today).slice(0, 3);
  // Scheduled meetings this person is invited to, by their next date.
  const myEmail = me.email.trim().toLowerCase();
  const meetings = data.scheduled
    .filter((m) => myEmail && m.invitees.some((i) => i.email.toLowerCase() === myEmail))
    .map((m) => ({ m, next: upcomingDates(m, today)[0] }))
    .filter((x) => x.next)
    .sort((a, b) => (a.next < b.next ? -1 : 1));
  // Meetings and events together, by date.
  const comingUp = [
    ...meetings.map(({ m, next }) => ({
      key: `m${m.id}`,
      date: next,
      text: `${m.title} · ${timeRange(m.startTime, m.endTime)}${m.weekly ? ", weekly" : ""}${m.location ? ` · ${m.location}` : ""}`,
    })),
    ...upcoming.map((e) => ({
      key: `s${e.id}`,
      date: e.date,
      text: [e.title, e.location, e.time].filter(Boolean).join(" · "),
    })),
  ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const timeline = data.settings.projects.timeline;
  const week = timeline.weeks.find((w) => daysBetween(w.start, today) >= 0 && daysBetween(today, w.end) >= -timeline.graceDays);
  const track = chapter.myPage.teamTrack[me.team];
  const trackItem = week && track ? week.items.find(([t]) => t === track) : undefined;
  const teamNote = chapter.myPage.teamNote[me.team];

  return (
    <section>
      {picker}
      <div className="me-head">
        <span className="nm">{me.name}</span>
        <span className="rl">{me.role}</span>
      </div>
      <ul className="me-facts">
        <li>
          <span>Team</span>
          <span>
            {me.team}
            {me.alsoTeam && ` · also ${me.alsoTeam}`}
          </span>
        </li>
        {lead && (
          <li>
            <span>Your lead</span>
            <span>
              {lead.name}
              {lead.email && ` · ${lead.email}`}
            </span>
          </li>
        )}
        <li>
          <span>Your email</span>
          <span>{me.email || "Not on file"}</span>
        </li>
      </ul>

      <h2>Your tasks · this week</h2>
      {mine ? (
        <>
          <p className="num">
            <strong>{dueText}.</strong>
          </p>
          <ul className="tasks">
            {mine.items.map((a) => (
              <li key={a.id}>
                <span>{a.task}</span>
              </li>
            ))}
          </ul>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setFocus({ tab: "assignments", key: me.firstName });
              go("assignments");
            }}
          >
            Submit your work
          </button>
        </>
      ) : (
        <p className="empty">
          No tasks assigned to you this round.
          {lead && lead.id !== me.id && ` ${lead.firstName} assigns tasks for ${me.team}, so check in with them if you want something to work on.`}
        </p>
      )}

      <h2>What your team is working on</h2>
      {week && trackItem ? (
        <p>
          <strong>
            Week {week.n} ({week.label}):
          </strong>{" "}
          {trackItem[1]}.
        </p>
      ) : teamNote ? (
        <p>{teamNote}</p>
      ) : null}
      <p>
        <button className="linkbtn" type="button" onClick={() => go("projects")}>
          Full timeline
        </button>
      </p>
      <p>
        <strong>Your team:</strong> {teammates.map((x) => x.firstName).join(", ") || "Just you for now"}
      </p>

      <h2>Coming up</h2>
      <ul className="dates">
        {meetings.length === 0 && data.settings.meetingTime && (
          <li>
            <span className="d">Weekly</span>
            <span>Board meeting, {data.settings.meetingTime}</span>
          </li>
        )}
        {comingUp.map((c) => (
          <li key={c.key}>
            <span className="d">{fmt(c.date, { month: "short", day: "numeric" })}</span>
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
      <p>
        <button className="linkbtn" type="button" onClick={() => go("socials")}>
          {chapter.socials.list}
        </button>
      </p>
    </section>
  );
}
