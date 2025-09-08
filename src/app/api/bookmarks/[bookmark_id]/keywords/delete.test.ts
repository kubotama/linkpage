import ActualDatabase from "better-sqlite3"; // 実際のライブラリをインポート
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NO_CONTENT,
  HTTP_STATUS_NOT_FOUND,
} from "../../../../constants/httpStatusCodes";
import { assertErrorResponse } from "../../../../test-utils/assertions";
import { setupInMemoryDb } from "../../../../test-utils/db-setup";
import { isKeyword, KeywordPostParams } from "../../../../types/Keyword";
import { ErrorTestCase } from "../../../utils/types";
import { getDb } from "../../database";

vi.mock("../../database");
let DELETE: typeof import("./route").DELETE; // DELETE関数の型を宣言

let inMemoryDbInstance: ActualDatabase.Database;

const getContextParams = (bookmark_id: string): KeywordPostParams => {
  return {
    params: Promise.resolve({ bookmark_id }),
  };
};

describe("DELETE /api/bookmarks/[bookmark_id]/keywords", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();

    inMemoryDbInstance = setupInMemoryDb();

    vi.mocked(getDb).mockReturnValue(inMemoryDbInstance);

    // route.tsを動的にインポートし、DELETE関数を取得
    // これにより、route.tsがインポートされる時点でgetDbのモックが有効になります
    const routeModule = await import("./route");
    DELETE = routeModule.DELETE;
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

  describe("正常系テスト", () => {
    it("キーワードの解除に成功したら204(HTTP_STATUS_NO_CONTENT)を返す", async () => {
      // Arrange
      const bookmarkId = 2;
      const keywordId = 1;
      // 事前にBookmark ID=2でKeyword ID=1がDB上にあることを確認する
      const countBefore = inMemoryDbInstance
        .prepare(
          "SELECT COUNT(*) as count FROM bookmark_keywords WHERE bookmark_id = ? and keyword_id = ?"
        )
        .get([bookmarkId, keywordId]) as { count: number };
      expect(countBefore.count).toBe(1);
      const keywordBefore = inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM keywords WHERE keyword_id = ?")
        .get(keywordId) as { count: number };
      expect(keywordBefore.count).toBe(1);

      const request = mockRequest({ keyword_id: keywordId });

      // // Act
      const response = await DELETE(request, getContextParams(bookmarkId.toString()));

      // Assert
      expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);

      // Bookmark ID=2でKeyword ID=1が削除されたことを確認する
      const countAfter = inMemoryDbInstance
        .prepare(
          "SELECT COUNT(*) as count FROM bookmark_keywords WHERE bookmark_id = ? and keyword_id = ?"
        )
        .get([bookmarkId, keywordId]) as { count: number };
      expect(countAfter.count).toBe(0);
      const keywordAfter = inMemoryDbInstance
        .prepare("SELECT COUNT(*) as count FROM keywords WHERE keyword_id = ?")
        .get(keywordId) as { count: number };
      expect(keywordAfter.count).toBe(1);
    });
  });
});
