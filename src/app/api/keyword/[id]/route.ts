"use server";

import { getDb } from "../../bookmark/database";
import { createErrorResponse } from "../../utils/response";

export const DELETE = async (
  _request: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const id = params.id;
  if (!id || isNaN(Number(id))) {
    return createErrorResponse("不正なIDです。", 400, `Invalid ID: ${id}`);
  }
  try {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM keywords WHERE keyword_id = ?");
    const result = stmt.run(Number(id));
    if (result.changes === 0) {
      return createErrorResponse(
        "指定されたキーワードが見つかりません。",
        404,
        `Keyword with id: ${id} not found.`
      );
    }
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    return createErrorResponse(
      "サーバー内部でエラーが発生しました。",
      500,
      `Internal Server Error: ${(error as Error).message}`
    );
  }
};
