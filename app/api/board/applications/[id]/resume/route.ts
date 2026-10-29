import { guard, idFrom, notFound } from "@/lib/board/api";
import { db } from "@/lib/board/db";

// Downloads an applicant's resume (admins only).
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  if (!id) return notFound();
  const [r] = await db()`SELECT f.filename, f.data FROM board_applications a
    JOIN board_application_files f ON f.id = a.resume_id AND f.chapter = a.chapter
    WHERE a.id = ${id} AND a.chapter = ${user.chapter}`;
  if (!r) return notFound();
  const name = String(r.filename).replace(/[^\w .()-]/g, "_") || "resume.pdf";
  return new Response(new Uint8Array(r.data as Buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(String(r.filename))}`,
      "cache-control": "no-store, private",
      "x-content-type-options": "nosniff",
    },
  });
}
