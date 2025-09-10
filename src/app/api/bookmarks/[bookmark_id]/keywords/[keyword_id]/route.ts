"use server";

import { HTTP_STATUS_NO_CONTENT } from "../../../../../constants/httpStatusCodes";
import {
  getBookmarkIdAsync,
  getKeywordIdAsync,
  InvalidIdError,
  NotExistBookmarkError,
  NotExistKeywordError,
} from "../../../../utils/id";
import {
  createInternalError,
  createInvalidIdError,
  createNoBookmarkError,
  createNoKeywordError,
  createNotAssignedKeywordError,
} from "../../../../utils/response";
import { getDb } from "../../../database";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ bookmark_id?: string; keyword_id?: string }> }
) {
  try {
    const bookmarkId = await getBookmarkIdAsync({ params });
    const keywordId = await getKeywordIdAsync({ params });
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
      return createInvalidIdError({ id: error.invalidId || "undefined" });
    }
    if (error instanceof NotExistBookmarkError) {
      return createNoBookmarkError();
    }
    if (error instanceof NotExistKeywordError) {
      return createNoKeywordError();
    }
    return createInternalError(error);
  }
}
