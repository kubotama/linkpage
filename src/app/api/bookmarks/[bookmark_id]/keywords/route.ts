import { SqliteError } from "better-sqlite3";

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
const insertBookmarkKeywordStmt = db.prepare(
  "INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (?, ?)"
);
const upsertKeywordStmt = db.prepare(
  "INSERT INTO keywords (keyword_name) VALUES (?) ON CONFLICT(keyword_name) DO UPDATE SET keyword_name = excluded.keyword_name RETURNING keyword_id"
);

type PostParams = {
  params: {
    bookmark_id: string;
  };
};

const getOrCreateKeyword = (name: string): number => {
  // upsert文は、新規・既存両方のキーワードに対してkeyword_idを返すため、
  // この処理は単一のアトミックなDB呼び出しで完結します。
  const result = upsertKeywordStmt.get(name) as { keyword_id: number } | undefined;

  if (result) {
    return result.keyword_id;
  }

  // クエリが正しく、RETURNINGがサポートされていれば、このパスには到達しないはずです。
  // 安全策として残しています。
  throw new Error(`Failed to get or create keyword '${name}'.`);
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
