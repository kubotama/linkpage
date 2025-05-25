"use server";

import { getDb } from "../database";

export async function POST(request: Request) {
  try {
    const bookmark = (await request.json()) as { id?: number };

    if (typeof bookmark.id !== "number" || bookmark.id <= 0) {
      return new Response("ID is required", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }
    const db = getDb();
    const prepare = db.prepare("DELETE FROM bookmarks WHERE id = ?");
    const info = prepare.run(bookmark.id);
    if (info.changes === 0) {
      return new Response("Bookmark not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }
    return new Response(null, {
      status: 204,
    });
  } catch (error: unknown) {
    console.error("Error in POST /api/bookmark/delete:", error); // サーバー側でエラーを記録
    return new Response("サーバーで予期せぬエラーが発生しました。", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
