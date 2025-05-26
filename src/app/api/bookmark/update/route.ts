"use server";

import { getDb } from "../database";

export async function POST(request: Request) {
  try {
    const bookmark = (await request.json()) as { id: number; title: string };
    if (bookmark.id === null) {
      return new Response("IDは正の整数である必要があります。", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    } else if (!bookmark.hasOwnProperty("id")) {
      return new Response("IDが指定されていません。", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    } else if (
      !bookmark.hasOwnProperty("title") ||
      bookmark.title === null ||
      bookmark.title.length === 0
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
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: unknown) {
    console.error("Error in POST /api/bookmark/update:", error); // サーバー側でエラーを記録
    return new Response("サーバーで予期せぬエラーが発生しました。", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
