import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setupInMemoryDb } from "../../../test-utils/db-setup";
import { mockBookmarks } from "../../../types/Bookmark";
import { getDb } from "../database";
import { DELETE } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
vi.mock("../database");

let inMemoryDbInstance: ActualDatabase.Database;

const API_URL = "http://localhost:3000/api/bookmark/";

const createDeleteRequest = (
  id: string
): [Request, { params: { id: string } }] => {
  return [
    new Request(`${API_URL}${id}`, { method: "DELETE" }),
    { params: { id } },
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
    const bookmarkToDelete = mockBookmarks[1]; // Google

    // データベースからIDを取得して確認
    const selectStmt = inMemoryDbInstance.prepare(
      "SELECT id FROM bookmarks WHERE url = ?"
    );
    const dbEntry = selectStmt.get(bookmarkToDelete.url) as { id: number };
    expect(dbEntry).toBeDefined();
    // const bookmarkIdToDelete = dbEntry.id;

    // 削除前の件数を確認
    const countBefore = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(countBefore).toBe(mockBookmarks.length);

    // 削除リクエストを作成
    const [request, context] = createDeleteRequest(
      bookmarkToDelete.id.toString()
    );
    const response = await DELETE(request, context);

    // レスポンスステータスを確認 (204 No Content)
    expect(response.status).toBe(204);

    // データベースから削除されたことを確認
    const deletedEntry = selectStmt.get(bookmarkToDelete.url);
    expect(deletedEntry).toBeUndefined();

    // 削除後の件数を確認
    const countAfter = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(countAfter).toBe(mockBookmarks.length - 1);
  });

  it("DELETE: 登録されていないブックマークIDを指定された場合は404を返す", async () => {
    const nonExistentId = 99999; // 存在しないID
    const [request, context] = createDeleteRequest(nonExistentId.toString());
    const response = await DELETE(request, context);

    expect(response.status).toEqual(404);
    const json = await response.json();
    expect(json.message).toEqual("指定されたブックマークがありません。");

    // ブックマーク数が変わっていないことを確認
    const count = (
      inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM bookmarks")
        .get() as { count: number }
    ).count;
    expect(count).toBe(mockBookmarks.length);
  });

  it("DELETE: データベースエラーの場合は500エラーを返す", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("DB error");
    });
    // const request = "invalid json data";
    // const response = await POST(request);
    const nonExistentId = 1; // 存在しないID
    const [request, context] = createDeleteRequest(nonExistentId.toString());
    const response = await DELETE(request, context);

    expect(response.status).toEqual(500);
    const json = await response.json();
    expect(json.message).toEqual("サーバー内部でエラーが発生しました。");
  });

  it("DELETE: 不正なIDの場合には400エラーを返す", async () => {
    // const request = createPostRequest(JSON.stringify({ title: "missing id" }));
    // const response = await POST(request);
    const nonExistentId = -1; // 不正なID
    const [request, context] = createDeleteRequest(nonExistentId.toString());
    const response = await DELETE(request, context);

    expect(response.status).toEqual(400);
    const json = await response.json();
    expect(json.message).toEqual("IDは正の整数である必要があります。");
  });
});
