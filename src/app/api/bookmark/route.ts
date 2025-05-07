"use server";

import Database from "better-sqlite3";

import { Bookmark } from "../../components/BookmarkManager"; // Bookmark型をインポート

const dbFile = "./bookmarks.sqlite";

// データベース接続とテーブル初期化
const initializeDb = () => {
  const db = new Database(dbFile);
  // テーブルが存在しない場合のみ作成
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL
    )
  `);
  return db;
};

export async function GET() {
  let db: Database.Database | null = null;
  try {
    db = initializeDb();
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

    db = initializeDb();

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
