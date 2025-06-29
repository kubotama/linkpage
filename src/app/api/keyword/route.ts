"use server";
import { SqliteError } from "better-sqlite3";

import { getDb } from "../bookmark/database";
import { createErrorResponse } from "../utils/response";

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
    return createErrorResponse("サーバー内部でエラーが発生しました。", 500);
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
    return createErrorResponse("リクエストボディのJSONが不正です。", 400);
  }

  try {
    const keywordName = rawBody.keyword_name;
    // 前後の空白を許容し、trimした結果が空でないことのみをチェック
    if (typeof keywordName !== "string" || keywordName.trim().length === 0) {
      return createErrorResponse("キーワードを指定してください。", 400);
    }

    const keyword: KeywordInput = { keyword_name: keywordName.trim() };

    // データベース操作
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
      return createErrorResponse(
        "指定されたキーワードは既に登録されています。",
        409
      );
    } else if (error instanceof TypeError) {
      return createErrorResponse("リクエストボディのJSONが不正です。", 400);
    }
    console.error("Internal Server Error:", error);
    return createErrorResponse("サーバー内部でエラーが発生しました。", 500);
  }
};
