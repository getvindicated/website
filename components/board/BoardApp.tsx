"use client";

import { createContext, useCallback, useContext, useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { BoardUser } from "@/lib/board/session";
import { chapterConfig, type ChapterConfig, type ChapterId } from "@/lib/board/chapters";
import { ADMIN_TABS, TABS, type BoardData, type Round, type Tab } from "@/lib/board/types";
import { chapterUrl, setApiChapter } from "./util";
import { MyPage } from "./MyPage";
import { ChangesTab } from "./ChangesTab";
import { EditLink, TextSetting } from "./Editors";
import { HomeTab } from "./HomeTab";
import { BoardTab } from "./BoardTab";
import { ProjectsTab } from "./ProjectsTab";
import { AssignmentsTab } from "./AssignmentsTab";
import { SocialsTab } from "./SocialsTab";
import { MeetingsTab } from "./MeetingsTab";
import { EventsTab } from "./EventsTab";
import { ApplicationsTab } from "./ApplicationsTab";

const LABELS: Record<Tab, string> = {
  me: "My page",
  home: "Home",
  board: "Board",
  projects: "Projects",
  assignments: "Assignments",
  socials: "Socials",
  meetings: "Meetings",
  events: "Events",
  applications: "Applications",
  changes: "Changes",
};

type Ctx = {
  chapter: ChapterConfig;
  // The round or week on the Assignments tab now.
  round: Round | null;
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

export function BoardApp({ chapter: id, data, user, today }: { chapter: ChapterId; data: BoardData; user: BoardUser; today: string }) {
  setApiChapter(id);
  const chapter = chapterConfig(id);
  const round = data.rounds.find((r) => r.isCurrent) ?? null;
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [focus, setFocus] = useState<Ctx["focus"]>(null);
  const [editingTerm, setEditingTerm] = useState(false);
  const admin = user.role === "admin";
  // The Events, Applications and Changes tabs are for admins only.
  const tabs = TABS.filter((t) => !ADMIN_TABS.includes(t) || admin);

  // Each tab is linkable: /board#socials, /board/ucla#me.
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

  const ctx: Ctx = { chapter, round, data, user, today, go, refresh, focus, setFocus };

  async function signOut() {
    await fetch(chapterUrl("/api/board/logout"), { method: "POST" });
    router.refresh();
  }

  return (
    <BoardContext.Provider value={ctx}>
      <div className="wrap">
        <nav aria-label="Sections">
          {tabs.map((t) => (
            <a key={t} href={`#${t}`} aria-current={tab === t ? "page" : undefined} onClick={(e) => onNav(e, t)}>
              {LABELS[t]}
            </a>
          ))}
        </nav>
        <h1>VINDICATED</h1>
        <p className="sub">
          {data.settings.term}
          {admin && !editingTerm && (
            <>
              {" "}
              <EditLink onClick={() => setEditingTerm(true)} />
            </>
          )}
        </p>
        {editingTerm && <TextSetting k="term" label="Subtitle" value={data.settings.term} onDone={() => setEditingTerm(false)} />}
        <p className="who-am-i deep">
          Signed in as {chapter.roleLabels[user.role] ?? user.role} ·{" "}
          <button type="button" className="linkbtn" onClick={signOut}>
            Sign out
          </button>
        </p>
        <main>
          {tab === "me" && <MyPage />}
          {tab === "home" && <HomeTab />}
          {tab === "board" && <BoardTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "assignments" && <AssignmentsTab />}
          {tab === "socials" && <SocialsTab />}
          {tab === "meetings" && <MeetingsTab />}
          {tab === "events" && admin && <EventsTab />}
          {tab === "applications" && admin && <ApplicationsTab />}
          {tab === "changes" && <ChangesTab />}
        </main>
      </div>
    </BoardContext.Provider>
  );
}
