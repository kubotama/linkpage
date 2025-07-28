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

  let payload: { keyword_name: string };
  try {
    payload = await request.json();
    if (typeof payload?.keyword_name !== "string" || payload.keyword_name.trim() === "") {
      return createNoKeywordError();
    }
  } catch (error) {
    return createInvalidBodyError(error as Error);
  }
  const keywordName = payload.keyword_name.trim();
  const db = getDb();

  try {
    const selectBookmarkStmt = db.prepare("SELECT 1 FROM bookmarks WHERE bookmark_id = ?");
    const selectKeywordStmt = db.prepare("SELECT keyword_id FROM keywords WHERE keyword_name = ?");
    const insertKeywordStmt = db.prepare("INSERT INTO keywords (keyword_name) VALUES (?)");
    const insertBookmarkKeywordStmt = db.prepare(
      "INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (?, ?)"
    );

    const runInTransaction = db.transaction(() => {
      const bookmark = selectBookmarkStmt.get(bookmarkId);
      if (!bookmark) {
        throw new BookmarkNotFoundError();
      }

      const keywordResult = selectKeywordStmt.get(keywordName);
      let keywordId: number;
      // Check if a result was found and if it has the expected property
      if (keywordResult && typeof keywordResult === "object" && "keyword_id" in keywordResult) {
        keywordId = (keywordResult as { keyword_id: number }).keyword_id;
      } else {
        // If no keyword found or it doesn't have the expected shape, insert a new one
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
