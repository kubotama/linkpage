"use server";
import { SqliteError } from "better-sqlite3";

import { getDb } from "../bookmark/database";

export const GET = async () => {
  try {
    const db = getDb();
    const stmt = db.prepare("SELECT keyword_id, keyword_name FROM keywords");
    const keywords = stmt.all();
    return new Response(JSON.stringify(keywords), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

interface KeywordInput {
  keyword_name: string;
}

export const POST: (request: Request) => Promise<Response> = async (
  request: Request
) => {
  try {
    let keyword: KeywordInput;
    try {
      keyword = (await request.json()) as KeywordInput;
    } catch {
      return new Response("リクエストボディのJSONが不正です。", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }
    if (!keyword.keyword_name || keyword.keyword_name.trim() === "") {
      return new Response("キーワードを指定してください。", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }
    const db = getDb();
    const insertStmt = db.prepare(
      "INSERT INTO keywords (keyword_name) VALUES (?)"
    );
    const result = insertStmt.run(keyword.keyword_name);
    return new Response(
      JSON.stringify({
        keyword_name: keyword.keyword_name,
        keyword_id: result.lastInsertRowid,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return new Response("指定されたキーワードは既に登録されています。", {
        status: 409,
        headers: { "Content-Type": "text/plain" },
      });
    }
    console.error("Internal Server Error:", error);
    return new Response("サーバー内部でエラーが発生しました。", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};
