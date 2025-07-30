import { SqliteError } from "better-sqlite3";

import {
  createDuplicateKeywordAssociationError,
  createInternalError,
  createInvalidBodyError,
  createInvalidIdError,
  createNoKeywordError,
  createNotFoundBookmarkError,
} from "../../../utils/response";
import { validateId } from "../../../utils/validator";
import { getDb } from "../../database";
import { isKeyword } from "../../../../types/Keyword";

class BookmarkNotFoundError extends Error {}

const getOrCreateKeyword = (name: string): number => {
  // 最初にキーワードを検索
  const existingKeyword = selectKeywordStmt.get(name);
  if (isKeyword(existingKeyword)) {
    return existingKeyword.keyword_id;
  }

  // 見つからなければ挿入を試みる
  try {
    const result = insertKeywordStmt.run(name);
    return Number(result.lastInsertRowid);
  } catch (error) {
    // レースコンディションで他のリクエストが先に挿入した場合
    if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      // 再度検索してIDを取得
      const keywordAfterRace = selectKeywordStmt.get(name);
      if (isKeyword(keywordAfterRace)) {
        return keywordAfterRace.keyword_id;
      }
      // レースコンディションで挿入されたはずのキーワードが見つからない。
      // これは予期せぬ状態なので、元のエラーではなく新しいエラーをスローして500エラーを誘発する。
      throw new Error(`Failed to retrieve keyword '${name}' after insert race condition.`);
    }
    // その他のエラー、または極めて稀なケース（挿入失敗後、再検索でも見つからない）
    throw error;
  }
};

const db = getDb();
const selectBookmarkStmt = db.prepare("SELECT 1 FROM bookmarks WHERE bookmark_id = ?");
const selectKeywordStmt = db.prepare(
  "SELECT keyword_id, keyword_name FROM keywords WHERE keyword_name = ?"
);
const insertKeywordStmt = db.prepare("INSERT INTO keywords (keyword_name) VALUES (?)");
const insertBookmarkKeywordStmt = db.prepare(
  "INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (?, ?)"
);

type PostParams = {
  params: {
    bookmark_id: string;
  };
};

export async function POST(request: Request, { params }: PostParams) {
  let bookmarkId: number;
  try {
    bookmarkId = validateId(params.bookmark_id);
  } catch {
    return createInvalidIdError({ id: params.bookmark_id });
  }

  let keywordName: string;
  try {
    const payload = await request.json();
    const rawKeyword = payload?.keyword_name;
    if (typeof rawKeyword !== "string" || rawKeyword.trim() === "") {
      return createNoKeywordError();
    }
    keywordName = rawKeyword.trim();
  } catch (error) {
    return createInvalidBodyError(error instanceof Error ? error : new Error(String(error)));
  }
  try {
    const runInTransaction = db.transaction(() => {
      const bookmark = selectBookmarkStmt.get(bookmarkId);
      if (!bookmark) {
        throw new BookmarkNotFoundError();
      }

      const keywordId = getOrCreateKeyword(keywordName);
      const insertResult = insertBookmarkKeywordStmt.run(bookmarkId, keywordId);

      return {
        keyword_id: keywordId,
        bookmark_keyword_id: Number(insertResult.lastInsertRowid),
        keyword_name: keywordName,
      };
    });

    const result = runInTransaction.immediate();
    return new Response(
      JSON.stringify({ message: "キーワードをブックマークに追加しました。", ...result }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    // BookmarkNotFoundErrorはカスタムエラーなので、他のエラーより先にチェック
    if (error instanceof BookmarkNotFoundError) {
      return createNotFoundBookmarkError(bookmarkId.toString());
    }
    if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return createDuplicateKeywordAssociationError(bookmarkId, keywordName);
    }
    return createInternalError(error instanceof Error ? error : new Error(String(error)));
  }
}
