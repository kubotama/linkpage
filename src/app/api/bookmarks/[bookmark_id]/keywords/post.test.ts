import ActualDatabase from "better-sqlite3"; // 実際のライブラリをインポート
import { NextRequest } from "next/server";
import { afterEach, assert, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
} from "../../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../../test-utils/assertions";
import { setupInMemoryDb } from "../../../../test-utils/db-setup";
import { isKeyword, KeywordPostParams } from "../../../../types/Keyword";
import { ErrorTestCase } from "../../../utils/types";
import { getDb } from "../../database";

vi.mock("../../database");
let POST: typeof import("./route").POST; // POST関数の型を宣言

let inMemoryDbInstance: ActualDatabase.Database;

const getPostParams = (bookmark_id: string): KeywordPostParams => {
  return {
    params: Promise.resolve({ bookmark_id }),
  };
};

describe("POST /api/bookmarks/[bookmark_id]/keywords", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();

    inMemoryDbInstance = setupInMemoryDb();

    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);

    // route.tsを動的にインポートし、POST関数を取得
    // これにより、route.tsがインポートされる時点でgetDbのモックが有効になります
    const routeModule = await import("./route");
    POST = routeModule.POST;
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  const mockRequest = (body: unknown) => {
    return {
      json: async () => Promise.resolve(body),
    } as NextRequest;
  };

  const itemsOfKeywords = () => {
    return (
      inMemoryDbInstance.prepare("SELECT COUNT(*) as count FROM keywords").get() as {
        count: number;
      }
    ).count;
  };

  // 正常系テスト
  describe("Success cases", () => {
    it("should add a new keyword to a bookmark and return 201", async () => {
      const newKeyword = "new-keyword";
      const request = mockRequest({ keyword_name: newKeyword });

      // Act

      const response = await POST(request, getPostParams("1"));
      const responseBody = await response.json();

      expect(response.status).toBe(HTTP_STATUS_CREATED);
      expect(responseBody.message).toBe("キーワードをブックマークに追加しました。");
      expect(responseBody.keyword_id).toEqual(expect.any(Number));
      expect(responseBody.bookmark_keyword_id).toEqual(expect.any(Number));
      expect(responseBody.keyword_name).toBe(newKeyword.trim());

      // DBの状態を確認
      const db = getDb();
      const rawKeywordResult = db
        .prepare("SELECT * FROM keywords WHERE keyword_name = ?")
        .get(newKeyword.trim());
      assert(isKeyword(rawKeywordResult), "rawKeywordResult should be of type Keyword");
      const association = db
        .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? AND keyword_id = ?")
        .get(1, rawKeywordResult.keyword_id);
      expect(association).toBeDefined();
    });

    it("should add an existing keyword to a bookmark and return 201", async () => {
      const existingKeyword = "existing-keyword";
      const db = getDb();

      const countKeywordsBefore = itemsOfKeywords();

      // 最初にキーワードを登録

      const { lastInsertRowid: keywordId } = db
        .prepare("INSERT INTO keywords (keyword_name) VALUES (?)")
        .run(existingKeyword);

      expect(keywordId).toEqual(expect.any(Number));

      // データベースに登録されているキーワードの件数を確認
      expect(itemsOfKeywords()).toEqual(countKeywordsBefore + 1);

      // Act

      const request = mockRequest({ keyword_name: existingKeyword });

      const response = await POST(request, getPostParams("1"));
      const responseBody = await response.json();

      expect(response.status).toBe(HTTP_STATUS_CREATED);
      expect(responseBody.keyword_id).toBe(keywordId);
      expect(responseBody.keyword_name).toBe(existingKeyword);
      expect(responseBody.bookmark_keyword_id).toEqual(expect.any(Number));

      // DBの状態を確認
      expect(itemsOfKeywords()).toEqual(countKeywordsBefore + 1);
      const association = db
        .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? AND keyword_id = ?")
        .get(1, keywordId);
      expect(association).toBeDefined();
    });
  });

  // // 異常系テスト
  describe("Error cases", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const errorTestCases: ErrorTestCase<string>[] = [
      {
        description: "存在しないIDの場合は404エラーを返す",
        statusCode: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたブックマークがありません。",
        logMessage: "Bookmark with id: 999 not found.",
        body: "999",
      },
      {
        description: "不正なIDの場合は400エラーを返す",
        statusCode: HTTP_STATUS_BAD_REQUEST,
        errorMessage: "IDは正の整数である必要があります。",
        logMessage: "Invalid ID provided: abc. It must be a positive integer.",
        body: "abc",
      },
    ];

    it.each(errorTestCases)(
      "$description",
      async ({ statusCode, errorMessage, logMessage, body }) => {
        const request = mockRequest({ keyword_name: "test-keyword" });
        const response = await POST(request, getPostParams(body));
        await assertErrorResponse(response, statusCode, errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(logMessage);
      }
    );

    it("should return 400 if request body is not valid JSON", async () => {
      const request = {
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as NextRequest;

      const response = await POST(request, getPostParams("1"));
      await assertErrorResponse(
        response,
        HTTP_STATUS_BAD_REQUEST,
        "リクエストボディのJSONが不正です。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid JSON format: Invalid JSON");
    });

    it.each([
      { case: "is missing", body: {} },
      { case: "is an empty string", body: { keyword_name: "   " } },
      { case: "is not a string", body: { keyword_name: 123 } },
    ])("should return 400 if keyword_name $case", async ({ body }) => {
      const request = mockRequest(body);
      const response = await POST(request, getPostParams("1"));
      await assertErrorResponse(
        response,
        HTTP_STATUS_BAD_REQUEST,
        "キーワードを指定してください。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith("キーワードが指定されていません。");
    });

    it("should return 409 if the keyword is already associated with the bookmark", async () => {
      const db = getDb();
      const keywordName = "duplicate-keyword";
      const bookmarkId = 1;

      // Arrange: DBを直接操作して、キーワードとブックマークの関連付けをセットアップ
      const { lastInsertRowid: keywordId } = db
        .prepare("INSERT INTO keywords (keyword_name) VALUES (?)")
        .run(keywordName);
      db.prepare("INSERT INTO bookmark_keywords (bookmark_id, keyword_id) VALUES (?, ?)").run(
        bookmarkId,
        keywordId
      );

      // Act: 同じキーワードを再度登録しようとする
      const request = mockRequest({ keyword_name: keywordName });
      const response = await POST(request, getPostParams(String(bookmarkId)));

      // Assert
      await assertErrorResponse(
        response,
        HTTP_STATUS_CONFLICT,
        "指定されたキーワードは既にこのブックマークに登録されています。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Keyword "duplicate-keyword" is already associated with bookmark id: 1.'
      );
    });

    it("should handle internal server errors gracefully", async () => {
      // db.transactionがエラーをスローするようにモックする
      const db = getDb();
      vi.spyOn(db, "transaction").mockImplementation(() => {
        throw new Error("Database error");
      });

      const request = mockRequest({ keyword_name: "test-keyword" });
      const response = await POST(request, getPostParams("1"));
      await assertErrorResponse(
        response,
        HTTP_STATUS_INTERNAL_SERVER_ERROR,
        "サーバー内部でエラーが発生しました。"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith("Internal Server Error: Database error");
    });
  });
});
