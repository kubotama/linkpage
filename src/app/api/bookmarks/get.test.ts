import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../test-utils/assertions";
import { expectEqualBookmark, mockBookmarks } from "../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../test-utils/db-setup";
import { ErrorTestCase } from "../utils/types";
import { getDb } from "./database";
import { GET } from "./route";

vi.mock("./database");

let inMemoryDbInstance: ActualDatabase.Database;

describe("ブックマークのAPIのテスト", () => {
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
    const response = await GET();

    expect(response.status).toBe(HTTP_STATUS_OK);
    const json = await response.json();

    expect(json).toHaveLength(mockBookmarks.length);

    mockBookmarks.forEach((bookmark, index) => {
      expectEqualBookmark(json[index], bookmark);
    });
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

    const errorTestCases: ErrorTestCase<null>[] = [
      {
        description: "データベースエラー時に500エラーを返す",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: Database connection failed",
        body: null,
        setup: () => {
          // getDbをモックして、データベースエラーを発生させる
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
        body: null,
        setup: () => {
          // prepareメソッドをモックしてクエリエラーを発生させる
          vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
            throw new Error("Failed to execute query");
          });
        },
      },
    ];

    it.each(errorTestCases)(
      "$description",
      async ({ setup, statusCode, errorMessage, logMessage }) => {
        if (setup) {
          setup();
        }
        const response = await GET();
        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );
  });
});
