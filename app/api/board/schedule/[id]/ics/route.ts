import { guard, idFrom, notFound } from "@/lib/board/api";
import { chapterConfig } from "@/lib/board/chapters";
import { CHAPTER_SERVER } from "@/lib/board/chapter-server";
import { buildIcs } from "@/lib/board/ics";
import { hubUrl } from "@/lib/board/invites";
import { getScheduled } from "@/lib/board/schedule-server";

// "Add to calendar" on a calendar item: its .ics for anyone signed in to the
// chapter. Same UID and SEQUENCE as the emailed invite, so it's the same
// calendar event, without the attendee list.
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await guard(request);
  if (user instanceof Response) return user;
  const id = idFrom((await ctx.params).id);
  const meeting = id ? await getScheduled(user.chapter, id) : null;
  if (!meeting) return notFound();
  const org = CHAPTER_SERVER[user.chapter].organizer;
  const ics = buildIcs({
    method: "PUBLISH",
    meeting,
    organizer: { name: `${org.short} (${chapterConfig(user.chapter).title})`, email: org.email },
    attendees: [],
    hubUrl: hubUrl(user.chapter),
  });
  const slug = meeting.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "event";
  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.ics"`,
      "cache-control": "no-store, private",
    },
  });
}
