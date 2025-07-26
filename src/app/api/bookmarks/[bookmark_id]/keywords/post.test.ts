import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { getDb } from "../../database";
import { POST } from "./route";
import { setupInMemoryDb } from "../../../../test-utils/db-setup";
import { Keyword } from "../../../../types/Keyword";

vi.mock("../../database");

let inMemoryDbInstance: ActualDatabase.Database;

describe("POST /api/bookmarks/[bookmark_id]/keywords", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    inMemoryDbInstance = setupInMemoryDb();

    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  const mockRequest = (body: unknown) => {
    return {
      json: async () => Promise.resolve(body),
    } as NextRequest;
  };

  // 正常系テスト
  describe("Success cases", () => {
    it("should add a new keyword to a bookmark and return 201", async () => {
      const request = mockRequest({ keyword_name: "  new-keyword  " });

      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody.message).toBe("キーワードをブックマークに追加しました。");
      // テストデータとして、キーワードを4件登録しているため、追加したキーワードのIDは5
      expect(responseBody.keyword_id).toBe(5);
      // テストデータとして、ブックマークに設定しているキーワードが3件あるため、追加したIDは4
      expect(responseBody.bookmark_keyword_id).toBe(4);
      expect(responseBody.keyword_name).toBe("new-keyword");

      // DBの状態を確認
      const db = getDb();
      const keyword = db
        .prepare("SELECT * FROM keywords WHERE keyword_name = ?")
        .get("new-keyword");
      expect(keyword).toBeDefined();
      const association = db
        .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? AND keyword_id = ?")
        .get(1, (keyword as Keyword).keyword_id);
      expect(association).toBeDefined();
    });

    it("should add an existing keyword to a bookmark and return 201", async () => {
      const db = getDb();
      const { lastInsertRowid: keywordId } = db
        .prepare("INSERT INTO keywords (keyword_name) VALUES (?)")
        .run("existing-keyword");

      // テストデータとして、キーワードを4件登録しているため、追加したキーワードのIDは5
      expect(keywordId).toEqual(5);
      // データベースに登録されているキーワードの件数を確認
      expect(db.prepare("SELECT * FROM keywords").all().length).toBe(5);

      const request = mockRequest({ keyword_name: "existing-keyword" });

      const response = await POST(request, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody.keyword_id).toBe(keywordId);
      // テストデータとして、ブックマークに設定しているキーワードが3件あるため、追加したIDは4
      expect(responseBody.bookmark_keyword_id).toBe(4);

      // DBの状態を確認
      expect(db.prepare("SELECT * FROM keywords").all().length).toBe(5);
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
      // 最初にキーワードを登録
      const initialRequest = mockRequest({ keyword_name: "duplicate-keyword" });
      await POST(initialRequest, { params: { bookmark_id: "1" } });

      // 同じキーワードを再度登録しようとする
      const duplicateRequest = mockRequest({ keyword_name: "duplicate-keyword" });
      const response = await POST(duplicateRequest, { params: { bookmark_id: "1" } });
      const responseBody = await response.json();

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
