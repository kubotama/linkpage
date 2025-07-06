"use server";
import { SqliteError } from "better-sqlite3";

import { Bookmark } from "@/app/types/Bookmark";
import eventEmitter from "../../../lib/event-emitter";

import { ALLOWED_CORS_ORIGIN } from "../../constants/apiEndpoints";
import { API_BOOKMARKS_URL } from "../utils/constants";
import {
  createDuplicateBookmarkError,
  createInternalError,
  createInvalidBodyError,
  createNoTitleError,
  createNoUrlError,
} from "../utils/response";
import { getDb } from "./database";

export async function GET() {
  try {
    const db = getDb();
    const stmt = db.prepare("SELECT bookmark_id, url, title FROM bookmarks");
    const bookmarks = stmt.all();
    return new Response(JSON.stringify(bookmarks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return createInternalError(error);
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

  let bookmark: Bookmark = { bookmark_id: 0, url: "", title: "" };
  try {
    bookmark = await request.json();
    if (!bookmark.url || bookmark.url.trim() === "") {
      return createNoUrlError(commonHeaders);
    }
    if (!bookmark.title || bookmark.title.trim() === "") {
      return createNoTitleError(commonHeaders);
    }

    const db = getDb();
    const insertStmt = db.prepare(
      "INSERT INTO bookmarks (url, title) VALUES (?, ?)"
    );
    const result = insertStmt.run(bookmark.url, bookmark.title);

    // ブックマークが更新されたことを通知
    eventEmitter.emit("bookmarks-updated");

    return new Response(
      JSON.stringify({
        url: bookmark.url,
        title: bookmark.title,
        bookmark_id: result.lastInsertRowid,
      }),
      {
        status: 201,
        headers: {
          ...commonHeaders,
          "Content-Type": "application/json",
          Location: `${API_BOOKMARKS_URL}/${result.lastInsertRowid}`,
        },
      }
    );
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return createInvalidBodyError(error, commonHeaders);
    }
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return createDuplicateBookmarkError(bookmark.url, commonHeaders);
    }
    return createInternalError(error, commonHeaders);
  }
}
