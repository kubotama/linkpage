import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from "../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../test-utils/assertions";
import { mockKeywords } from "../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../test-utils/db-setup";
import { getDb } from "../bookmarks/database";
import { API_KEYWORDS_URL } from "../utils/constants";
import { POST } from "./route";

vi.mock("../bookmarks/database");

let inMemoryDbInstance: ActualDatabase.Database;

const createPostRequest = (keyword_name: string): Request => {
  return new Request(API_KEYWORDS_URL, {
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

    inMemoryDbInstance = setupInMemoryDb();

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

    expect(response.status).toBe(HTTP_STATUS_CREATED);
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

    await assertErrorResponse(response, HTTP_STATUS_BAD_REQUEST, "キーワードを指定してください。");
  });

  it("POST: 不正なJSONデータ(JSON.parseエラー)の場合は400を返す", async () => {
    const response = await POST(
      new Request(API_KEYWORDS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      })
    );
    await assertErrorResponse(
      response,
      HTTP_STATUS_BAD_REQUEST,
      "リクエストボディのJSONが不正です。"
    );
  });

  it("POST: 不正なJSONデータ(null)の場合は400を返す", async () => {
    const response = await POST(
      new Request(API_KEYWORDS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(null),
      })
    );
    await assertErrorResponse(
      response,
      HTTP_STATUS_BAD_REQUEST,
      "リクエストボディのJSONが不正です。"
    );
  });

  it("POST: 重複したキーワードを追加時に409 Conflictを返す", async () => {
    const response = await POST(createPostRequest(mockKeywords[0].keyword_name));

    await assertErrorResponse(
      response,
      HTTP_STATUS_CONFLICT,
      "指定されたキーワードは既に登録されています。"
    );
  });

  it("POST: データベースエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
      throw queryError;
    });

    const response = await POST(createPostRequest("テスト"));
    await assertErrorResponse(
      response,
      HTTP_STATUS_INTERNAL_SERVER_ERROR,
      "サーバー内部でエラーが発生しました。"
    );

    prepareSpy.mockRestore();
  });
});
