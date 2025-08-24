import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
} from "../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../test-utils/assertions";
import { createBookmark, mockBookmarks } from "../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../test-utils/db-setup";
import { Bookmark } from "../../types/Bookmark";
import { API_BOOKMARKS_URL } from "../utils/constants";
import { getDb } from "./database";
import { OPTIONS, POST } from "./route";

vi.mock("./database");

let inMemoryDbInstance: ActualDatabase.Database;

function createPostRequest(body: string): Request {
  return new Request(API_BOOKMARKS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
}

describe("ブックマーク追加APIのテスト (オンメモリDB)", () => {
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

  // Utility function to add a bookmark and verify the response
  async function addBookmarkAndVerify(bookmark: Bookmark) {
    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    expect(response.status).toBe(HTTP_STATUS_CREATED);
    const json = await response.json();
    expect(json).toEqual({
      bookmark_id: expect.any(Number),
      url: bookmark.url,
      title: bookmark.title,
    });

    // Verify data in the in-memory database
    const stmt = inMemoryDbInstance.prepare(
      "SELECT url, title FROM bookmarks WHERE bookmark_id = ?"
    );
    const dbData = stmt.get(json.bookmark_id); // json.id comes from the response (lastInsertRowid)
    expect(dbData).toEqual({
      url: bookmark.url,
      title: bookmark.title,
    });
  }

  it("POST: ブックマークのデータが追加できる", async () => {
    await addBookmarkAndVerify(
      createBookmark({
        url: "https://example.com",
        title: "サンプルのタイトル",
      })
    );
  });

  it("POST: ブックマークのデータを2回、追加できる", async () => {
    await addBookmarkAndVerify(
      createBookmark({
        url: "https://www1.example.com",
        title: "サンプルのタイトル1",
      })
    );

    await addBookmarkAndVerify(
      createBookmark({
        url: "https://www2.example.com",
        title: "サンプルのタイトル2",
      })
    );
  });

  it("POST: 不正なJSONデータの場合はエラーを返す", async () => {
    const response = await POST(createPostRequest("invalid json"));

    await assertErrorResponse(
      response,
      HTTP_STATUS_BAD_REQUEST,
      "リクエストボディのJSONが不正です。"
    );
  });

  it("POST: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
      throw queryError;
    });

    const bookmark: Bookmark = createBookmark({
      url: "https://www2.example.com",
      title: "サンプルのタイトル2",
    });

    const response = await POST(createPostRequest(JSON.stringify(bookmark)));
    await assertErrorResponse(
      response,
      HTTP_STATUS_INTERNAL_SERVER_ERROR,
      "サーバー内部でエラーが発生しました。"
    );

    prepareSpy.mockRestore();
  });

  it("POST: 重複したURLのブックマーク追加時に409 Conflictを返す", async () => {
    const bookmark: Bookmark = createBookmark({
      url: mockBookmarks[1].url, // Same URL
      title: "同じURLで別のタイトル",
    });

    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    await assertErrorResponse(
      response,
      HTTP_STATUS_CONFLICT,
      "指定されたURLのブックマークは既に登録されています。"
    );
  });

  it("POST: URLが空文字の場合にエラーを返す", async () => {
    const bookmark: Bookmark = createBookmark({
      title: "Example",
    });

    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    await assertErrorResponse(response, HTTP_STATUS_BAD_REQUEST, "URLを指定してください。");
  });

  it("POST: タイトルが空文字の場合にエラーを返す", async () => {
    const bookmark: Bookmark = createBookmark({
      url: "https://example.com",
    });

    const response = await POST(createPostRequest(JSON.stringify(bookmark)));

    await assertErrorResponse(response, HTTP_STATUS_BAD_REQUEST, "タイトルを指定してください。");
  });

  // --- OPTIONS Tests ---
  it("OPTIONS: 適切なCORSヘッダーを返す", async () => {
    const response = await OPTIONS(); // OPTIONS handler might not take a request argument

    expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "chrome-extension://jonckoigjppkhajocdbgfbgjdgffhebf"
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
  });
});
