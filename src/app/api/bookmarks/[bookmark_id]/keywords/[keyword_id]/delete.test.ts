import ActualDatabase from "better-sqlite3"; // Import the actual library
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HTTP_STATUS_NO_CONTENT } from "../../../../../constants/httpStatusCodes";
import {
  GMAIL_BOOKMARK,
  GMAIL_KEYWORD_1,
  GOOGLE_BOOKMARK,
  GOOGLE_KEYWORD_1,
  GOOGLE_KEYWORD_2,
} from "../../../../../test-utils/bookmarkTestUtils";
import { setupInMemoryDb } from "../../../../../test-utils/db-setup";
import { API_BOOKMARKS_URL } from "../../../../utils/constants";
import { getDb } from "../../../database";
import { DELETE } from "./route";

// We will mock getDb to return our in-memory instance.
// The actual getDb function is simple, but mocking allows us to inject the in-memory DB.
vi.mock("../../../database");

let inMemoryDbInstance: ActualDatabase.Database;

const createDeleteRequest = (
  bookmark_id: string,
  keyword_id: string
): [Request, { params: Promise<{ bookmark_id: string; keyword_id: string }> }] => {
  return [
    new Request(`${API_BOOKMARKS_URL}/${bookmark_id}/keywords/${keyword_id}`, {
      method: "DELETE",
    }),
    { params: Promise.resolve({ bookmark_id, keyword_id }) },
  ];
};

describe("ブックマークに設定されているキーワードの解除テスト (オンメモリDB)", () => {
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

  describe("正常系テスト: キーワードの解除に成功したら204(HTTP_STATUS_NO_CONTENT)を返す", () => {
    const successTestCases = [
      {
        description: "ブックマークに紐づくキーワードを1つ解除する",
        bookmarkToUnlink: GOOGLE_BOOKMARK,
        keywordToUnlink: GOOGLE_KEYWORD_1,
      },
      {
        description: "ブックマークに紐づくもう1つのキーワードを解除する",
        bookmarkToUnlink: GOOGLE_BOOKMARK,
        keywordToUnlink: GOOGLE_KEYWORD_2,
      },
      {
        description: "別のブックマークに紐づくキーワードを解除する",
        bookmarkToUnlink: GMAIL_BOOKMARK,
        keywordToUnlink: GMAIL_KEYWORD_1,
      },
    ];

    it.each(successTestCases)(
      "DELETE: $description",
      async ({ bookmarkToUnlink, keywordToUnlink }) => {
        // 解除前の件数を確認
        const associationBefore = inMemoryDbInstance
          .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? and keyword_id = ?")
          .get(bookmarkToUnlink.bookmark_id, keywordToUnlink.keyword_id);
        expect(associationBefore).toBeDefined();
        const keywordBefore = inMemoryDbInstance
          .prepare("SELECT * FROM keywords WHERE keyword_id = ?")
          .get(keywordToUnlink.keyword_id);
        expect(keywordBefore).toBeDefined();

        // 解除リクエストを作成
        const [request, context] = createDeleteRequest(
          bookmarkToUnlink.bookmark_id.toString(),
          keywordToUnlink.keyword_id.toString()
        );

        const response = await DELETE(request, context);

        // レスポンスステータスを確認 (204 No Content)
        expect(response.status).toBe(HTTP_STATUS_NO_CONTENT);

        // bookmark_keywordsテーブルから関連付けのみが削除されたことを確認する
        const associationAfter = inMemoryDbInstance
          .prepare("SELECT * FROM bookmark_keywords WHERE bookmark_id = ? and keyword_id = ?")
          .get(bookmarkToUnlink.bookmark_id, keywordToUnlink.keyword_id);
        expect(associationAfter).toBeUndefined();
        const keywordAfter = inMemoryDbInstance
          .prepare("SELECT * FROM keywords WHERE keyword_id = ?")
          .get(keywordToUnlink.keyword_id);
        expect(keywordAfter).toBeDefined();
      }
    );
  });
});
