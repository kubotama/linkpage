import { SqliteError } from "better-sqlite3";

import { HTTP_STATUS_CREATED, HTTP_STATUS_NO_CONTENT } from "../../../../constants/httpStatusCodes";
import { isKeyword, KeywordPostParams } from "../../../../types/Keyword";
import { getBookmarkIdAsync, getId, InvalidIdError } from "../../../utils/id";
import {
  createDuplicateKeywordAssociationError,
  createInternalError,
  createInvalidBodyError,
  createInvalidIdError,
  createNoKeywordError,
  createNotAssignedKeywordError,
  createNotFoundBookmarkError,
} from "../../../utils/response";
import { getDb } from "../../database";

class BookmarkNotFoundError extends Error {}

const db = getDb();
const selectBookmarkStmt = db.prepare("SELECT 1 FROM bookmarks WHERE bookmark_id = ?");
const insertBookmarkKeywordStmt = db.prepare(
  "INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (?, ?)"
);
const upsertKeywordStmt = db.prepare(
  `INSERT INTO keywords (keyword_name) VALUES (?)
   ON CONFLICT(keyword_name) DO UPDATE SET keyword_name = excluded.keyword_name
   RETURNING keyword_id, keyword_name`
);

const getOrCreateKeyword = (name: string): number => {
  // upsert文は、新規・既存両方のキーワードに対してkeyword_idを返すため、
  // この処理は単一のアトミックなDB呼び出しで完結します。
  const result: unknown = upsertKeywordStmt.get(name);
  if (isKeyword(result)) {
    return Number(result.keyword_id);
  }
  // クエリが正しく、RETURNINGがサポートされていれば、このパスには到達しないはずです。
  // 安全策として残しています。
  throw new Error(`Failed to get or create keyword '${name}'.`);
};

export async function POST(request: Request, { params }: KeywordPostParams) {
  let bookmark_id: string;
  try {
    // Next.jsが提供するparamsのPromiseを解決する
    ({ bookmark_id } = await params);
  } catch (error) {
    // paramsのPromiseがリジェクトされるという稀なケースをハンドル
    console.error("Failed to resolve route params:", error);
    return createInternalError(new Error("Failed to resolve route params"));
  }

  let bookmarkId: number;
  try {
    // IDの検証
    bookmarkId = getId({ id: bookmark_id });
  } catch (error) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError({ id: bookmark_id });
    }
    return createInternalError(error);
  }

  let keywordName: string;
  try {
    // リクエストボディの検証
    const payload = await request.json();
    const rawKeyword = payload?.keyword_name;
    if (typeof rawKeyword !== "string" || rawKeyword.trim() === "") {
      return createNoKeywordError();
    }
    keywordName = rawKeyword.trim();
  } catch (error) {
    // JSONパースエラーなど
    return createInvalidBodyError(error);
  }

  // DB操作
  try {
    const runInTransaction = db.transaction(() => {
      const bookmark = selectBookmarkStmt.get(bookmarkId);
      if (!bookmark) {
        throw new BookmarkNotFoundError();
      }
      const keywordId = getOrCreateKeyword(keywordName);
      const insertResult = insertBookmarkKeywordStmt.run(bookmarkId, keywordId);
      const bookmarkKeywordRowid = insertResult.lastInsertRowid;
      if (bookmarkKeywordRowid > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error(`Generated bookmark_keyword_id is too large: ${bookmarkKeywordRowid}`);
      }
      return {
        keyword_id: keywordId,
        bookmark_keyword_id: Number(bookmarkKeywordRowid),
        keyword_name: keywordName,
      };
    });
    const result = runInTransaction.immediate();
    return new Response(
      JSON.stringify({ message: "キーワードをブックマークに追加しました。", ...result }),
      { status: HTTP_STATUS_CREATED, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    if (error instanceof BookmarkNotFoundError) {
      return createNotFoundBookmarkError(bookmarkId);
    }
    if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return createDuplicateKeywordAssociationError(bookmarkId, keywordName);
    }
    return createInternalError(error);
  }
}

export const DELETE = async (request: Request, { params }: KeywordPostParams) => {
  let keywordIdFromRequest: string | undefined;
  try {
    let bookmarkId: number;
    try {
      bookmarkId = await getBookmarkIdAsync({ params });
    } catch (error) {
      if (error instanceof InvalidIdError) {
        return createInvalidIdError({ id: (await params).bookmark_id });
      }
      throw error; // その他の予期せぬエラーは再スロー
    }

    const payload = await request.json();
    // リクエストボディとkeyword_idの存在・型チェック
    if (!payload || !payload.keyword_id) {
      return createNoKeywordError();
    }
    if (typeof payload.keyword_id !== "number") {
      return createInvalidIdError({ id: payload.keyword_id });
    }
    keywordIdFromRequest = String(payload.keyword_id);
    const keywordId = getId({ id: payload.keyword_id });

    // DB操作
    const db = getDb();
    const prepare = db.prepare(
      "DELETE FROM bookmark_keywords WHERE bookmark_id = ? and keyword_id = ?"
    );
    const info = prepare.run(bookmarkId, keywordId);

    if (info.changes === 0) {
      return createNotAssignedKeywordError(bookmarkId, keywordId);
    }

    return new Response(null, { status: HTTP_STATUS_NO_CONTENT });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      // bookmark_id または keyword_id の検証エラー
      // keywordIdFromRequestがセットされていればkeyword_idのエラーと判断
      return createInvalidIdError({ id: keywordIdFromRequest || "" });
    }
    return createInternalError(error);
  }
};
