import { guard } from "@/lib/board/api";
import { listApplications } from "@/lib/apply/server";
import { applicationsCsv, matches, readFilter } from "@/lib/apply/admin";

// "Download CSV" of the applications that match the tab's filters (admins).
// No resumes and no reviewer notes.
export async function GET(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const filter = readFilter(new URL(request.url));
  const rows = (await listApplications(user.chapter)).filter((a) => matches(a, filter));
  const tag = [filter.status, filter.position].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return new Response(applicationsCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="board-applications-${user.chapter}${tag ? `-${tag}` : ""}.csv"`,
      "cache-control": "no-store, private",
    },
  });
}
