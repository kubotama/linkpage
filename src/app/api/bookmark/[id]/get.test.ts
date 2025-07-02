import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { mockBookmarks } from "../../../types/Bookmark";
import { getDb } from "../database";
import { GET } from "./route";

vi.mock("../database");

const API_URL = "http://localhost:3000/api/bookmark/";

let inMemoryDbInstance: ActualDatabase.Database;

const createGetRequest = (
  id: string
): [Request, { params: { id: string } }] => {
  return [
    new Request(`${API_URL}${id}`, { method: "Get" }),
    { params: { id } },
  ];
};

describe("ブックマークを1件取得するAPIのテスト", () => {
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

  it("GET: ブックマークのデータが取得できる", async () => {
    const [request, context] = createGetRequest("1");
    const response = await GET(request, context);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockBookmarks[0]);
  });

  it("GET: 不正なIDの場合400エラーを返す", async () => {
    const [request, context] = createGetRequest("abc");
    const response = await GET(request, context);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toEqual("IDは正の整数である必要があります。");
  });

  it("GET: 存在しないIDの場合404エラーを返す", async () => {
    const [request, context] = createGetRequest("100");
    const response = await GET(request, context);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.message).toEqual("指定されたブックマークがありません。");
  });

  it("GET: データベースエラー時に500エラーを返す", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(getDb).mockImplementation(() => {
      throw dbError;
    });

    const [request, context] = createGetRequest("1");
    const response = await GET(request, context);
    expect(response.status).toBe(500);
    const text = await response.json();
    expect(text.message).toEqual("サーバー内部でエラーが発生しました。");
  });

  it("GET: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi
      .spyOn(inMemoryDbInstance, "prepare")
      .mockImplementation(() => {
        throw queryError;
      });

    const [request, context] = createGetRequest("1");
    const response = await GET(request, context);
    expect(response.status).toBe(500);
    const text = await response.json();
    expect(text.message).toEqual("サーバー内部でエラーが発生しました。");

    prepareSpy.mockRestore();
  });
});
