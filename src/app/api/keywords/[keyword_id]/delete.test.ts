import ActualDatabase from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_NOT_FOUND,
} from "../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../test-utils/assertions";
import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { getDb } from "../../bookmarks/database";
import { API_KEYWORDS_URL } from "../../utils/constants";
import { DELETE } from "./route";

vi.mock("../../bookmarks/database");

let inMemoryDbInstance: ActualDatabase.Database;

const createDeleteRequest = (
  keyword_id: string
): [Request, { params: Promise<{ keyword_id: string }> }] => {
  return [
    new Request(API_KEYWORDS_URL, { method: "DELETE" }),
    { params: Promise.resolve({ keyword_id: keyword_id }) },
  ];
};

describe("キーワードDELETE APIのテスト", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    inMemoryDbInstance = setupInMemoryDb();
    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  it("DELETE: 正常にキーワードが削除できる", async () => {
    const [req, ctx] = createDeleteRequest("1");
    const response = await DELETE(req, ctx);
    expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);
    // 削除後にもう一度削除を試みると404になることを確認
    const response2 = await DELETE(req, ctx);
    await assertErrorResponse(
      response2,
      HTTP_STATUS_NOT_FOUND,
      "指定されたキーワードが見つかりません。"
    );
  });

  it("DELETE: 存在しないIDの場合404を返す", async () => {
    const [req, ctx] = createDeleteRequest("9999");
    const response = await DELETE(req, ctx);
    await assertErrorResponse(
      response,
      HTTP_STATUS_NOT_FOUND,
      "指定されたキーワードが見つかりません。"
    );
  });

  it("DELETE: 不正なIDの場合400を返す", async () => {
    const [req, ctx] = createDeleteRequest("abc");
    const response = await DELETE(req, ctx);
    await assertErrorResponse(
      response,
      HTTP_STATUS_BAD_REQUEST,
      "IDは正の整数である必要があります。"
    );
  });

  it("DELETE: DBエラー時は500を返す", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("DB error");
    });
    const [req, ctx] = createDeleteRequest("1");
    const response = await DELETE(req, ctx);
    await assertErrorResponse(
      response,
      HTTP_STATUS_INTERNAL_SERVER_ERROR,
      "サーバー内部でエラーが発生しました。"
    );
  });
});
