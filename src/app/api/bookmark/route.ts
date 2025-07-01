"use server";
import { SqliteError } from "better-sqlite3";

import Database from "better-sqlite3";

// import { Bookmark } from "@/app/types/Bookmark";
import { ALLOWED_CORS_ORIGIN } from "../../constants/apiEndpoints";
import { createErrorResponse } from "../utils/response";
import { getDb } from "./database";

export async function GET() {
  let db: Database.Database | null = null;
  try {
    db = getDb();
    const stmt = db.prepare("SELECT id, url, title FROM bookmarks");
    const bookmarks = stmt.all();
    return new Response(JSON.stringify(bookmarks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // return new Response((error as Error).message, {
    //   status: 500,
    //   headers: { "Content-Type": "text/plain" },
    // });
    return createErrorResponse(
      "サーバー内部でエラーが発生しました。",
      500,
      `Internal Server Error: ${error}`
    );
  }
}

// export async function POST(request: Request) {
//   try {
//     const bookmarks: Bookmark[] = await request.json(); // 型アサーションを追加

//     const db = getDb();

//     // トランザクションで既存データを削除し、新しいデータを挿入
//     const transaction = db.transaction((items: Bookmark[]) => {
//       db.prepare("DELETE FROM bookmarks").run(); // 既存データを全削除
//       const insert = db.prepare(
//         "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
//       );
//       for (const bookmark of items) {
//         insert.run(bookmark.url, bookmark.title);
//       }
//     });

//     transaction(bookmarks);

//     return new Response(undefined, { status: 200 });
//   } catch (error: unknown) {
//     return new Response((error as Error).message, {
//       status: 500,
//       headers: { "Content-Type": "text/plain" },
//     });
//   }
// }

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_CORS_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

// 追加
export async function POST(request: Request) {
  const commonHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_CORS_ORIGIN,
  };

  try {
    const bookmark = await request.json();
    if (!bookmark.url || bookmark.url.trim() === "") {
      // return new Response("URL cannot be empty", { status: 400 });
      return createErrorResponse(
        "URLを指定してください。",
        400,
        "",
        commonHeaders
      );
    }
    if (!bookmark.title || bookmark.title.trim() === "") {
      // return new Response("Title cannot be empty", { status: 400 });
      return createErrorResponse(
        "タイトルを指定してください。",
        400,
        "",
        commonHeaders
      );
    }

    const db = getDb();
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
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    // return new Response((error as Error).message, {
    //   status: 500,
    //   headers: { "Content-Type": "text/plain" },
    // });
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      // return new Response(
      //   "指定されたURLのブックマークは既に登録されています。",
      //   {
      //     status: 409,
      //     headers: { "Content-Type": "text/plain", ...commonHeaders },
      //   }
      // );
      return createErrorResponse(
        "指定されたURLのブックマークは既に登録されています。",
        409
      );
    }
    return createErrorResponse(
      "サーバー内部でエラーが発生しました。",
      500,
      `Internal Server Error: ${error}`
    );
  }
}
