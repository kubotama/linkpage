import { SqliteError } from "better-sqlite3";
import { NextRequest } from "next/server";

import { getDb } from "../../database";
import {
  createNotFoundBookmarkError,
  createErrorResponse,
  createInternalError,
  createInvalidBodyError,
  createInvalidIdError,
  createNoKeywordError,
} from "../../../utils/response";
import { validateId } from "../../../utils/validator";

type PostParams = {
  params: {
    bookmark_id: string;
  };
};

const createDuplicateKeywordAssociationError = (bookmarkId: number, keywordName: string) => {
  return createErrorResponse(
    "指定されたキーワードは既にこのブックマークに登録されています。",
    409,
    `Keyword "${keywordName}" is already associated with bookmark id: ${bookmarkId}.`
  );
};

export async function POST(request: NextRequest, { params }: PostParams) {
  let bookmarkId: number;
  try {
    bookmarkId = validateId(params.bookmark_id);
  } catch (error) {
    console.error(error);
    return createInvalidIdError({ id: params.bookmark_id });
  }

  let payload: { keyword_name: string };
  try {
    payload = await request.json();
    if (
      !payload.keyword_name ||
      typeof payload.keyword_name !== "string" ||
      payload.keyword_name.trim() === ""
    ) {
      return createNoKeywordError();
    }
  } catch (error) {
    return createInvalidBodyError(error as Error);
  }

  const keywordName = payload.keyword_name.trim();
  const db = getDb();

  try {
    const bookmark = db
      .prepare("SELECT bookmark_id FROM bookmarks WHERE bookmark_id = ?")
      .get(bookmarkId);
    if (!bookmark) {
      return createNotFoundBookmarkError(bookmarkId.toString());
    }

    const runInTransaction = db.transaction(() => {
      const keyword: { keyword_id: number } | undefined = db
        .prepare("SELECT keyword_id FROM keywords WHERE keyword_name = ?")
        .get(keywordName) as { keyword_id: number } | undefined;

      let keywordId: number;

      if (keyword) {
        keywordId = keyword.keyword_id;
      } else {
        const result = db
          .prepare("INSERT INTO keywords (keyword_name) VALUES (?)")
          .run(keywordName);
        keywordId = result.lastInsertRowid as number;
      }

      const insertResult = db
        .prepare("INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (?, ?)")
        .run(bookmarkId, keywordId);

      return {
        keyword_id: keywordId,
        bookmark_keyword_id: insertResult.lastInsertRowid,
        keyword_name: keywordName,
      };
    });

    const result = runInTransaction();

    return new Response(
      JSON.stringify({ message: "キーワードをブックマークに追加しました。", ...result }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return createDuplicateKeywordAssociationError(bookmarkId, keywordName);
    }
    return createInternalError(error);
  }
}
