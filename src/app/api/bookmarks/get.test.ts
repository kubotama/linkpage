import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockBookmarks } from "../../test-utils/bookmarkTestUtils";
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

    expect(json).toHaveLength(4);

    const bookmark1 = json.find((b: { bookmark_id: number }) => b.bookmark_id === 1);
    expect(bookmark1).toEqual(expect.objectContaining({ ...mockBookmarks[0], keywords: [] }));

    const bookmark2 = json.find((b: { bookmark_id: number }) => b.bookmark_id === 2);
    expect(bookmark2).toEqual(expect.objectContaining({ ...mockBookmarks[1] }));
    expect(bookmark2.keywords).toHaveLength(2);
    expect(bookmark2.keywords).toEqual(
      expect.arrayContaining([
        {
          keyword_id: 1,
          keyword_name: "キーワード1",
        },
        {
          keyword_id: 2,
          keyword_name: "キーワード2",
        },
      ])
    );

    const bookmark3 = json.find((b: { bookmark_id: number }) => b.bookmark_id === 3);
    expect(bookmark3).toEqual(
      expect.objectContaining({
        ...mockBookmarks[2],
        keywords: [
          {
            keyword_id: 3,
            keyword_name: "キーワード3",
          },
        ],
      })
    );

    const bookmark4 = json.find((b: { bookmark_id: number }) => b.bookmark_id === 4);
    expect(bookmark4).toEqual(expect.objectContaining({ ...mockBookmarks[3], keywords: [] }));
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
