"use client";

import { createContext, useContext } from "react";
import type { Assignment, Member } from "@/lib/board/types";

// What the simple layout's screens share: who this device picked ("Who are
// you?"), whether it's an admin sign-in, and a toast.
export type SimpleCtx = {
  me: Member | null;
  admin: boolean;
  toast: (text: string) => void;
  forget: () => void;
};

export const SimpleContext = createContext<SimpleCtx | null>(null);
export const useSimple = () => {
  const c = useContext(SimpleContext);
  if (!c) throw new Error("useSimple outside SimpleApp");
  return c;
};

// The member this device picked, by id. localStorage can throw (private
// mode, blocked storage), so every read and write is guarded.
const meKey = (chapter: string) => `vin-board-me-${chapter}`;
export function loadMe(chapter: string): number | null {
  try {
    const n = Number(localStorage.getItem(meKey(chapter)));
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}
export function saveMe(chapter: string, id: number | null) {
  try {
    if (id) localStorage.setItem(meKey(chapter), String(id));
    else localStorage.removeItem(meKey(chapter));
  } catch {
    /* not remembered on this device */
  }
}

export type TaskState = "todo" | "done" | "late";
export const STATE_LABEL: Record<TaskState, string> = { todo: "To do", done: "Done", late: "Late" };

// Done once submitted (or marked done/excused by an admin); Late when the
// due date has passed and it isn't done.
export function taskState(a: Assignment, today: string): TaskState {
  if (a.status === "submitted" || a.status === "done" || a.status === "excused") return "done";
  return a.dueDate && a.dueDate < today ? "late" : "todo";
}

export function Pill({ state }: { state: TaskState }) {
  return <span className={`pill${state === "done" ? " done" : state === "late" ? " late" : ""}`}>{STATE_LABEL[state]}</span>;
}

// "Sun, Nov 8" for a YYYY-MM-DD (a calendar day, no time-zone shift).
export const dayLabel = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
export const longDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });

export function DateBox({ iso }: { iso: string }) {
  const d = new Date(`${iso}T12:00:00Z`);
  return (
    <div className="datebox" aria-hidden="true">
      <span>{d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" }).toUpperCase()}</span>
      <b>{d.getUTCDate()}</b>
    </div>
  );
}

export const firstName = (m: Member) => m.firstName || m.name.split(/\s+/)[0];
