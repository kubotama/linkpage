"use server";

import { getDb } from "../database";

export async function POST(request: Request) {
  try {
    const bookmark = await request.json();

    if (bookmark.id === undefined) {
      return new Response("ID is required", { status: 400 });
    }
    const db = getDb();
    const prepare = db.prepare("DELETE FROM bookmarks WHERE id = ?");
    const info = prepare.run(bookmark.id);
    if (info.changes === 0) {
      return new Response("Bookmark not found", { status: 404 });
    }
    return new Response("", {
      status: 204,
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
