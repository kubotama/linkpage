"use server";

import { SqliteError } from "better-sqlite3";

import { getDb } from "../database";

export async function POST(request: Request) {
  try {
    const bookmark = await request.json();
    if (!bookmark.url || bookmark.url.trim() === "") {
      return new Response("URL cannot be empty", { status: 400 });
    }
    if (!bookmark.title || bookmark.title.trim() === "") {
      return new Response("Title cannot be empty", { status: 400 });
    }

    const db = getDb();
    const insert = db.prepare(
      "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
    );
    try {
      const info = insert.run(bookmark.url, bookmark.title);

      return new Response(
        JSON.stringify({
          url: bookmark.url,
          title: bookmark.title,
          id: info.lastInsertRowid,
        }),
        {
          status: 200,
        }
      );
    } catch (error: unknown) {
      if (
        error instanceof SqliteError &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        return new Response(
          JSON.stringify({
            error: "Bookmark with this URL already exists.",
            message: "指定されたURLのブックマークは既に登録されています。",
            url: bookmark.url,
            title: bookmark.title,
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        throw error;
      }
    }
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
