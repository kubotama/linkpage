import { SqliteError } from "better-sqlite3";

import { isKeyword } from "../../../../types/Keyword";
import { getId } from "../../../utils/id";
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
  `INSERT INTO keywords (keyword_name) VALUES (?)
   ON CONFLICT(keyword_name) DO UPDATE SET keyword_name = excluded.keyword_name
   RETURNING keyword_id, keyword_name`
);

type PostParams = {
  params: Promise<{ bookmark_id: string }>;
};

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

export async function POST(request: Request, { params }: PostParams) {
  let bookmarkId: number;
  const { bookmark_id } = await params;
  try {
    bookmarkId = Number(getId({ id: bookmark_id }));
  } catch {
    return createInvalidIdError({ id: bookmark_id });
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
      const bookmarkKeywordRowid = insertResult.lastInsertRowid;
      if (bookmarkKeywordRowid > BigInt(Number.MAX_SAFE_INTEGER)) {
        // JSONはbigintをサポートしておらず、このIDはnumberとして安全に表現するには大きすぎます。
        // 破損したIDを返すよりも、エラーをスローする方が安全です。
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
