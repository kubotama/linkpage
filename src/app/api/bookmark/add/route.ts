"use server";

import Database from "better-sqlite3";

import { Bookmark } from "@/app/types/Bookmark";

import { getDb } from "../database";

export async function POST(request: Request) {
  let db: Database.Database | null = null;
  try {
    const bookmark: Bookmark = await request.json(); // 型アサーションを追加

    db = getDb();

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
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  } finally {
    db?.close();
  }
}
