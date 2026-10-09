"use client";

import { createContext, useCallback, useContext, useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { BoardUser } from "@/lib/board/access";
import { TABS, type BoardData, type Tab } from "@/lib/board/types";
import { TERM } from "@/lib/board/static";
import { HomeTab } from "./HomeTab";
import { BoardTab } from "./BoardTab";
import { ProjectsTab } from "./ProjectsTab";
import { AssignmentsTab } from "./AssignmentsTab";
import { SocialsTab } from "./SocialsTab";
import { MeetingsTab } from "./MeetingsTab";

const LABELS: Record<Tab, string> = {
  home: "Home",
  board: "Board",
  projects: "Projects",
  assignments: "Assignments",
  socials: "Socials",
  meetings: "Meetings",
};

type Ctx = {
  data: BoardData;
  user: BoardUser;
  today: string;
  go: (tab: Tab, then?: () => void) => void;
  refresh: () => void;
  // Lets one tab ask another to open something (e.g. a person's tasks).
  focus: { tab: Tab; key: string } | null;
  setFocus: (f: { tab: Tab; key: string } | null) => void;
};

const BoardContext = createContext<Ctx | null>(null);
export const useBoard = () => {
  const c = useContext(BoardContext);
  if (!c) throw new Error("useBoard outside BoardApp");
  return c;
};

const fromHash = (): Tab => {
  const h = window.location.hash.slice(1);
  return (TABS as readonly string[]).includes(h) ? (h as Tab) : "home";
};

export function BoardApp({ data, user, today }: { data: BoardData; user: BoardUser; today: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [focus, setFocus] = useState<Ctx["focus"]>(null);

  // Each tab is linkable: /board#socials.
  useEffect(() => {
    const sync = () => setTab(fromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const go = useCallback((t: Tab, then?: () => void) => {
    if (window.location.hash.slice(1) !== t) history.pushState(null, "", `#${t}`);
    setTab(t);
    window.scrollTo(0, 0);
    if (then) requestAnimationFrame(then);
  }, []);

  const refresh = useCallback(() => router.refresh(), [router]);

  const onNav = (e: MouseEvent<HTMLAnchorElement>, t: Tab) => {
    e.preventDefault();
    go(t);
  };

  const ctx: Ctx = { data, user, today, go, refresh, focus, setFocus };
  const roleLabel =
    user.role === "admin" ? "admin" : user.role === "socials" ? "socials editor" : "board member";

  return (
    <BoardContext.Provider value={ctx}>
      <div className="wrap">
        <nav aria-label="Sections">
          {TABS.map((t) => (
            <a key={t} href={`#${t}`} aria-current={tab === t ? "page" : undefined} onClick={(e) => onNav(e, t)}>
              {LABELS[t]}
            </a>
          ))}
        </nav>
        <h1>VINDICATED</h1>
        <p className="sub">{TERM}</p>
        <p className="who-am-i deep">
          Signed in as {user.email} ({roleLabel})
        </p>
        <main>
          {tab === "home" && <HomeTab />}
          {tab === "board" && <BoardTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "assignments" && <AssignmentsTab />}
          {tab === "socials" && <SocialsTab />}
          {tab === "meetings" && <MeetingsTab />}
        </main>
      </div>
    </BoardContext.Provider>
  );
}
