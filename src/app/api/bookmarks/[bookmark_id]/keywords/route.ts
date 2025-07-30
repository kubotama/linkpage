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
const insertKeywordStmt = db.prepare("INSERT OR IGNORE INTO keywords (keyword_name) VALUES (?)");
const insertBookmarkKeywordStmt = db.prepare(
  "INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (?, ?)"
);

type PostParams = {
  params: {
    bookmark_id: string;
  };
};

const getOrCreateKeyword = (name: string): number => {
  // キーワードが存在しない場合のみ挿入する。存在する場合は何もしない。
  insertKeywordStmt.run(name);

  // この時点でキーワードは確実に存在するため、SELECTで取得する。
  const keyword = selectKeywordStmt.get(name);

  if (isKeyword(keyword)) {
    return keyword.keyword_id;
  }

  // 通常このパスには到達しないはず。到達した場合は予期せぬエラーとしてスローする。
  throw new Error(`Failed to retrieve keyword '${name}' after insert-or-ignore.`);
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
