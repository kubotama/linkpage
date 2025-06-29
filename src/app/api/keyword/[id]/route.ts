"use server";
import { SqliteError } from "better-sqlite3";

import { getDb } from "../../bookmark/database";
import { createErrorResponse } from "../../utils/response";

export const DELETE = async (
  _request: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const id = params.id;
  if (!id || isNaN(Number(id))) {
    return createErrorResponse("不正なIDです。", 400);
  }
  try {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM keywords WHERE keyword_id = ?");
    const result = stmt.run(Number(id));
    if (result.changes === 0) {
      return createErrorResponse("指定されたキーワードが見つかりません。", 404);
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof SqliteError) {
      return createErrorResponse(
        "データベースエラーが発生しました。",
        500,
        String(error)
      );
    }
    return createErrorResponse(
      "サーバー内部でエラーが発生しました。",
      500,
      String(error)
    );
  }
};
