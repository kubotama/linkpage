import { SqliteError } from "better-sqlite3";

import { isKeyword } from "../../../../types/Keyword";
import { getId, InvalidIdError } from "../../../utils/id";
import {
  createDuplicateKeywordAssociationError,
  createInternalError,
  createInvalidBodyError,
  createInvalidIdError,
  createNoKeywordError,
  createNotFoundBookmarkError,
} from "../../../utils/response";
import { getDb } from "../../database";

class BookmarkNotFoundError extends Error {}

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
    // Handle the case where another request has already inserted the keyword due to a race condition
    if (!(error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE")) {
      // If it's not a SQLITE_CONSTRAINT_UNIQUE error, it's an unexpected error, so re-throw it
      throw error;
    }

    // If a conflict occurred during INSERT, another request should have already inserted the keyword, so retrieve the ID again
    const keywordAfterRace = selectKeywordStmt.get(name);
    if (isKeyword(keywordAfterRace)) {
      return keywordAfterRace.keyword_id;
    }

    // The keyword that should have been inserted due to the race condition wasn't found.
    // This is an unexpected state, so throw a new error instead of the original to trigger a 500 error.
    throw new Error(`Failed to retrieve keyword '${name}' after insert race condition.`);
  }
};

export async function POST(request: Request, { params }: PostParams) {
  let bookmarkId: number;
  try {
    bookmarkId = Number(getId({ id: params.bookmark_id }));
  } catch (error) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError({ id: params.bookmark_id });
    }
    return createInternalError(error);
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
    return createInvalidBodyError(error);
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
    return createInternalError(error);
  }
}
