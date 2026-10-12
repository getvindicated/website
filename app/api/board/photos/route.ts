import { bad, guard } from "@/lib/board/api";
import { db } from "@/lib/board/db";

const TYPES = ["image/webp", "image/png", "image/jpeg"];
const MAX = 2 * 1024 * 1024;

// Uploads a photo for the Home tab's photo row (admins only). Returns its
// address; saving the photo row itself is a separate, logged change.
export async function POST(request: Request) {
  const user = await guard(request, ["admin"]);
  if (user instanceof Response) return user;
  let file: File | null = null;
  try {
    const f = (await request.formData()).get("file");
    file = f instanceof File ? f : null;
  } catch {
    /* handled below */
  }
  if (!file || !file.size) return bad("Choose a photo.");
  if (!TYPES.includes(file.type)) return bad("Use a JPG, PNG or WebP photo.");
  if (file.size > MAX) return bad("That photo is over 2 MB. Make it smaller and try again.");
  const data = Buffer.from(await file.arrayBuffer());
  const [row] = await db()`INSERT INTO board_photos (chapter, content_type, data) VALUES (${user.chapter}, ${file.type}, ${data}) RETURNING id`;
  return Response.json({ src: `/api/board/photos/${row.id}` }, { status: 201 });
}
