import ActualDatabase from "better-sqlite3"; // Import the actual library
import { NextRequest } from "next/server";
import { afterEach, assert, beforeEach, describe, expect, it, vi } from "vitest";

import { setupInMemoryDb } from "../../../../test-utils/db-setup";
import { isKeyword } from "../../../../types/Keyword";
import { getDb } from "../../database";

vi.mock("../../database");
let POST: typeof import("./route").POST; // POST関数の型を宣言

let inMemoryDbInstance: ActualDatabase.Database;

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

  const countItemOfTable = (tableName: string) => {
    return (
      inMemoryDbInstance.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as {
        count: number;
      }
    ).count;
  };

  // 正常系テスト
  describe("Success cases", () => {
    it("should add a new keyword to a bookmark and return 201", async () => {
      const newKeyword = "new-keyword";
      const request = mockRequest({ keyword_name: newKeyword });

      const countKeywords = countItemOfTable("keywords");
      const countBookmarksKeywords = countItemOfTable("bookmark_keywords");

      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody.message).toBe("キーワードをブックマークに追加しました。");
      // 既存のキーワード数に1を加えたIDになることを確認
      expect(responseBody.keyword_id).toBe(countKeywords + 1);
      // 既存のブックマークキーワード数に1を加えたIDになることを確認
      expect(responseBody.bookmark_keyword_id).toBe(countBookmarksKeywords + 1);
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

      const countKeywordsBefore = countItemOfTable("keywords");
      const countBookmarksKeywordsBefore = countItemOfTable("bookmark_keywords");

      // 最初にキーワードを登録

      const { lastInsertRowid: keywordId } = db
        .prepare("INSERT INTO keywords (keyword_name) VALUES (?)")
        .run(existingKeyword);

      // 既存のキーワード数に1を加えたIDになることを確認
      expect(keywordId).toEqual(countKeywordsBefore + 1);
      // データベースに登録されているキーワードの件数を確認
      expect(countItemOfTable("keywords")).toEqual(countKeywordsBefore + 1);

      const request = mockRequest({ keyword_name: existingKeyword });

      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody.keyword_id).toBe(keywordId);
      expect(responseBody.keyword_name).toBe(existingKeyword);
      expect(responseBody.bookmark_keyword_id).toBe(countBookmarksKeywordsBefore + 1);

      // DBの状態を確認
      expect(countItemOfTable("keywords")).toEqual(countKeywordsBefore + 1);
      const association = db
        .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? AND keyword_id = ?")
        .get(1, keywordId);
      expect(association).toBeDefined();
    });
  });

  // // 異常系テスト
  describe("Error cases", () => {
    it("should return 404 if bookmark_id does not exist", async () => {
      const request = mockRequest({ keyword_name: "test-keyword" });
      const response = await POST(request, { params: { bookmark_id: "999" } });
      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody.message).toBe("指定されたブックマークがありません。");
    });

    it("should return 400 if bookmark_id is invalid", async () => {
      const request = mockRequest({ keyword_name: "test-keyword" });
      const response = await POST(request, { params: { bookmark_id: "invalid" } });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.message).toBe("IDは正の整数である必要があります。");
    });

    it("should return 400 if request body is not valid JSON", async () => {
      const request = {
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as NextRequest;

      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.message).toBe("リクエストボディのJSONが不正です。");
    });

    it("should return 400 if keyword_name is missing", async () => {
      const request = mockRequest({});
      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.message).toBe("キーワードを指定してください。");
    });

    it("should return 400 if keyword_name is an empty string", async () => {
      const request = mockRequest({ keyword_name: "   " });
      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.message).toBe("キーワードを指定してください。");
    });

    it("should return 400 if keyword_name is not a string", async () => {
      const request = mockRequest({ keyword_name: 123 });
      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.message).toBe("キーワードを指定してください。");
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
      const response = await POST(request, { params: { bookmark_id: String(bookmarkId) } });
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(responseBody.message).toBe(
        "指定されたキーワードは既にこのブックマークに登録されています。"
      );
    });

    it("should handle internal server errors gracefully", async () => {
      // DBを閉じてエラーを意図的に発生させる
      const db = getDb();
      db.close();

      const request = mockRequest({ keyword_name: "test-keyword" });
      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody.message).toBe("サーバー内部でエラーが発生しました。");
    });
  });
});
