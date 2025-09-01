import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../test-utils/assertions";
import { mockKeywords } from "../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../test-utils/db-setup";
import { getDb } from "../bookmarks/database";
import { GET } from "./route";

vi.mock("../bookmarks/database");

let inMemoryDbInstance: ActualDatabase.Database;

describe("キーワードGET APIのテスト", () => {
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

  it("GET: キーワードのデータが取得できる", async () => {
    const response = await GET();

    expect(response.status).toBe(HTTP_STATUS_OK);
    const json = await response.json();
    expect(json).toEqual(mockKeywords);
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

    const errorTestCases = [
      {
        description: "データベースエラー時に500エラーを返す",
        setup: () => {
          const errorMessage = "Database connection failed";
          // getDbをモックして、データベースエラーを発生させる
          vi.mocked(getDb).mockImplementation(() => {
            throw new Error(errorMessage);
          });
          return errorMessage;
        },
      },
      {
        description: "クエリエラー時に500エラーを返す",
        setup: () => {
          const errorMessage = "Failed to execute query";
          // prepareメソッドをモックしてクエリエラーを発生させる
          vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
            throw new Error(errorMessage);
          });
          return errorMessage;
        },
      },
    ];

    it.each(errorTestCases)("$description", async ({ setup }) => {
      const errorMessage = setup();
      const response = await GET();

      await assertErrorResponse(
        response,
        HTTP_STATUS_INTERNAL_SERVER_ERROR,
        "サーバー内部でエラーが発生しました。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Internal Server Error: ${errorMessage}`);
    });
  });
});
