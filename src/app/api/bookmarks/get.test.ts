import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../test-utils/assertions";
import { expectEqualBookmark, mockBookmarks } from "../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../test-utils/db-setup";
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

  it("GET: データベースエラー時に500エラーを返す", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(getDb).mockImplementation(() => {
      throw dbError;
    });

    const response = await GET();
    await assertErrorResponse(
      response,
      HTTP_STATUS_INTERNAL_SERVER_ERROR,
      "サーバー内部でエラーが発生しました。"
    );
  });

  it("GET: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
      throw queryError;
    });

    const response = await GET();
    await assertErrorResponse(
      response,
      HTTP_STATUS_INTERNAL_SERVER_ERROR,
      "サーバー内部でエラーが発生しました。"
    );

    prepareSpy.mockRestore();
  });
});
