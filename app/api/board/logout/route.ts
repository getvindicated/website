import { sessionCookie } from "@/lib/board/session";

export async function POST() {
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie("", 0) } });
}
