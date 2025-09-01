import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_NOT_FOUND,
} from "../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../test-utils/assertions";
import {
  GMAIL_BOOKMARK,
  LINKPAGE_BOOKMARK,
  mockBookmarks,
} from "../../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { API_BOOKMARKS_URL } from "../../utils/constants";
import { ErrorTestCase } from "../../utils/types";
import { getDb } from "../database";
import { PUT } from "./route";
import { Bookmark } from "../../../types/Bookmark";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
vi.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const createPutRequest = (
  body: string,
  bookmark_id: number
): [Request, { params: Promise<{ bookmark_id: string }> }] => {
  return [
    new Request(`${API_BOOKMARKS_URL}${bookmark_id}`, {
      method: "Put",
      body: body,
    }),
    { params: Promise.resolve({ bookmark_id: bookmark_id.toString() }) },
  ];
};

describe("ブックマーク更新APIのテスト (オンメモリDB)", () => {
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

  it("PUT: ブックマークのタイトルのみを更新できる。", async () => {
    const [request, context] = createPutRequest(
      JSON.stringify({
        url: LINKPAGE_BOOKMARK.url,
        title: "Updated Title",
      }),
      LINKPAGE_BOOKMARK.bookmark_id
    );
    const response = await PUT(request, context);

    // レスポンスステータスを確認 (204 No Content)
    expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);

    // データベースが更新されたことを確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT bookmark_id, url, title FROM bookmarks WHERE bookmark_id = ?"
    );
    const updatedEntry = selectStmt.get(LINKPAGE_BOOKMARK.bookmark_id) as {
      bookmark_id: number;
      url: string;
      title: string;
    };
    expect(updatedEntry.bookmark_id).toEqual(LINKPAGE_BOOKMARK.bookmark_id);
    expect(updatedEntry.url).toEqual(LINKPAGE_BOOKMARK.url);
    expect(updatedEntry.title).toEqual("Updated Title");
    // 更新後の件数を確認
    const countAfter = (
      inMemoryDbInstance.prepare("SELECT COUNT(*) as count FROM bookmarks").get() as {
        count: number;
      }
    ).count;
    expect(countAfter).toBe(mockBookmarks.length);
  });

  it("PUT: ブックマークのタイトルとURLを更新できる。", async () => {
    // // 更新対象のブックマーク
    const bookmarkToUpdate = {
      bookmark_id: 1,
      url: "https://www.example.com",
      title: "Example Title",
    };

    const [request, context] = createPutRequest(
      JSON.stringify({
        url: bookmarkToUpdate.url,
        title: bookmarkToUpdate.title,
      }),
      bookmarkToUpdate.bookmark_id
    );
    const response = await PUT(request, context);

    // レスポンスステータスを確認 (204 No Content)
    expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);

    // データベースが更新されたことを確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT bookmark_id, url, title FROM bookmarks WHERE bookmark_id = ?"
    );
    const updatedEntry = selectStmt.get(bookmarkToUpdate.bookmark_id);
    expect(updatedEntry).toEqual(bookmarkToUpdate);

    // 更新後の件数を確認
    const countAfter = (
      inMemoryDbInstance.prepare("SELECT COUNT(*) as count FROM bookmarks").get() as {
        count: number;
      }
    ).count;
    expect(countAfter).toBe(mockBookmarks.length);
  });

  describe("PUT: エラーログが出力される場合のテスト", () => {
    let consoleErrorSpy: MockInstance;
    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const errorTestCases: ErrorTestCase<Bookmark>[] = [
      {
        description: "登録されていないブックマークIDを指定された場合は404を返す。",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたブックマークがありません。",
        logMessage: "Bookmark with id: 999 not found.",
        body: {
          bookmark_id: 999,
          url: "https://www.example.com",
          title: "Example Title",
          keywords: [],
        },
      },
      {
        description: "タイトルが指定されていない場合には400を返す。",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "タイトルを指定してください。",
        logMessage: "タイトルが指定されていません。",
        body: {
          bookmark_id: 1,
          url: "https://www.example.com",
          title: "",
          keywords: [],
        },
      },
      {
        description: "URLが指定されていない場合には400を返す。",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "URLを指定してください。",
        logMessage: "URLが指定されていません。",
        body: {
          bookmark_id: 1,
          url: "",
          title: "Example Title",
          keywords: [],
        },
      },
      {
        description: "クエリエラー時に500エラーを返す",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: Failed to execute query",
        body: {
          bookmark_id: 1,
          url: "https://www.example.com",
          title: "Example Title",
          keywords: [],
        },
        setup: () => {
          // prepareメソッドをモックしてクエリエラーを発生
          vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
            throw new Error("Failed to execute query");
          });
        },
      },
      {
        description: "同じURLが登録される場合には409を返す。",
        statusCode: HTTP_STATUS_CONFLICT,
        errorMessage: "指定されたURLのブックマークは既に登録されています。",
        logMessage: 'Bookmark with URL "https://mail.google.com" already exists.',
        body: {
          bookmark_id: 1,
          url: GMAIL_BOOKMARK.url,
          title: "Example Title",
          keywords: [],
        },
      },
    ];

    it.each(errorTestCases)(
      "$description",
      async ({ setup, body, statusCode, errorMessage, logMessage }) => {
        if (setup) {
          setup();
        }
        const [request, context] = createPutRequest(
          JSON.stringify({
            url: body.url,
            title: body.title,
          }),
          body.bookmark_id
        );
        const response = await PUT(request, context);

        // レスポンスステータスを確認 (404 Not Found)
        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );

    it("PUT: IDが指定されていない場合には400を返す。", async () => {
      const bookmarkToUpdate = {
        url: "https://www.example.com",
        title: "Example Title",
      };

      const [request] = createPutRequest(
        JSON.stringify({
          url: bookmarkToUpdate.url,
          title: bookmarkToUpdate.title,
        }),
        0 // ダミーのID。params.idが優先されるため、この値は影響しない
      );
      const response = await PUT(request, {
        params: Promise.resolve({ bookmark_id: "" }),
      });

      // レスポンスステータスを確認 (400: Bad Request)
      await assertErrorResponse(
        response,
        HTTP_STATUS_BAD_REQUEST,
        "IDは正の整数である必要があります。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid ID provided: . It must be a positive integer."
      );
    });

    it("PUT: 不正な形式(文字列)のIDが指定された場合には400を返す。", async () => {
      const bookmarkToUpdate = {
        id: 1,
        url: "https://www.example.com",
        title: "Example Title",
      };

      const [request] = createPutRequest(
        JSON.stringify({
          url: bookmarkToUpdate.url,
          title: bookmarkToUpdate.title,
        }),
        bookmarkToUpdate.id
      );
      const response = await PUT(request, {
        params: Promise.resolve({ bookmark_id: "invalid id" }),
      });

      // レスポンスステータスを確認 (400: Bad Request)
      await assertErrorResponse(
        response,
        HTTP_STATUS_BAD_REQUEST,
        "IDは正の整数である必要があります。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid ID provided: invalid id. It must be a positive integer."
      );
    });

    it("PUT: 不正なJSONデータの場合は400を返す。", async () => {
      const bookmarkToUpdate = {
        bookmark_id: 1,
        url: "https://www.example.com",
        title: "Example Title",
      };

      const [request, context] = createPutRequest(
        "invalid json data",
        bookmarkToUpdate.bookmark_id
      );
      const response = await PUT(request, context);

      await assertErrorResponse(
        response,
        HTTP_STATUS_BAD_REQUEST,
        "リクエストボディのJSONが不正です。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid JSON format: Unexpected token")
      );
    });
  });
});
