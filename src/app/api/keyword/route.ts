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
    console.error("Internal Server Error:", error);
    return new Response(
      JSON.stringify({ message: "サーバー内部でエラーが発生しました。" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

interface KeywordInput {
  keyword_name: string;
}

export const POST = async (request: Request): Promise<Response> => {
  let rawBody: KeywordInput;
  try {
    rawBody = (await request.json()) as KeywordInput;
  } catch {
    // request.json()が失敗した場合 (不正なJSON)
    return new Response(
      JSON.stringify({ message: "リクエストボディのJSONが不正です。" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // バリデーション
  if (typeof rawBody !== "object" || rawBody === null) {
    return new Response(
      JSON.stringify({ message: "リクエストボディのJSONが不正です。" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const keywordName = rawBody.keyword_name;
  // 前後の空白を許容し、trimした結果が空でないことのみをチェック
  if (typeof keywordName !== "string" || keywordName.trim().length === 0) {
    return new Response(
      JSON.stringify({ message: "キーワードを指定してください。" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const keyword: KeywordInput = { keyword_name: keywordName.trim() };

  // データベース操作
  try {
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
      return new Response(
        JSON.stringify({
          message: "指定されたキーワードは既に登録されています。",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.error("Internal Server Error:", error);
    return new Response(
      JSON.stringify({ message: "サーバー内部でエラーが発生しました。" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
