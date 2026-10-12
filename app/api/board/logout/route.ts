import { chapterOf } from "@/lib/board/api";
import { sessionCookie } from "@/lib/board/session";

export async function POST(request: Request) {
  const chapter = chapterOf(request) ?? "berkeley";
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie(chapter, "", 0) } });
}
