import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
} from "../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../test-utils/assertions";
import { expectEqualBookmark, GOOGLE_BOOKMARK } from "../../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { API_BOOKMARKS_URL } from "../../utils/constants";
import { ErrorTestCase } from "../../utils/types";
import { getDb } from "../database";
import { GET } from "./route";

vi.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const createGetRequest = (
  bookmark_id: string
): [Request, { params: Promise<{ bookmark_id: string }> }] => {
  return [
    new Request(`${API_BOOKMARKS_URL}${bookmark_id}`, { method: "Get" }),
    { params: Promise.resolve({ bookmark_id: bookmark_id.toString() }) },
  ];
};

describe("ブックマークを1件取得するAPIのテスト", () => {
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

  it("GET: ブックマークのデータが取得できる", async () => {
    const targetBookmark = GOOGLE_BOOKMARK;
    const [request, context] = createGetRequest(targetBookmark.bookmark_id.toString());
    const response = await GET(request, context);

    expect(response.status).toBe(HTTP_STATUS_OK);
    const json = await response.json();

    expectEqualBookmark(json, targetBookmark);
  });

  describe("GET: エラーログが出力される場合のテスト", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const errorTestCases: ErrorTestCase<string>[] = [
      {
        description: "不正なIDの場合400エラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "IDは正の整数である必要があります。",
        logMessage: "Invalid ID provided: abc. It must be a positive integer.",
        body: "abc",
      },
      {
        description: "存在しないIDの場合404エラーを返す",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたブックマークがありません。",
        logMessage: "Bookmark with id: 100 not found.",
        body: "100",
      },
      {
        description: "データベース接続エラーの場合500エラーを返す",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: Database connection failed",
        body: "1",
        setup: () => {
          vi.mocked(getDb).mockImplementation(() => {
            throw new Error("Database connection failed");
          });
        },
      },
      {
        description: "クエリエラー時に500エラーを返す",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: Failed to execute query",
        body: "1",
        setup: () => {
          vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
            throw new Error("Failed to execute query");
          });
        },
      },
    ];

    it.each(errorTestCases)(
      "$description",
      async ({ setup, body, statusCode, errorMessage, logMessage }) => {
        if (setup) {
          setup();
        }

        const [request, context] = createGetRequest(body);
        const response = await GET(request, context);

        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );
  });
});
