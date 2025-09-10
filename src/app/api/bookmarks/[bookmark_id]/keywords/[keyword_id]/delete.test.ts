import ActualDatabase from "better-sqlite3"; // Import the actual library
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_NOT_FOUND,
} from "../../../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../../../test-utils/assertions";
import {
  GMAIL_BOOKMARK,
  GMAIL_KEYWORD_1,
  GOOGLE_BOOKMARK,
  GOOGLE_KEYWORD_1,
  GOOGLE_KEYWORD_2,
} from "../../../../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../../../../test-utils/db-setup";
import { API_BOOKMARKS_URL } from "../../../../utils/constants";
import { ErrorTestCase } from "../../../../utils/types";
// import { KeywordPostParams } from "../../../../../types/Keyword";
import { getDb } from "../../../database";
import { DELETE } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
vi.mock("../../../database");

let inMemoryDbInstance: ActualDatabase.Database;

const createDeleteRequest = (
  bookmark_id: string,
  keyword_id: string
): [Request, { params: Promise<{ bookmark_id: string; keyword_id: string }> }] => {
  return [
    new Request(`${API_BOOKMARKS_URL}/${bookmark_id}/keywords/${keyword_id}`, {
      method: "DELETE",
    }),
    { params: Promise.resolve({ bookmark_id, keyword_id }) },
  ];
};

describe("ブックマークに設定されているキーワードの解除テスト (オンメモリDB)", () => {
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

  describe("正常系テスト: キーワードの解除に成功したら204(HTTP_STATUS_NO_CONTENT)を返す", () => {
    const successTestCases = [
      {
        description: "ブックマークに紐づくキーワードを1つ解除する",
        bookmarkToUnlink: GOOGLE_BOOKMARK,
        keywordToUnlink: GOOGLE_KEYWORD_1,
      },
      {
        description: "ブックマークに紐づくもう1つのキーワードを解除する",
        bookmarkToUnlink: GOOGLE_BOOKMARK,
        keywordToUnlink: GOOGLE_KEYWORD_2,
      },
      {
        description: "別のブックマークに紐づくキーワードを解除する",
        bookmarkToUnlink: GMAIL_BOOKMARK,
        keywordToUnlink: GMAIL_KEYWORD_1,
      },
    ];

    it.each(successTestCases)(
      "DELETE: $description",
      async ({ bookmarkToUnlink, keywordToUnlink }) => {
        // 解除前の件数を確認
        const associationBefore = inMemoryDbInstance
          .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? and keyword_id = ?")
          .get(bookmarkToUnlink.bookmark_id, keywordToUnlink.keyword_id);
        expect(associationBefore).toBeDefined();
        const keywordBefore = inMemoryDbInstance
          .prepare("SELECT * FROM keywords WHERE keyword_id = ?")
          .get(keywordToUnlink.keyword_id);
        expect(keywordBefore).toBeDefined();

        // 解除リクエストを作成
        const [request, context] = createDeleteRequest(
          bookmarkToUnlink.bookmark_id.toString(),
          keywordToUnlink.keyword_id.toString()
        );

        const response = await DELETE(request, context);

        // レスポンスステータスを確認 (204 No Content)
        expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);

        // bookmark_keywordsテーブルから関連付けのみが削除されたことを確認する
        const associationAfter = inMemoryDbInstance
          .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? and keyword_id = ?")
          .get(bookmarkToUnlink.bookmark_id, keywordToUnlink.keyword_id);
        expect(associationAfter).toBeUndefined();
        const keywordAfter = inMemoryDbInstance
          .prepare("SELECT * FROM keywords WHERE keyword_id = ?")
          .get(keywordToUnlink.keyword_id);
        expect(keywordAfter).toBeDefined();
      }
    );
  });
  describe("異常系テスト", () => {
    let consoleErrorSpy: MockInstance;
    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    const errorTestCases: ErrorTestCase<{
      bookmark_id?: string;
      keyword_id?: string;
    }>[] = [
      {
        description: "ブックマークIDが存在しない場合、404エラーを返す",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたブックマークに指定されたキーワードが設定されていません。",
        logMessage: "Bookmark-keyword association not found for bookmark_id: 999 and keyword_id: 1",
        body: { bookmark_id: "999", keyword_id: "1" },
      },
      {
        description: "ブックマークIDが正の整数でない場合、400エラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "IDは正の整数である必要があります。",
        logMessage: "Invalid ID provided: abc. It must be a positive integer.",
        body: { bookmark_id: "abc", keyword_id: "1" },
      },
      {
        description: "keyword_idが指定されていない場合、400エラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "キーワードを指定してください。",
        logMessage: "キーワードが指定されていません。",
        body: {
          bookmark_id: "1",
        },
      },
      {
        description: "keyword_idが数値でない場合、400エラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "IDは正の整数である必要があります。",
        logMessage: "Invalid ID provided: abc. It must be a positive integer.",
        body: { bookmark_id: "1", keyword_id: "abc" },
      },
      {
        description: "keyword_idが負の整数の場合、400エラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "IDは正の整数である必要があります。",
        logMessage: "Invalid ID provided: -1. It must be a positive integer.",
        body: { bookmark_id: "1", keyword_id: "-1" },
      },
      {
        description: "データベースエラー時に500エラーを返す",
        statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
        logMessage: "Internal Server Error: DB error",
        body: { bookmark_id: "1", keyword_id: "2" },
        requestBody: { keyword_id: 2 },
        setup: () => {
          vi.mocked(getDb).mockImplementation(() => {
            throw new Error("DB error");
          });
        },
      },
      {
        description: "指定されたキーワードがブックマークに紐付いていない場合、404エラーを返す",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたブックマークに指定されたキーワードが設定されていません。",
        logMessage: "Bookmark-keyword association not found for bookmark_id: 1 and keyword_id: 999",
        body: { bookmark_id: "1", keyword_id: "999" },
      },
    ];

    it.each(errorTestCases)(
      "$description",
      async ({ statusCode, errorMessage, logMessage, body, requestBody, setup }) => {
        if (setup) {
          setup();
        }

        const request = {
          json: async () => Promise.resolve(requestBody),
        } as NextRequest;
        const context = {
          params: Promise.resolve({ bookmark_id: body.bookmark_id, keyword_id: body.keyword_id }),
        };
        const response = await DELETE(request, context);

        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );
  });
});
