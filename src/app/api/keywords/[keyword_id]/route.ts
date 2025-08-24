"use server";

import { getDb } from "../../bookmarks/database";
import { getKeywordIdAsync, InvalidIdError } from "../../utils/id";
import {
  createInternalError,
  createInvalidIdError,
  createNotFoundKeywordError,
} from "../../utils/response";
import { HTTP_STATUS_NO_CONTENT } from "../../../constants/httpStatusCodes";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ keyword_id: string }> }
): Promise<Response> => {
  try {
    const keyword_id = await getKeywordIdAsync({ params });
    const db = getDb();
    const stmt = db.prepare("DELETE FROM keywords WHERE keyword_id = ?");
    const result = stmt.run(keyword_id);
    if (result.changes === 0) {
      return createNotFoundKeywordError(keyword_id);
    }
    return new Response(null, { status: HTTP_STATUS_NO_CONTENT });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError({ id: (await params).keyword_id });
    }
    return createInternalError(error);
  }
};
