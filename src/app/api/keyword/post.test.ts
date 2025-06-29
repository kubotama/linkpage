import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockKeywords } from "../../types/Keywords";
import { getDb } from "../bookmark/database";
import { POST } from "./route";

import { setupInMemoryDb } from "../../test-utils/db-setup";

vi.mock("../bookmark/database");

let inMemoryDbInstance: ActualDatabase.Database;

const API_URL = "http://localhost:3000/api/keyword";

const createPostRequest = (keyword_name: string): Request => {
  return new Request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword_name: keyword_name,
    }),
  });
};

describe("キーワードAPIのテスト", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    inMemoryDbInstance = setupInMemoryDb(mockKeywords);

    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  it("POST: キーワードを追加に成功して201 Createdを返す", async () => {
    const keyword_name = "テスト";
    const response = await POST(createPostRequest(keyword_name));

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json).toEqual({
      keyword_id: expect.any(Number),
      keyword_name: keyword_name,
    });

    // Verify data in the in-memory database
    const stmt = inMemoryDbInstance.prepare(
      "SELECT keyword_id, keyword_name FROM keywords WHERE keyword_id = ?"
    );
    const dbData = stmt.get(json.keyword_id); // json.id comes from the response (lastInsertRowid)
    expect(dbData).toEqual({
      keyword_id: json.keyword_id,
      keyword_name: keyword_name,
    });
  });

  it("POST: キーワードが空文字の場合は400を返す", async () => {
    const response = await POST(createPostRequest(""));

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toEqual("キーワードを指定してください。");
  });

  it("POST: 不正なJSONデータ(JSON.parseエラー)の場合は400を返す", async () => {
    const response = await POST(
      new Request(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      })
    );
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toEqual("リクエストボディのJSONが不正です。");
  });

  it("POST: 不正なJSONデータ(null)の場合は400を返す", async () => {
    const response = await POST(
      new Request(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(null),
      })
    );
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toEqual("リクエストボディのJSONが不正です。");
  });

  it("POST: 重複したキーワードを追加時に409 Conflictを返す", async () => {
    const response = await POST(
      createPostRequest(mockKeywords[0].keyword_name)
    );

    expect(response.status).toBe(409);
    const text = await response.text();
    expect(text).toEqual("指定されたキーワードは既に登録されています。");
  });

  it("POST: データベースエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi
      .spyOn(inMemoryDbInstance, "prepare")
      .mockImplementation(() => {
        throw queryError;
      });

    const response = await POST(createPostRequest("テスト"));
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toEqual("サーバー内部でエラーが発生しました。");

    prepareSpy.mockRestore();
  });
});
