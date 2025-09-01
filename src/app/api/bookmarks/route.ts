"use server";
import { SqliteError } from "better-sqlite3";

import { BookmarkFromDb } from "@/app/types/database";

import eventEmitter from "../../../lib/event-emitter";
import { ALLOWED_CORS_ORIGIN } from "../../constants/apiEndpoints";
import {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_OK,
} from "../../constants/httpStatusCodes";
import { Bookmark, IncomingBookmarkPayload, parseAndValidateKeywords } from "../../types/Bookmark";
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
    const stmt = db.prepare(`
      SELECT
        b.bookmark_id,
        b.url,
        b.title,
        COALESCE(
          JSON_GROUP_ARRAY(JSON_OBJECT('keyword_id', k.keyword_id, 'keyword_name', k.keyword_name) ORDER BY k.keyword_id) FILTER (WHERE k.keyword_id IS NOT NULL),
          '[]'
        ) AS keywords
      FROM
        bookmarks AS b
      LEFT JOIN
        bookmark_keywords AS bk ON b.bookmark_id = bk.bookmark_id
      LEFT JOIN
        keywords AS k ON bk.keyword_id = k.keyword_id
      GROUP BY
        b.bookmark_id
      ORDER BY
        b.bookmark_id
    `);
    const bookmarksFromDb = stmt.all() as BookmarkFromDb[];

    const bookmarks = bookmarksFromDb.map(
      (b): Bookmark => ({
        ...b,
        keywords: parseAndValidateKeywords(b.keywords),
      })
    );
    return new Response(JSON.stringify(bookmarks), {
      status: HTTP_STATUS_OK,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return createInternalError(error);
  }
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: HTTP_STATUS_NO_CONTENT, // No Content
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

  // let bookmark: Bookmark = { bookmark_id: 0, url: "", title: "", keywords: [] };
  let incomingData: IncomingBookmarkPayload;
  try {
    incomingData = await request.json();
  } catch (error) {
    // JSONパースエラーのハンドリング
    return createInvalidBodyError(error, commonHeaders);
  }
  try {
    // incomingDataがオブジェクトでない場合(例: JSONが "null" だった場合)を考慮します
    if (!incomingData || typeof incomingData !== "object") {
      return createInvalidBodyError(
        new Error("リクエストボディはJSONオブジェクトである必要があります。"),
        commonHeaders
      );
    }
    if (!incomingData.url || incomingData.url.trim() === "") {
      return createNoUrlError(commonHeaders);
    }
    if (!incomingData.title || incomingData.title.trim() === "") {
      return createNoTitleError(commonHeaders);
    }

    // Bookmark型に適合するようにオブジェクトを構築
    // bookmark_idは新規作成の場合は0、データベースで自動生成されることを想定
    const bookmark: Bookmark = {
      bookmark_id: 0,
      url: incomingData.url,
      title: incomingData.title,
      keywords: [], // 現在はブックマークの追加は拡張機能からのみのためキーワードを設定されることはない。
    };

    const db = getDb();
    const insertStmt = db.prepare("INSERT INTO bookmarks (url, title) VALUES (?, ?)");
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
        status: HTTP_STATUS_CREATED,
        headers: {
          ...commonHeaders,
          "Content-Type": "application/json",
          Location: `${API_BOOKMARKS_URL}/${result.lastInsertRowid}`,
        },
      }
    );
  } catch (error: unknown) {
    if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return createDuplicateBookmarkError(incomingData.url, commonHeaders);
    }
    return createInternalError(error, commonHeaders);
  }
}
