"use server";
import { SqliteError } from "better-sqlite3";

import { getDb } from "../bookmark/database";
import {
  createDuplicateKeywordError,
  createInternarlError,
  createInvalidBodyError,
  createNoKeywordError,
} from "../utils/response";

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
    return createInternarlError(error);
  }
};

interface KeywordInput {
  keyword_name: string;
}

export const POST = async (request: Request): Promise<Response> => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
    // 型ガードを使用してrawBodyがKeywordInputの構造を持つか検証します。
    // ここではKeywordInputが { keyword_name: string } であると仮定しています。
    if (
      typeof rawBody !== "object" ||
      rawBody === null ||
      !("keyword_name" in rawBody) ||
      typeof (rawBody as { keyword_name: unknown }).keyword_name !== "string"
    ) {
      throw new Error("リクエストボディのJSONが不正です。");
    }
  } catch (error: unknown) {
    return createInvalidBodyError(error);
  }

  // 型ガードにより、rawBodyは安全にKeywordInputとして扱えます。
  const keywordInput = rawBody as KeywordInput;
  const keywordName = keywordInput.keyword_name;
  if (keywordName.trim().length === 0) {
    return createNoKeywordError();
  }
  try {
    const keyword: KeywordInput = { keyword_name: keywordName.trim() };

    // データベース操作
    const db = getDb();
    const insertStmt = db.prepare(
      "INSERT INTO keywords (keyword_name) VALUES (?)"
    );
    const result = insertStmt.run(keyword.keyword_name);

    // キーワードの追加に成功
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
      return createDuplicateKeywordError(keywordName);
    }
    return createInternarlError(error);
  }
};
