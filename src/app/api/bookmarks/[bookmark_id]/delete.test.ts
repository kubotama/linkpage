import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_NOT_FOUND,
} from "../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../test-utils/assertions";
import { GOOGLE_BOOKMARK, mockBookmarks } from "../../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { API_BOOKMARKS_URL } from "../../utils/constants";
import { ErrorTestCase } from "../../utils/types";
import { getDb } from "../database";
import { DELETE } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
vi.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const createDeleteRequest = (
  bookmark_id: string
): [Request, { params: Promise<{ bookmark_id: string }> }] => {
  return [
    new Request(`${API_BOOKMARKS_URL}${bookmark_id}`, { method: "DELETE" }),
    { params: Promise.resolve({ bookmark_id }) },
  ];
};

describe("ブックマーク削除APIのテスト (オンメモリDB)", () => {
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

  it("DELETE: ブックマークを削除できる", async () => {
    // 削除対象のブックマーク (例: Google, IDは2になるはず)
    const bookmarkToDelete = GOOGLE_BOOKMARK; // Google

    // データベースからIDを取得して確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT bookmark_id FROM bookmarks WHERE url = ?"
    );
    const dbEntry = selectStmt.get(bookmarkToDelete.url) as {
      bookmark_id: number;
    };
    expect(dbEntry).toBeDefined();
    // const bookmarkIdToDelete = dbEntry.id;

    // 削除前の件数を確認
    const countBefore = (
      inMemoryDbInstance.prepare("SELECT COUNT(*) as count FROM bookmarks").get() as {
        count: number;
      }
    ).count;
    expect(countBefore).toBe(mockBookmarks.length);

    // 削除リクエストを作成
    const [request, context] = createDeleteRequest(bookmarkToDelete.bookmark_id.toString());
    const response = await DELETE(request, context);

    // レスポンスステータスを確認 (204 No Content)
    expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);

    // データベースから削除されたことを確認
    const deletedEntry = selectStmt.get(bookmarkToDelete.url);
    expect(deletedEntry).toBeUndefined();

    // 削除後の件数を確認
    const countAfter = (
      inMemoryDbInstance.prepare("SELECT COUNT(*) as count FROM bookmarks").get() as {
        count: number;
      }
    ).count;
    expect(countAfter).toBe(mockBookmarks.length - 1);
  });

  describe("DELETE: エラーログが出力される場合のテスト", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const errorTestCases: ErrorTestCase<number | string>[] = [
      {
        description: "登録されていないIDの場合に404エラーを返す",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたブックマークがありません。",
        logMessage: `Bookmark with id: 99999 not found.`,
        body: 99999,
      },
      {
        description: "データベースエラー時に500エラーを返す",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: DB error",
        body: 1,
        setup: () => {
          vi.mocked(getDb).mockImplementation(() => {
            throw new Error("DB error");
          });
        },
      },
      {
        description: "不正なIDの場合に400エラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "無効なブックマークIDです: -1",
        logMessage: "Invalid ID provided: -1. It must be a positive integer.",
        body: "-1",
      },
    ];

    it.each(errorTestCases)(
      "$description",
      async ({ setup, body, statusCode, errorMessage, logMessage }) => {
        if (setup) {
          setup();
        }

        const [request, context] = createDeleteRequest(body.toString());
        const response = await DELETE(request, context);

        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);

        // ブックマーク数が変わっていないことを確認
        const count = (
          inMemoryDbInstance.prepare("SELECT COUNT(*) as count FROM bookmarks").get() as {
            count: number;
          }
        ).count;
        expect(count).toBe(mockBookmarks.length);
      }
    );
  });
});
