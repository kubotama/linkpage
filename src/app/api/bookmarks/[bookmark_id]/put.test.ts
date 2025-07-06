import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { mockBookmarks } from "../../../types/Bookmark";
import { API_BOOKMARKS_URL } from "../../utils/constants";
import { getDb } from "../database";
import { PUT } from "./route";

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
        url: mockBookmarks[0].url,
        title: "Updated Title",
      }),
      mockBookmarks[0].bookmark_id
    );
    const response = await PUT(request, context);

    // レスポンスステータスを確認 (200 OK)
    expect(response.status).toBe(204);

    // データベースが更新されたことを確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT bookmark_id, url, title FROM bookmarks WHERE bookmark_id = ?"
    );
    const updatedEntry = selectStmt.get(mockBookmarks[0].bookmark_id) as {
      bookmark_id: number;
      url: string;
      title: string;
    };
    expect(updatedEntry.bookmark_id).toEqual(mockBookmarks[0].bookmark_id);
    expect(updatedEntry.url).toEqual(mockBookmarks[0].url);
    expect(updatedEntry.title).toEqual("Updated Title");
    // 更新後の件数を確認
    const countAfter = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
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

    // レスポンスステータスを確認 (200 OK)
    expect(response.status).toBe(204);

    // データベースが更新されたことを確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT bookmark_id, url, title FROM bookmarks WHERE bookmark_id = ?"
    );
    const updatedEntry = selectStmt.get(bookmarkToUpdate.bookmark_id);
    expect(updatedEntry).toEqual(bookmarkToUpdate);

    // 更新後の件数を確認
    const countAfter = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(countAfter).toBe(mockBookmarks.length);
  });

  it("PUT: 登録されていないブックマークIDを指定された場合は404を返す。", async () => {
    const bookmarkToUpdate = {
      bookmark_id: 999,
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

    // レスポンスステータスを確認 (404 Not Found)
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.message).toEqual("指定されたブックマークがありません。");
  });

  it("PUT: タイトルが指定されていない場合には400を返す。", async () => {
    const bookmarkToUpdate = {
      bookmark_id: 1,
      url: "https://www.example.com",
      title: "",
    };

    const [request, context] = createPutRequest(
      JSON.stringify({
        url: bookmarkToUpdate.url,
        title: bookmarkToUpdate.title,
      }),
      bookmarkToUpdate.bookmark_id
    );
    const response = await PUT(request, context);

    // レスポンスステータスを確認 (400: Bad Request)
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toEqual("タイトルを指定してください。");
  });

  it("PUT: URLが指定されていない場合には400を返す。", async () => {
    const bookmarkToUpdate = {
      bookmark_id: 1,
      url: "",
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

    // レスポンスステータスを確認 (400: Bad Request)
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toEqual("URLを指定してください。");
  });

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
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toEqual("IDは正の整数である必要があります。");
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
    expect(response.status).toEqual(400);
    const json = await response.json();
    expect(json.message).toEqual("IDは正の整数である必要があります。");
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

    expect(response.status).toEqual(400);
    const json = await response.json();
    expect(json.message).toEqual("リクエストボディのJSONが不正です。");
  });

  it("PUT: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi
      .spyOn(inMemoryDbInstance, "prepare")
      .mockImplementation(() => {
        throw queryError;
      });

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

    expect(response.status).toBe(500);
    const text = await response.json();
    expect(text.message).toEqual("サーバー内部でエラーが発生しました。");

    prepareSpy.mockRestore();
  });

  it("PUT: 同じURLが登録される場合には409を返す。", async () => {
    const bookmarkToUpdate = {
      bookmark_id: 1,
      url: "https://www.example.com",
      title: "Example Title",
    };

    const [request, context] = createPutRequest(
      JSON.stringify({
        url: mockBookmarks[2].url,
        title: bookmarkToUpdate.title,
      }),
      bookmarkToUpdate.bookmark_id
    );
    const response = await PUT(request, context);

    // レスポンスステータスを確認 (409: Conflict
    expect(response.status).toEqual(409);
    const json = await response.json();
    expect(json.message).toEqual(
      "指定されたURLのブックマークは既に登録されています。"
    );
  });
});
