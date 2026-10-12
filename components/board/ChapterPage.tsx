import { headers } from "next/headers";
import { boardUser } from "@/lib/board/session";
import { loadBoard } from "@/lib/board/data";
import type { ChapterId } from "@/lib/board/chapters";
import { BoardApp } from "./BoardApp";
import { BoardLogin } from "./BoardLogin";

// Today's date in California, so the server and browser agree on "today".
function todayInCalifornia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

// One chapter's board hub: the sign-in box, or the hub for whoever is
// signed in to this chapter.
export async function ChapterPage({ chapter }: { chapter: ChapterId }) {
  const user = boardUser(await headers(), chapter);
  if (!user) return <BoardLogin chapter={chapter} />;
  if (!process.env.DATABASE_URL) {
    return <BoardNotice chapter={chapter} text="The board's database isn't connected yet. Rana: add DATABASE_URL in Railway (see BOARD_SETUP.md)." />;
  }
  let data;
  try {
    data = await loadBoard(user);
  } catch (e) {
    console.error("[board] Could not load the board:", e);
    return <BoardNotice chapter={chapter} text="The board couldn't reach its database. Try again in a minute; if it keeps happening, tell Rana." />;
  }
  return <BoardApp chapter={chapter} data={data} user={user} today={todayInCalifornia()} />;
}

function BoardNotice({ chapter, text }: { chapter: ChapterId; text: string }) {
  return (
    <main className="wrap">
      <h1>VINDICATED</h1>
      <p className="sub">{chapter === "ucla" ? "UCLA chapter board hub" : "UC Berkeley chapter board"}</p>
      <p>{text}</p>
    </main>
  );
}
