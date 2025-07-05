"use server";

import { SqliteError } from "better-sqlite3";

import { getId, getIdAsync, InvalidIdError } from "../../utils/id";
import {
  createDuplicateBookmarkError,
  createInternarlError,
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
  { params }: { params: { id: string } }
) {
  try {
    const id = getId(params);
    const db = getDb();
    const stmt = db.prepare(
      "SELECT id, url, title FROM bookmarks WHERE id = ?"
    );
    const bookmark = stmt.get(id);
    if (!bookmark) {
      return createNotFoundBookmarkError(id);
    }
    return new Response(JSON.stringify(bookmark), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError(params);
    }
    return createInternarlError(error);
  }
}

// 更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let bookmark: { url: string; title: string } = { url: "", title: "" };
  try {
    const id = await getIdAsync({ params });
    bookmark = await request.json();
    if (!bookmark.title || bookmark.title.trim() === "") {
      return createNoTitleError();
    }
    if (!bookmark.url || bookmark.url.trim() === "") {
      return createNoUrlError();
    }

    const db = getDb();
    const prepare = db.prepare(
      "UPDATE bookmarks SET title = ?, url = ? WHERE id = ?"
    );
    const info = prepare.run(bookmark.title, bookmark.url, id);
    if (info.changes === 0) {
      return createNotFoundBookmarkError(id);
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return createInvalidBodyError(error);
    }
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return createDuplicateBookmarkError(bookmark.url);
    }
    if (error instanceof InvalidIdError) {
      return createInvalidIdError(await params);
    }
    return createInternarlError(error);
  }
}

// 削除
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdAsync({ params });
    const db = getDb();
    const prepare = db.prepare("DELETE FROM bookmarks WHERE id = ?");
    const info = prepare.run(id);
    if (info.changes === 0) {
      return createNotFoundBookmarkError(id);
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError(await params);
    }
    return createInternarlError(error);
  }
}
