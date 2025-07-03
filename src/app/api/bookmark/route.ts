"use server";
import { SqliteError } from "better-sqlite3";

import { Bookmark } from "@/app/types/Bookmark";

import { ALLOWED_CORS_ORIGIN } from "../../constants/apiEndpoints";
import { createErrorResponse } from "../utils/response";
import { getDb } from "./database";

export async function GET() {
  try {
    const db = getDb();
    const stmt = db.prepare("SELECT id, url, title FROM bookmarks");
    const bookmarks = stmt.all();
    return new Response(JSON.stringify(bookmarks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return createErrorResponse(
      "サーバー内部でエラーが発生しました。",
      500,
      `Internal Server Error: ${(error as Error).message}`
    );
  }
}

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

  let bookmark: Bookmark = { id: 0, url: "", title: "" };
  try {
    bookmark = await request.json();
    if (!bookmark.url || bookmark.url.trim() === "") {
      return createErrorResponse(
        "URLを指定してください。",
        400,
        "URLが指定されていません。",
        commonHeaders
      );
    }
    if (!bookmark.title || bookmark.title.trim() === "") {
      return createErrorResponse(
        "タイトルを指定してください。",
        400,
        "タイトルが指定されていません。",
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
      { status: 201, headers: { ...commonHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return createErrorResponse(
        "指定されたURLのブックマークは既に登録されています。",
        409,
        `Bookmark with URL \"${bookmark.url}\" already exists.`
      );
    }
    return createErrorResponse(
      "サーバー内部でエラーが発生しました。",
      500,
      `Internal Server Error: ${(error as Error).message}`
    );
  }
}
