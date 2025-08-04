import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockKeywords);
  });

  it("GET: データベースエラー時に500エラーを返す", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(getDb).mockImplementation(() => {
      throw dbError;
    });

    const response = await GET();
    await assertErrorResponse(response, 500, "サーバー内部でエラーが発生しました。");
  });

  it("GET: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
      throw queryError;
    });

    const response = await GET();
    await assertErrorResponse(response, 500, "サーバー内部でエラーが発生しました。");

    prepareSpy.mockRestore();
  });
});
