"use server";

import { getDb } from "../database";

export const POST: (request: Request) => Promise<Response> = async (
  request: Request
) => {
  try {
    const bookmark = await request.json();
    if (!bookmark.url || bookmark.url.trim() === "") {
      return new Response("URL cannot be empty", { status: 400 });
    }
    if (!bookmark.title || bookmark.title.trim() === "") {
      return new Response("Title cannot be empty", { status: 400 });
    }

    try {
      const db = getDb();
      const existingBookmark = db
        .prepare("SELECT * FROM bookmarks WHERE url = ?")
        .get(bookmark.url);

      if (existingBookmark) {
        return new Response(
          JSON.stringify({
            error: "指定されたURLのブックマークは既に登録されています。",
            message: "指定されたURLのブックマークは既に登録されています。",
            url: bookmark.url,
            title: bookmark.title,
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      const insertStmt = db.prepare(
        "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
      );
      const result = insertStmt.run(bookmark.url, bookmark.title);

      return new Response(
        JSON.stringify({
          url: bookmark.url,
          title: bookmark.title,
          id: result.lastInsertRowid,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (dbError: unknown) {
      throw dbError;
    }
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
};
