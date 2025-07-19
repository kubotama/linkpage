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
    expect(bookmark1.url).toEqual(mockBookmarks[0].url);
    expect(bookmark1.title).toEqual(mockBookmarks[0].title);
    expect(bookmark1.keywords).toEqual([]);

    const bookmark2 = json.find((b: { bookmark_id: number }) => b.bookmark_id === 2);
    expect(bookmark2.url).toEqual(mockBookmarks[1].url);
    expect(bookmark2.title).toEqual(mockBookmarks[1].title);
    expect(bookmark2.keywords).toHaveLength(2);
    expect(bookmark2.keywords).toEqual(expect.arrayContaining(["キーワード1", "キーワード2"]));

    const bookmark3 = json.find((b: { bookmark_id: number }) => b.bookmark_id === 3);
    expect(bookmark3.url).toEqual(mockBookmarks[2].url);
    expect(bookmark3.title).toEqual(mockBookmarks[2].title);
    expect(bookmark3.keywords).toHaveLength(1);
    expect(bookmark3.keywords).toEqual(["キーワード3"]);

    const bookmark4 = json.find((b: { bookmark_id: number }) => b.bookmark_id === 4);
    expect(bookmark4.url).toEqual(mockBookmarks[3].url);
    expect(bookmark4.title).toEqual(mockBookmarks[3].title);
    expect(bookmark4.keywords).toEqual([]);
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
