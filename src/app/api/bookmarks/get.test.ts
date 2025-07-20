import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  expectEqualBookmark,
  mockBookmarks,
  mockBookmarkKeywords,
  mockKeywords,
} from "../../test-utils/bookmarkTestUtils";
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

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json).toHaveLength(mockBookmarks.length);
    // Helper to construct expected keywords for each bookmark
    const getExpectedKeywords = (bookmarkId: number) => {
      const associatedKeywordIds = mockBookmarkKeywords
        .filter((bk) => bk.bookmark_id === bookmarkId)
        .map((bk) => bk.keyword_id);
      return associatedKeywordIds.map((id) => {
        const keyword = mockKeywords.find((k) => k.keyword_id === id);
        if (!keyword) {
          throw new Error(
            `Test data inconsistency: Keyword with id ${id} not found in mockKeywords.`
          );
        }
        return keyword;
      });
    };
    const expectedBookmarks = mockBookmarks.map((bookmark) => ({
      ...bookmark,
      keywords: getExpectedKeywords(bookmark.bookmark_id),
    }));
    // Sort both actual and expected arrays by bookmark_id for consistent comparison
    const sortedJson = [...json].sort(
      (a: { bookmark_id: number }, b: { bookmark_id: number }) => a.bookmark_id - b.bookmark_id
    );
    const sortedExpected = [...expectedBookmarks].sort(
      (a: { bookmark_id: number }, b: { bookmark_id: number }) => a.bookmark_id - b.bookmark_id
    );
    sortedExpected.forEach((expectedBookmark, index) => {
      expectEqualBookmark(sortedJson[index], expectedBookmark);
    });
  });

  it("GET: データベースエラー時に500エラーを返す", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(getDb).mockImplementation(() => {
      throw dbError;
    });

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.json();
    expect(text.message).toEqual("サーバー内部でエラーが発生しました。");
  });

  it("GET: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
      throw queryError;
    });

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.json();
    expect(text.message).toEqual("サーバー内部でエラーが発生しました。");

    prepareSpy.mockRestore();
  });
});
