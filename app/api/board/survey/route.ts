import { guard } from "@/lib/board/api";
import { db } from "@/lib/board/db";
import { actorOf, logEntry } from "@/lib/board/changelog";
import { deleteTestResponses, listResponses } from "@/lib/survey/server";
import { readFilter, stats } from "@/lib/survey/stats";
import { ITEMS, WORDING_APPROVED, itemsIn } from "@/lib/survey/questions";
import { surveyPublic } from "@/lib/survey/flag";
import { getDictionary } from "@/lib/i18n/get-dictionary";

// The English wording the tab shows next to the numbers.
async function labels() {
  const d = (await getDictionary("en")).surveyPage;
  return {
    approved: WORDING_APPROVED,
    isPublic: surveyPublic(),
    sections: d.sections,
    items: Object.fromEntries(ITEMS.map((i) => [i.id, i.text])),
    pairs: ITEMS.filter((i) => i.pairOf).map((i) => [i.pairOf, i.id]),
    sectionItems: {
      breakdown: itemsIn("breakdown").map((i) => i.id),
      buying: itemsIn("buying").map((i) => i.id),
      repair: itemsIn("repair").map((i) => i.id),
    },
    demo: d.demo,
  };
}

// The hub's Survey tab (admins of any chapter; every chapter sees the same
// org-wide results). GET: totals, averages and group splits for the tab's
// filters. Groups under 5 responses come back hidden, with no numbers.
export async function GET(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const rows = await listResponses();
  return Response.json({ ...stats(rows, readFilter(new URL(request.url))), labels: await labels() }, { headers: { "cache-control": "no-store, private" } });
}

// "Delete test responses": the answers admins sent while previewing.
export async function DELETE(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  const deleted = await deleteTestResponses();
  if (deleted) await logEntry(db(), user, actorOf(request), "note", `Deleted ${deleted} test survey ${deleted === 1 ? "response" : "responses"}`, []);
  return Response.json({ deleted });
}
