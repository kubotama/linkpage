import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
} from "../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../test-utils/assertions";
import { createBookmark, GOOGLE_BOOKMARK } from "../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../test-utils/db-setup";
import { Bookmark } from "../../types/Bookmark";
import { API_BOOKMARKS_URL } from "../utils/constants";
import { ErrorTestCase } from "../utils/types";
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

  describe("POST: エラーログが出力される場合のテスト", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const errorTestCases: ErrorTestCase<Partial<Bookmark> | string>[] = [
      {
        description: "不正なJSONデータの場合",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "リクエストボディのJSONが不正です。",
        logMessage: expect.stringContaining("Invalid JSON format"),
        body: "invalid json",
      },
      {
        description: "データベースエラー時に500エラーを返す",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: Failed to execute query",
        body: {
          url: "https://www2.example.com",
          title: "サンプルのタイトル2",
        },
        setup: () => {
          // prepareメソッドをモックしてクエリエラーを発生させる
          vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
            throw new Error("Failed to execute query");
          });
        },
      },
      {
        description: "重複したURLのブックマーク追加時に409 Conflictを返す",
        statusCode: HTTP_STATUS_CONFLICT,
        errorMessage: "指定されたURLのブックマークは既に登録されています。",
        logMessage: `Bookmark with URL "${GOOGLE_BOOKMARK.url}" already exists.`,
        body: {
          url: GOOGLE_BOOKMARK.url, // Same URL
          title: "同じURLで別のタイトル",
        },
      },
      {
        description: "URLが空文字の場合にエラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "URLを指定してください。",
        logMessage: "URLが指定されていません。",
        body: {
          title: "Example",
        },
      },
      {
        description: "タイトルが空文字の場合にエラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "タイトルを指定してください。",
        logMessage: "タイトルが指定されていません。",
        body: {
          url: "https://example.com",
        },
      },
    ];

    it.each(errorTestCases)(
      "$description",
      async ({ setup, body, statusCode, errorMessage, logMessage }) => {
        if (setup) {
          setup();
        }

        const requestBody = typeof body === "string" ? body : JSON.stringify(createBookmark(body));
        const response = await POST(createPostRequest(requestBody));
        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );
  });

  // --- OPTIONS Tests ---
  it("OPTIONS: 適切なCORSヘッダーを返す", async () => {
    const response = await OPTIONS(); // OPTIONS handler might not take a request argument

    expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
  });
});
