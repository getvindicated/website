import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { boardUser } from "@/lib/board/access";
import { loadBoard } from "@/lib/board/data";
import { BoardApp } from "@/components/board/BoardApp";

export const metadata: Metadata = { title: "VINdicated at Berkeley" };

// Today's date in Berkeley, so the server and browser agree on "today".
function todayInBerkeley() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

export default async function BoardPage() {
  const user = await boardUser(await headers());
  if (!user) notFound();
  const data = await loadBoard();
  return <BoardApp data={data} user={user} today={todayInBerkeley()} />;
}
