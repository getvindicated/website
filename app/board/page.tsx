import type { Metadata } from "next";
import { headers } from "next/headers";
import { boardUser } from "@/lib/board/session";
import { loadBoard } from "@/lib/board/data";
import { BoardApp } from "@/components/board/BoardApp";
import { BoardLogin } from "@/components/board/BoardLogin";

export const metadata: Metadata = { title: "VINdicated at Berkeley" };

// Today's date in Berkeley, so the server and browser agree on "today".
function todayInBerkeley() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

export default async function BoardPage() {
  const user = boardUser(await headers());
  if (!user) return <BoardLogin />;
  if (!process.env.DATABASE_URL) {
    return <BoardNotice text="The board's database isn't connected yet. Rana: add DATABASE_URL in Railway (see BOARD_SETUP.md)." />;
  }
  let data;
  try {
    data = await loadBoard();
  } catch (e) {
    console.error("[board] Could not load the board:", e);
    return <BoardNotice text="The board couldn't reach its database. Try again in a minute; if it keeps happening, tell Rana." />;
  }
  return <BoardApp data={data} user={user} today={todayInBerkeley()} />;
}

function BoardNotice({ text }: { text: string }) {
  return (
    <main className="wrap">
      <h1>VINDICATED</h1>
      <p className="sub">UC Berkeley chapter board</p>
      <p>{text}</p>
    </main>
  );
}
