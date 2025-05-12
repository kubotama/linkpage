"use server";

import Database from "better-sqlite3";

import { Bookmark } from "@/app/types/Bookmark";

import { getDb } from "./database";

export async function GET() {
  let db: Database.Database | null = null;
  try {
    db = getDb();
    const stmt = db.prepare("SELECT url, title FROM bookmarks");
    const bookmarks = stmt.all();
    return new Response(JSON.stringify(bookmarks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // console.error("Error fetching bookmarks:", error);
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  } finally {
    db?.close();
  }
}

export async function POST(request: Request) {
  let db: Database.Database | null = null;
  try {
    const bookmarks: Bookmark[] = await request.json(); // 型アサーションを追加

    db = getDb();

    // トランザクションで既存データを削除し、新しいデータを挿入
    const transaction = db.transaction((items: Bookmark[]) => {
      db?.prepare("DELETE FROM bookmarks").run(); // 既存データを全削除
      const insert = db?.prepare(
        "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
      );
      for (const bookmark of items) {
        insert?.run(bookmark.url, bookmark.title);
      }
    });

    transaction(bookmarks);

    return new Response(undefined, { status: 200 });
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  } finally {
    db?.close();
  }
}
