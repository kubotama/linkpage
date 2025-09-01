"use server";
import { SqliteError } from "better-sqlite3";

import { HTTP_STATUS_CREATED, HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import { getDb } from "../bookmarks/database";
import {
  createDuplicateKeywordError,
  createInternalError,
  createInvalidBodyError,
  createNoKeywordError,
} from "../utils/response";

export const GET = async () => {
  try {
    const db = getDb();
    const stmt = db.prepare("SELECT keyword_id, keyword_name FROM keywords");
    const keywords = stmt.all();
    return new Response(JSON.stringify(keywords), {
      status: HTTP_STATUS_OK,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return createInternalError(error);
  }
};

interface KeywordInput {
  keyword_name: string;
}

export const POST = async (request: Request): Promise<Response> => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return createInvalidBodyError(new Error("リクエストボディのJSONが不正です。"));
  }
  // 型ガードを使用してrawBodyがKeywordInputの構造を持つか検証します。
  // ここではKeywordInputが { keyword_name: string } であると仮定しています。
  // まず、リクエストボディがオブジェクト形式でない場合（例: "foo", 123）を弾きます。
  if (typeof rawBody !== "object") {
    return createInvalidBodyError(new Error("リクエストボディのJSONが不正です。"));
  }
  // 次に、nullの場合や、必須プロパティ`keyword_name`が存在しない・型が違う場合を検証します。
  // `typeof null` は "object" であるため、このチェックは必須です。
  if (
    rawBody === null ||
    !("keyword_name" in rawBody) ||
    typeof (rawBody as { keyword_name: unknown }).keyword_name !== "string"
  ) {
    return createNoKeywordError();
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
    const insertStmt = db.prepare("INSERT INTO keywords (keyword_name) VALUES (?)");
    const result = insertStmt.run(keyword.keyword_name);

    // キーワードの追加に成功
    return new Response(
      JSON.stringify({
        keyword_name: keyword.keyword_name,
        keyword_id: result.lastInsertRowid,
      }),
      {
        status: HTTP_STATUS_CREATED,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return createDuplicateKeywordError(keywordName);
    }
    return createInternalError(error);
  }
};
