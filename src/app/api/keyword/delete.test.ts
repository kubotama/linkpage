import ActualDatabase from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { setupInMemoryDb } from "../../test-utils/db-setup";
import { mockKeywords } from "../../types/Keywords";
import { getDb } from "../bookmark/database";
import { DELETE } from "./[id]/route";

vi.mock("../bookmark/database");

let inMemoryDbInstance: ActualDatabase.Database;

const API_URL = "http://localhost:3000/api/keyword/1";

const createDeleteRequest = (
  id: string
): [Request, { params: { id: string } }] => {
  return [new Request(API_URL, { method: "DELETE" }), { params: { id } }];
};

describe("キーワードDELETE APIのテスト", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    inMemoryDbInstance = setupInMemoryDb(mockKeywords);
    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);
  });

  afterEach(() => {
    if (inMemoryDbInstance) {
      inMemoryDbInstance.close();
    }
  });

  it("DELETE: 正常にキーワードが削除できる", async () => {
    const [req, ctx] = createDeleteRequest("1");
    const response = await DELETE(req, ctx);
    expect(response.status).toBe(204);
    // 削除後にもう一度削除を試みると404になることを確認
    const response2 = await DELETE(req, ctx);
    expect(response2.status).toBe(404);
  });

  it("DELETE: 存在しないIDの場合404を返す", async () => {
    const [req, ctx] = createDeleteRequest("9999");
    const response = await DELETE(req, ctx);
    expect(response.status).toBe(404);
  });

  it("DELETE: 不正なIDの場合400を返す", async () => {
    const [req, ctx] = createDeleteRequest("abc");
    const response = await DELETE(req, ctx);
    expect(response.status).toBe(400);
  });

  it("DELETE: DBエラー時は500を返す", async () => {
    // 修正: vi.MockedFunction ではなく Mock 型を使用
    (getDb as Mock).mockImplementation(() => {
      throw new Error("DB error");
    });
    const [req, ctx] = createDeleteRequest("1");
    const response = await DELETE(req, ctx);
    expect(response.status).toBe(500);
  });
});
