"use server";

import { SqliteError } from "better-sqlite3";

import { Bookmark, parseAndValidateKeywords } from "../../../types/Bookmark";
import { BookmarkFromDb } from "@/app/types/database";

import { getBookmarkIdAsync, InvalidIdError } from "../../utils/id";
import {
  createDuplicateBookmarkError,
  createInternalError,
  createInvalidBodyError,
  createInvalidIdError,
  createNotFoundBookmarkError,
  createNoTitleError,
  createNoUrlError,
} from "../../utils/response";
import { getDb } from "../database";

// 1件取得
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookmark_id: string }> }
) {
  try {
    const bookmark_id = await getBookmarkIdAsync({ params });
    const db = getDb();
    const stmt = db.prepare(`
      SELECT
        b.bookmark_id,
        b.url,
        b.title,
        COALESCE(
          JSON_GROUP_ARRAY(JSON_OBJECT('keyword_id', k.keyword_id, 'keyword_name', k.keyword_name)) FILTER (WHERE k.keyword_id IS NOT NULL),
          '[]'
        ) AS keywords
      FROM
        bookmarks AS b
      LEFT JOIN
        bookmark_keywords AS bk ON b.bookmark_id = bk.bookmark_id
      LEFT JOIN
        keywords AS k ON bk.keyword_id = k.keyword_id
      WHERE
        b.bookmark_id = ?
      GROUP BY
        b.bookmark_id
    `);
    const bookmarkFromDb = stmt.get(bookmark_id) as BookmarkFromDb;
    if (!bookmarkFromDb) {
      return createNotFoundBookmarkError(bookmark_id);
    }
    const bookmark: Bookmark = {
      ...bookmarkFromDb,
      keywords: parseAndValidateKeywords(bookmarkFromDb.keywords),
    };
    return new Response(JSON.stringify(bookmark), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError({ id: (await params).bookmark_id });
    }
    return createInternalError(error);
  }
}

// 更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ bookmark_id: string }> }
) {
  let bookmark: { url: string; title: string } = { url: "", title: "" };
  try {
    const bookmark_id = await getBookmarkIdAsync({ params });
    bookmark = await request.json();
    if (!bookmark.title || bookmark.title.trim() === "") {
      return createNoTitleError();
    }
    if (!bookmark.url || bookmark.url.trim() === "") {
      return createNoUrlError();
    }

    const db = getDb();
    const prepare = db.prepare("UPDATE bookmarks SET title = ?, url = ? WHERE bookmark_id = ?");
    const info = prepare.run(bookmark.title, bookmark.url, bookmark_id);
    if (info.changes === 0) {
      return createNotFoundBookmarkError(bookmark_id);
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return createInvalidBodyError(error);
    }
    if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return createDuplicateBookmarkError(bookmark.url);
    }
    if (error instanceof InvalidIdError) {
      return createInvalidIdError({ id: (await params).bookmark_id });
    }
    return createInternalError(error);
  }
}

// 削除
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ bookmark_id: string }> }
) {
  try {
    const bookmark_id = await getBookmarkIdAsync({ params });
    const db = getDb();
    const prepare = db.prepare("DELETE FROM bookmarks WHERE bookmark_id = ?");
    const info = prepare.run(bookmark_id);
    if (info.changes === 0) {
      return createNotFoundBookmarkError(bookmark_id);
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError({ id: (await params).bookmark_id });
    }
    return createInternalError(error);
  }
}
