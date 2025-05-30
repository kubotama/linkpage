"use server";

import { getDb } from "../database";

interface UpdateBookmarkPayload {
  id: number; // 型チェックは後続のバリデーションで行う
  title: string; // 型チェックは後続のバリデーションで行う
}

export async function POST(request: Request) {
  try {
    const bookmark = (await request.json()) as UpdateBookmarkPayload;
    if (!bookmark.hasOwnProperty("id")) {
      return new Response("IDが指定されていません。", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    } else if (
      typeof bookmark.id !== "number" ||
      !Number.isInteger(bookmark.id) ||
      bookmark.id <= 0
    ) {
      return new Response("IDは正の整数である必要があります。", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    } else if (
      !bookmark.hasOwnProperty("title") ||
      typeof bookmark.title !== "string" ||
      bookmark.title.trim().length === 0
    ) {
      return new Response("タイトルが指定されていません。", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const db = getDb();
    const prepare = db.prepare("UPDATE bookmarks SET title = ? WHERE id = ?");
    const info = prepare.run(bookmark.title, bookmark.id);
    if (info.changes === 0) {
      return new Response("指定されたブックマークがありません。", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }
    return new Response(null, {
      status: 204,
    });
  } catch (error: unknown) {
    console.error("Error in POST /api/bookmark/update:", error); // サーバー側でエラーを記録
    return new Response("サーバーで予期せぬエラーが発生しました。", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
