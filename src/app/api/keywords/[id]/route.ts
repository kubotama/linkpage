"use server";

import { getDb } from "../../bookmarks/database";
import { getIdAsync, InvalidIdError } from "../../utils/id";
import {
  createInternarlError,
  createInvalidIdError,
  createNotFoundKeywordError,
} from "../../utils/response";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  try {
    const id = await getIdAsync({ params });
    const db = getDb();
    const stmt = db.prepare("DELETE FROM keywords WHERE keyword_id = ?");
    const result = stmt.run(Number(id));
    if (result.changes === 0) {
      return createNotFoundKeywordError(id);
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof InvalidIdError) {
      return createInvalidIdError(await params);
    }
    return createInternarlError(error);
  }
};
