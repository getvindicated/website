"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { BoardUser } from "@/lib/board/session";
import { chapterConfig, type ChapterId } from "@/lib/board/chapters";
import type { BoardData } from "@/lib/board/types";
import { BoardContext, type BoardCtx } from "../BoardApp";
import { chapterUrl, setApiChapter } from "../util";
import { SimpleContext, firstName, loadMe, saveMe, type SimpleCtx } from "./shared";
import { HomeView } from "./HomeView";
import { TasksView } from "./TasksView";
import { TeamView } from "./TeamView";
import { CalendarView } from "./CalendarView";

// The simple layout (chapters.ts layout: "simple"): after sign-in, "Who are
// you?" until this device knows, then four tabs (Home, Tasks, Team,
// Calendar) under a sticky header. Same data and API as the classic hub.

const TABS = ["home", "tasks", "team", "calendar"] as const;
type View = (typeof TABS)[number];
const LABELS: Record<View, string> = { home: "Home", tasks: "Tasks", team: "Team", calendar: "Calendar" };
const fromHash = (): View => {
  const h = window.location.hash.slice(1);
  return (TABS as readonly string[]).includes(h) ? (h as View) : "home";
};

export function SimpleApp({ chapter: id, data, user, today }: { chapter: ChapterId; data: BoardData; user: BoardUser; today: string }) {
  setApiChapter(id);
  const chapter = chapterConfig(id);
  const brand = chapter.simple?.brand ?? chapter.loginSub;
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  const [view, setView] = useState<View>("home");
  // undefined until this device's choice is read (after the first render,
  // so the server and browser render the same thing).
  const [meId, setMeId] = useState<number | null | undefined>(undefined);
  const [toastText, setToastText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const admin = user.role === "admin";

  useEffect(() => {
    setMeId(loadMe(id));
    const sync = () => setView(fromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id]);

  const me = data.members.find((m) => m.id === meId) ?? null;
  const toast = useCallback((text: string) => {
    setToastText(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastText(""), 4500);
  }, []);
  const pick = (memberId: number | null) => {
    saveMe(id, memberId);
    setMeId(memberId);
  };

  const round = data.rounds.find((r) => r.isCurrent) ?? null;
  // The classic hub's context, for shared pieces (the member import).
  const board: BoardCtx = useMemo(
    () => ({ chapter, round, data, user, today, go: () => {}, refresh, focus: null, setFocus: () => {} }),
    [chapter, round, data, user, today, refresh],
  );
  const ctx: SimpleCtx = { me, admin, toast, forget: () => pick(null) };

  const onTab = (e: MouseEvent<HTMLAnchorElement>, t: View) => {
    e.preventDefault();
    if (window.location.hash.slice(1) !== t) history.pushState(null, "", `#${t}`);
    setView(t);
    window.scrollTo(0, 0);
  };

  async function signOut() {
    await fetch(chapterUrl("/api/board/logout"), { method: "POST" });
    router.refresh();
  }

  if (meId === undefined) return <div className="sb" />;

  // "Who are you?" until this device knows (or the person was removed).
  if (!me) {
    return (
      <div className="sb">
        <main className="gate">
          <p className="brand">
            VINdicated <span>/ {brand}</span>
          </p>
          <h1>Who are you?</h1>
          <p className="muted">Tap your name. We&apos;ll remember you on this device.</p>
          {data.members.length === 0 ? (
            <p className="empty">No one is on the board list yet. Ask {chapter.contact} to add it.</p>
          ) : (
            <ul className="people">
              {data.members.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => pick(m.id)}>
                    <b>{m.name}</b>
                    <span>{m.role}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="foot">
            <button type="button" className="linkish" onClick={signOut}>
              Sign out
            </button>
          </p>
        </main>
      </div>
    );
  }

  return (
    <BoardContext.Provider value={board}>
      <SimpleContext.Provider value={ctx}>
        <div className="sb">
          <header className="top">
            <div className="top-in">
              <div className="top-row">
                <p className="brand" style={{ margin: 0 }}>
                  VINdicated <span>/ {brand}</span>
                </p>
                <p className="hi" style={{ margin: 0 }}>
                  Hi, {firstName(me)}
                  <button type="button" className="linkish" onClick={() => pick(null)}>
                    Not you?
                  </button>
                </p>
              </div>
              <nav className="tabs" aria-label="Sections">
                {TABS.map((t) => (
                  <a key={t} href={`#${t}`} aria-current={view === t ? "page" : undefined} onClick={(e) => onTab(e, t)}>
                    {LABELS[t]}
                  </a>
                ))}
              </nav>
            </div>
          </header>
          <main className="wrapper">
            {view === "home" && <HomeView />}
            {view === "tasks" && <TasksView />}
            {view === "team" && <TeamView />}
            {view === "calendar" && <CalendarView />}
            <p className="foot">
              Signed in as {chapter.roleLabels[user.role] ?? user.role} ·{" "}
              <button type="button" className="linkish" onClick={signOut}>
                Sign out
              </button>
            </p>
          </main>
          {toastText && (
            <div className="toast" role="status">
              {toastText}
            </div>
          )}
        </div>
      </SimpleContext.Provider>
    </BoardContext.Provider>
  );
}
