import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from "../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../test-utils/assertions";
import { mockKeywords } from "../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../test-utils/db-setup";
import { getDb } from "../bookmarks/database";
import { API_KEYWORDS_URL } from "../utils/constants";
import { ErrorTestCase } from "../utils/types";
import { POST } from "./route";

vi.mock("../bookmarks/database");

let inMemoryDbInstance: ActualDatabase.Database;

const createPostRequest = (keyword_name: string): Request => {
  return new Request(API_KEYWORDS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword_name: keyword_name,
    }),
  });
};

describe("キーワードAPIのテスト", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    inMemoryDbInstance = setupInMemoryDb();

    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  it("POST: キーワードを追加に成功して201 Createdを返す", async () => {
    const keyword_name = "テスト";
    const response = await POST(createPostRequest(keyword_name));

    expect(response.status).toBe(HTTP_STATUS_CREATED);
    const json = await response.json();
    expect(json).toEqual({
      keyword_id: expect.any(Number),
      keyword_name: keyword_name,
    });

    // Verify data in the in-memory database
    const stmt = inMemoryDbInstance.prepare(
      "SELECT keyword_id, keyword_name FROM keywords WHERE keyword_id = ?"
    );
    const dbData = stmt.get(json.keyword_id); // json.id comes from the response (lastInsertRowid)
    expect(dbData).toEqual({
      keyword_id: json.keyword_id,
      keyword_name: keyword_name,
    });
  });

  it("POST: キーワードが空文字の場合は400を返す", async () => {
    const response = await POST(createPostRequest(""));

    await assertErrorResponse(response, HTTP_STATUS_BAD_REQUEST, "キーワードを指定してください。");
  });

  describe("POST: エラーログが出力される場合のテスト", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const invalidRequestTestCases: ErrorTestCase<string>[] = [
      {
        description: "不正なJSONデータ(JSON.parseエラー)",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        body: "invalid json",
        errorMessage: "リクエストボディのJSONが不正です。",
        logMessage: expect.stringContaining("Invalid JSON format: Unexpected token"),
      },
      {
        description: "不正なJSONデータ(null)",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        body: JSON.stringify(null),
        errorMessage: "リクエストボディのJSONが不正です。",
        logMessage: "Invalid JSON format: リクエストボディのJSONが不正です。",
      },
      {
        description: "重複したキーワードを追加",
        statusCode: HTTP_STATUS_CONFLICT,
        body: JSON.stringify({
          keyword_name: mockKeywords[0].keyword_name,
        }),
        errorMessage: "指定されたキーワードは既に登録されています。",
        logMessage: 'Keyword with "キーワード1" already exists.',
      },
      {
        description: "データベースエラーが発生した場合",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ keyword_name: "テスト" }),
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: Failed to execute query",
        setup: () => {
          vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
            throw new Error("Failed to execute query");
          });
        },
      },
    ];

    it.each(invalidRequestTestCases)(
      `キーワードが$descriptionの場合は$statusCodeを返す`,
      async ({ statusCode, body, errorMessage, logMessage, setup }) => {
        if (setup) {
          setup();
        }
        const response = await POST(
          new Request(API_KEYWORDS_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body,
          })
        );
        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );
  });
});
