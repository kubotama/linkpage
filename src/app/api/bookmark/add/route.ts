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
    // TODO: コメントアウトを削除する
    // return new Response((error as Error).message, {
    //   status: 500,
    //   headers: { "Content-Type": "text/plain" },
    // });
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return new Response(
        JSON.stringify({
          error: "Bookmark with this URL already exists.",
          message: "指定されたURLのブックマークは既に登録されています。",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // その他のエラーは500として返す
    console.error("Error adding bookmark:", error); // サーバーログに詳細なエラーを出力
    return new Response(
      (error as Error).message || "An unexpected error occurred.",
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
