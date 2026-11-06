import { guard } from "@/lib/board/api";
import { listResponses } from "@/lib/survey/server";
import { matches, readFilter, responsesCsv } from "@/lib/survey/stats";

// "Download CSV" on the Survey tab (admins): one row per response that
// matches the tab's filters, item ids as columns.
export async function GET(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const filter = readFilter(new URL(request.url));
  const rows = (await listResponses()).filter((r) => matches(r, filter));
  return new Response(responsesCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="car-confidence-survey${filter.includeTest ? "-with-tests" : ""}.csv"`,
      "cache-control": "no-store, private",
    },
  });
}
