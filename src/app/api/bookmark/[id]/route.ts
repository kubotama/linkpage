"use server";

import { SqliteError } from "better-sqlite3";

import { createErrorResponse } from "../../utils/response";
import { getDb } from "../database";

// 1件取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return createErrorResponse(
      "IDは正の整数である必要があります。",
      400,
      `Bookmark with id: ${id} is invalid.`
    );
  }
  try {
    const db = getDb();
    const stmt = db.prepare(
      "SELECT id, url, title FROM bookmarks WHERE id = ?"
    );
    const bookmark = stmt.get(id);
    if (!bookmark) {
      return createErrorResponse(
        "指定されたブックマークがありません。",
        404,
        `Bookmark with id: ${id} not found.`
      );
    }
    return new Response(JSON.stringify(bookmark), {
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

// 更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return createErrorResponse(
      "IDは正の整数である必要があります。",
      400,
      `Bookmark with id: ${id} is invalid.`
    );
  }
  let bookmark: { url: string; title: string } = { url: "", title: "" };
  try {
    bookmark = await request.json();
    if (!bookmark.title || bookmark.title.trim() === "") {
      return createErrorResponse(
        "タイトルが指定されていません。",
        400,
        "タイトルが指定されていません。"
      );
    }
    if (!bookmark.url || bookmark.url.trim() === "") {
      return createErrorResponse(
        "URLが指定されていません。",
        400,
        "URLが指定されていません。"
      );
    }

    const db = getDb();
    const prepare = db.prepare(
      "UPDATE bookmarks SET title = ?, url = ? WHERE id = ?"
    );
    const info = prepare.run(bookmark.title, bookmark.url, id);
    if (info.changes === 0) {
      return createErrorResponse(
        "指定されたブックマークがありません。",
        404,
        `Bookmark with id: ${id} not found.`
      );
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        "リクエストボディのJSONが不正です。",
        400,
        `Invalid JSON format: ${error.message}`
      );
    }
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
      "サーバーで予期せぬエラーが発生しました。",
      500,
      `Internal Server Error: ${(error as Error).message}`
    );
  }
}

// 削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return createErrorResponse(
      "IDは正の整数である必要があります。",
      400,
      `Bookmark with id: ${id} is invalid.`
    );
  }
  try {
    const db = getDb();
    const prepare = db.prepare("DELETE FROM bookmarks WHERE id = ?");
    const info = prepare.run(id);
    if (info.changes === 0) {
      return createErrorResponse(
        "指定されたブックマークがありません。",
        404,
        `Bookmark with id: ${id} not found.`
      );
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    return createErrorResponse(
      "サーバー内部でエラーが発生しました。",
      500,
      `Internal Server Error: ${(error as Error).message}`
    );
  }
}
