import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
} from "../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../test-utils/assertions";
import { expectEqualBookmark, mockBookmarks } from "../../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { API_BOOKMARKS_URL } from "../../utils/constants";
import { getDb } from "../database";
import { GET } from "./route";

vi.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const createGetRequest = (
  bookmark_id: string
  // ): [Request, { params: { id: string } }] => {
): [Request, { params: Promise<{ bookmark_id: string }> }] => {
  return [
    new Request(`${API_BOOKMARKS_URL}${bookmark_id}`, { method: "Get" }),
    // { params: { id } },
    { params: Promise.resolve({ bookmark_id: bookmark_id.toString() }) },
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
    const targetBookmark = mockBookmarks[1];
    const [request, context] = createGetRequest(targetBookmark.bookmark_id.toString());
    const response = await GET(request, context);

    expect(response.status).toBe(HTTP_STATUS_OK);
    const json = await response.json();

    expectEqualBookmark(json, targetBookmark);
  });

  it("GET: 不正なIDの場合400エラーを返す", async () => {
    const [request, context] = createGetRequest("abc");
    const response = await GET(request, context);

    await assertErrorResponse(
      response,
      HTTP_STATUS_BAD_REQUEST,
      "IDは正の整数である必要があります。"
    );
  });

  it("GET: 存在しないIDの場合404エラーを返す", async () => {
    const [request, context] = createGetRequest("100");
    const response = await GET(request, context);

    await assertErrorResponse(
      response,
      HTTP_STATUS_NOT_FOUND,
      "指定されたブックマークがありません。"
    );
  });

  it("GET: データベースエラー時に500エラーを返す", async () => {
    const dbError = new Error("Database connection failed");
    vi.mocked(getDb).mockImplementation(() => {
      throw dbError;
    });

    const [request, context] = createGetRequest("1");
    const response = await GET(request, context);
    await assertErrorResponse(
      response,
      HTTP_STATUS_INTERNAL_SERVER_ERROR,
      "サーバー内部でエラーが発生しました。"
    );
  });

  it("GET: クエリエラー時に500エラーを返す", async () => {
    const queryError = new Error("Failed to execute query");
    // prepareメソッドをモックしてクエリエラーを発生させる
    const prepareSpy = vi.spyOn(inMemoryDbInstance, "prepare").mockImplementation(() => {
      throw queryError;
    });

    const [request, context] = createGetRequest("1");
    const response = await GET(request, context);
    await assertErrorResponse(
      response,
      HTTP_STATUS_INTERNAL_SERVER_ERROR,
      "サーバー内部でエラーが発生しました。"
    );

    prepareSpy.mockRestore();
  });
});
