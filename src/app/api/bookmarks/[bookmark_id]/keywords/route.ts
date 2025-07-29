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

class BookmarkNotFoundError extends Error {}

const db = getDb();
const selectBookmarkStmt = db.prepare("SELECT 1 FROM bookmarks WHERE bookmark_id = ?");
const selectKeywordStmt = db.prepare("SELECT keyword_id FROM keywords WHERE keyword_name = ?");
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
    return createInvalidBodyError(error as Error);
  }
  try {
    const runInTransaction = db.transaction(() => {
      const bookmark = selectBookmarkStmt.get(bookmarkId);
      if (!bookmark) {
        throw new BookmarkNotFoundError();
      }

      const keywordResult = selectKeywordStmt.get(keywordName) as
        | { keyword_id: number }
        | undefined;
      let keywordId: number;
      if (keywordResult) {
        keywordId = keywordResult.keyword_id;
      } else {
        const result = insertKeywordStmt.run(keywordName);
        keywordId = Number(result.lastInsertRowid);
      }
      const insertResult = insertBookmarkKeywordStmt.run(bookmarkId, keywordId);

      return {
        keyword_id: keywordId,
        bookmark_keyword_id: Number(insertResult.lastInsertRowid),
        keyword_name: keywordName,
      };
    });

    const result = runInTransaction();
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
