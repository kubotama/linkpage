"use server";

import { getDb } from "../../bookmarks/database";
import { getKeywordIdAsync, InvalidIdError } from "../../utils/id";
import {
  createInternalError,
  createInvalidIdError,
  createNotFoundKeywordError,
} from "../../utils/response";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ keyword_id: string }> }
): Promise<Response> => {
  try {
    const id = await getKeywordIdAsync({ params });
    const db = getDb();
    const stmt = db.prepare("DELETE FROM keywords WHERE keyword_id = ?");
    const result = stmt.run(id);
    if (result.changes === 0) {
      return createNotFoundKeywordError(id);
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError({ id: (await params).keyword_id });
    }
    return createInternalError(error);
  }
};
