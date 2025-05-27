import "@testing-library/jest-dom";

import ActualDatabase from "better-sqlite3"; // Import the actual library

import { Bookmark, createBookmarkList } from "../../../types/Bookmark";
import { getDb } from "../database";
import { POST } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
jest.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const API_URL = "http://localhost:3000/api/bookmark/update";

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

const getBookmarkIdFromUrl = (url: string) => {
  // データベースからIDを取得して確認
  const selectStmt = inMemoryDbInstance.prepare(
    "SELECT id, title FROM bookmarks WHERE url = ?"
  );
  const dbEntry = selectStmt.get(url) as { id: number };
  expect(dbEntry).toBeDefined();
  const bookmarkIdToUpdate = dbEntry.id;

  return bookmarkIdToUpdate;
};

describe("ブックマーク更新APIのテスト (オンメモリDB)", () => {
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

  it("POST: ブックマークを更新できる。", async () => {
    // 更新対象のブックマーク (例: Google, IDは2になるはず)
    const bookmarkToUpdate = mockBookmarks[1]; // Google

    // データベースからIDを取得して確認
    const bookmarkIdToUpdate = getBookmarkIdFromUrl(bookmarkToUpdate.url);

    // 更新前の件数を確認
    const countBefore = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(countBefore).toBe(mockBookmarks.length);

    // 更新リクエストを作成
    const request = createPostRequest(
      JSON.stringify({ id: bookmarkIdToUpdate, title: "Updated Title" })
    );
    const response = await POST(request);

    // レスポンスステータスを確認 (200 OK)
    expect(response?.status).toBe(200);

    // データベースが更新されたことを確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT id, title FROM bookmarks WHERE url = ?"
    );
    const updatedEntry = selectStmt.get(bookmarkToUpdate.url);
    expect((updatedEntry as { id: number; title: string }).id).toEqual(
      bookmarkIdToUpdate
    );
    expect((updatedEntry as { id: number; title: string }).title).toEqual(
      "Updated Title"
    );

    // 更新後の件数を確認
    const countAfter = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(countAfter).toBe(mockBookmarks.length);
  });

  it("POST: 登録されていないブックマークIDを指定された場合は404を返す。", async () => {
    // 更新リクエストを作成
    const request = createPostRequest(
      JSON.stringify({ id: 9999, title: "unregistered bookmark" })
    );
    const response = await POST(request);

    // レスポンスステータスを確認 (404 Not Found)
    expect(response?.status).toBe(404);
    const errorText = await response?.text();
    expect(errorText).toBe("指定されたブックマークがありません。");
  });

  it("POST: タイトルが指定されていない場合には400を返す。", async () => {
    const bookmarkIdToUpdate = getBookmarkIdFromUrl(mockBookmarks[1].url);

    // 更新リクエストを作成
    const request = createPostRequest(
      JSON.stringify({ id: bookmarkIdToUpdate })
    );
    const response = await POST(request);

    // レスポンスステータスを確認 (400: Bad Request)
    expect(response?.status).toBe(400);
    const errorText = await response?.text();
    expect(errorText).toBe("タイトルが指定されていません。");
  });

  it("POST: IDが指定されていない場合には400を返す。", async () => {
    // 更新リクエストを作成
    const request = createPostRequest(
      JSON.stringify({ title: "Updated Title" })
    );
    const response = await POST(request);

    // レスポンスステータスを確認 (400: Bad Request)
    expect(response?.status).toBe(400);
    const errorText = await response?.text();
    expect(errorText).toBe("IDが指定されていません。");
  });

  it("POST: 不正な形式(文字列)のIDが指定された場合には400を返す。", async () => {
    // 更新リクエストを作成
    const request = createPostRequest(
      JSON.stringify({ id: "invalid id", title: "Updated Title" })
    );
    const response = await POST(request);

    // レスポンスステータスを確認 (400: Bad Request)
    expect(response?.status).toBe(400);
    const errorText = await response?.text();
    expect(errorText).toBe("IDは正の整数である必要があります。");
  });

  it("POST: 不正なJSONデータの場合は500を返す。", async () => {
    // 更新リクエストを作成
    const request = createPostRequest("invalid json data");
    const response = await POST(request);

    // レスポンスステータスを確認 (500: Internal Server Error)
    expect(response?.status).toBe(500);
    const errorText = await response?.text();
    expect(errorText).toBe("サーバーで予期せぬエラーが発生しました。");
  });
});
