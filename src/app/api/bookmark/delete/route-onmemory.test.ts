import "@testing-library/jest-dom";

import ActualDatabase from "better-sqlite3"; // Import the actual library

import { Bookmark, createBookmarkList } from "../../../types/Bookmark";
import { getDb } from "../database";
import { POST } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
jest.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const API_URL = "http://localhost:3000/api/bookmark/delete";

const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

function createPostRequest(body: string): Request {
  return new Request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
}

describe("ブックマーク削除APIのテスト (オンメモリDB)", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new in-memory database for each test
    inMemoryDbInstance = new ActualDatabase(":memory:");
    // Initialize the schema (same as in the original database.ts)
    inMemoryDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL
      )
    `);

    mockBookmarks.forEach((bookmark) => {
      const insert = inMemoryDbInstance.prepare(`
                INSERT INTO bookmarks (url, title) VALUES (?, ?)
            `);
      insert.run(bookmark.url, bookmark.title);
    });

    // Configure the getDb mock to return this instance
    (getDb as jest.Mock).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  it("POST: ブックマークを削除できる", async () => {
    // 削除対象のブックマーク (例: Google, IDは2になるはず)
    const bookmarkToDelete = mockBookmarks[1]; // Google

    // データベースからIDを取得して確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT id FROM bookmarks WHERE url = ?"
    );
    const dbEntry = selectStmt.get(bookmarkToDelete.url) as { id: number };
    expect(dbEntry).toBeDefined();
    const bookmarkIdToDelete = dbEntry.id;

    // 削除前の件数を確認
    const countBefore = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(countBefore).toBe(mockBookmarks.length);

    // 削除リクエストを作成
    const request = createPostRequest(
      JSON.stringify({ id: bookmarkIdToDelete })
    );
    const response = await POST(request);

    // レスポンスステータスを確認 (204 No Content)
    expect(response.status).toBe(204);

    // データベースから削除されたことを確認
    const deletedEntry = selectStmt.get(bookmarkToDelete.url);
    expect(deletedEntry).toBeUndefined();

    // 削除後の件数を確認
    const countAfter = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(countAfter).toBe(mockBookmarks.length - 1);
  });

  it("POST: 登録されていないブックマークIDを指定された場合は404を返す", async () => {
    const nonExistentId = 99999; // 存在しないID
    const request = createPostRequest(JSON.stringify({ id: nonExistentId }));
    const response = await POST(request);

    expect(response.status).toBe(404);
    const text = await response.text();
    expect(text).toBe("指定されたブックマークがありません。");

    // ブックマーク数が変わっていないことを確認
    const count = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(count).toBe(mockBookmarks.length);
  });

  it("POST: 不正なJSONデータの場合は500エラーを返す", async () => {
    const request = createPostRequest("invalid json data");
    const response = await POST(request);

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toMatch(/サーバーで予期せぬエラーが発生しました。/i);
  });

  it("POST: IDがリクエストボディに含まれていない場合は400エラーを返す", async () => {
    const request = createPostRequest(JSON.stringify({ title: "missing id" }));
    const response = await POST(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe("IDは正の整数である必要があります。");
  });
});
