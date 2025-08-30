import ActualDatabase from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

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

const createDeleteRequest = (
  keyword_id: string
): [Request, { params: Promise<{ keyword_id: string }> }] => {
  return [
    new Request(API_KEYWORDS_URL, { method: "DELETE" }),
    { params: Promise.resolve({ keyword_id: keyword_id }) },
  ];
};

describe("キーワードDELETE APIのテスト", () => {
  let inMemoryDbInstance: ActualDatabase.Database;

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
    const keywordId = "1";
    const [req, ctx] = createDeleteRequest(keywordId);
    const response = await DELETE(req, ctx);
    expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);

    // データベースから削除されたことを確認
    const stmt = inMemoryDbInstance.prepare("SELECT keyword_id FROM keywords WHERE keyword_id = ?");
    const dbData = stmt.get(keywordId);
    expect(dbData).toBeUndefined();
  });

  describe("エラーログが出力される場合のテスト", () => {
    let consoleErrorSpy: MockInstance;
    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    const setupErrorCases = [
      {
        description: "削除済みのIDで再度削除しようした場合",
        keywordId: "1",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたキーワードが見つかりません。",
        logMessage: "Keyword with id: 1 not found.",
        setup: async (keywordId: string) => {
          const [req, ctx] = createDeleteRequest(keywordId);
          await DELETE(req, ctx); // 1回目の削除 (keywordId "1" を使用)
        },
      },
      {
        description: "存在しないIDを指定した場合",
        keywordId: "9999",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたキーワードが見つかりません。",
        logMessage: "Keyword with id: 9999 not found.",
        setup: undefined,
      },
      {
        description: "不正なIDを指定した場合",
        keywordId: "abc",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "IDは正の整数である必要があります。",
        logMessage: "Invalid ID provided: abc. It must be a positive integer.",
        setup: undefined,
      },
    ];

    it.each(setupErrorCases)(
      `$descriptionに$statusCodeでエラーメッセージが返る`,
      async ({ setup, keywordId, statusCode, errorMessage, logMessage }) => {
        if (setup) {
          await setup(keywordId);
        }
        const [req, ctx] = createDeleteRequest(keywordId);
        const response = await DELETE(req, ctx);
        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );

    // DBエラーのテストケースを分離する
    it("DBエラーが発生した場合に500エラーが返る", async () => {
      const getDbSpy = vi.mocked(getDb).mockImplementation(() => {
        throw new Error("DB error");
      });

      try {
        const [req, ctx] = createDeleteRequest("1");
        const response = await DELETE(req, ctx);
        await assertErrorResponse(
          response,
          HTTP_STATUS_INTERNAL_SERVER_ERROR,
          "サーバー内部でエラーが発生しました。"
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith("Internal Server Error: DB error");
      } finally {
        getDbSpy.mockRestore();
      }
    });
  });
});
