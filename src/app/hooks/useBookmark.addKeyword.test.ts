import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import {
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
} from "../constants/httpStatusCodes";
import {
  buildMockBookmarksWithKeywords,
  createMockResponse,
  mockKeywords,
  NOLINKED_KEYWORD,
} from "../test-utils/bookmarkTestUtils";
import { useBookmarks } from "./useBookmark";

const assertAddKeywordApiCall = async (bookmarkId: number, keywordName: string) => {
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      `${BOOKMARKS_ENDPOINT}/${bookmarkId}/keywords`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword_name: keywordName }),
      })
    );
  });
};

const assertBookmarkUpdatedWithKeyword = (bookmarkId: number, keywordName: string) => {
  const updatedBookmark = result.current.bookmarks.find((b) => b.bookmark_id === bookmarkId);
  expect(updatedBookmark?.keywords.some((k) => k.keyword_name === keywordName)).toBe(true);
};

const mockFetch = vi.fn();
let result: { current: ReturnType<typeof useBookmarks> };

global.fetch = mockFetch;

describe("useBookmarks - addKeyword", () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    const mockDataWithKeywords = buildMockBookmarksWithKeywords();
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockDataWithKeywords), { status: HTTP_STATUS_OK })
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockKeywords), { status: HTTP_STATUS_OK })
    );

    const { result: hookResult } = renderHook(() => useBookmarks());
    result = hookResult;

    await act(async () => {
      await result.current.getBookmarks();
      await result.current.getKeywords();
    });
    mockFetch.mockClear(); // mockReset() から mockClear() へ変更
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("正常系のテスト", () => {
    const UNREGISTERED_KEYWORD = "未登録のキーワード";

    it("未登録のキーワードを追加する", async () => {
      // Arrange
      const newKeywordId = 99;
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          keyword_id: newKeywordId,
          keyword_name: UNREGISTERED_KEYWORD,
          status: HTTP_STATUS_CREATED,
        })
      );
      const bookmarkToSelect = result.current.bookmarks.find((b) => b.keywords.length === 0)!;

      // Actの前の状態を確認
      expect(bookmarkToSelect).toBeDefined();
      // 登録されているキーワードはテスト用のデータ
      expect(result.current.keywords).toEqual(mockKeywords);
      // 設定するキーワードはキーワードとして未登録
      expect(result.current.keywords.some((k) => k.keyword_name === UNREGISTERED_KEYWORD)).toBe(
        false
      );
      // 設定するブックマークにはキーワードとして登録されていない
      expect(bookmarkToSelect.keywords.some((k) => k.keyword_name === UNREGISTERED_KEYWORD)).toBe(
        false
      );

      // Act
      await act(async () => {
        await result.current.addKeyword(bookmarkToSelect.bookmark_id, UNREGISTERED_KEYWORD);
      });

      // Assert
      await assertAddKeywordApiCall(bookmarkToSelect.bookmark_id, UNREGISTERED_KEYWORD);

      const afterKeywords = result.current.keywords;
      expect(afterKeywords).toHaveLength(mockKeywords.length + 1);
      const addedKeyword = afterKeywords[afterKeywords.length - 1];
      expect(addedKeyword.keyword_name).toBe(UNREGISTERED_KEYWORD);
      expect(addedKeyword.keyword_id).toBe(newKeywordId);
      // ブックマークの状態も更新されていることを確認
      assertBookmarkUpdatedWithKeyword(bookmarkToSelect.bookmark_id, UNREGISTERED_KEYWORD);
    });

    it("登録済みのキーワードを設定する", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          keyword_id: NOLINKED_KEYWORD.keyword_id,
          keyword_name: NOLINKED_KEYWORD.keyword_name,
          status: HTTP_STATUS_CREATED,
        })
      );
      const bookmarkToSelect = result.current.bookmarks.find((b) => b.keywords.length === 0)!;
      expect(bookmarkToSelect).toBeDefined();
      // Actの前の状態を確認
      // 登録されているキーワードはテスト用のデータ
      expect(result.current.keywords).toEqual(mockKeywords);
      // 設定するキーワードはキーワードとして登録済み
      expect(
        result.current.keywords.some((k) => k.keyword_name === NOLINKED_KEYWORD.keyword_name)
      ).toBe(true);
      // 設定するブックマークにはキーワードとして登録されていない
      expect(
        bookmarkToSelect.keywords.some((k) => k.keyword_name === NOLINKED_KEYWORD.keyword_name)
      ).toBe(false);
      // Act
      await act(async () => {
        await result.current.addKeyword(
          bookmarkToSelect.bookmark_id,
          NOLINKED_KEYWORD.keyword_name
        );
      });

      // Assert
      await assertAddKeywordApiCall(bookmarkToSelect.bookmark_id, NOLINKED_KEYWORD.keyword_name);

      const afterKeywords = result.current.keywords;
      expect(afterKeywords).toHaveLength(mockKeywords.length);
      expect(afterKeywords.some((k) => k.keyword_name === NOLINKED_KEYWORD.keyword_name)).toBe(
        true
      );
      // ブックマークの状態も更新されていることを確認
      assertBookmarkUpdatedWithKeyword(bookmarkToSelect.bookmark_id, NOLINKED_KEYWORD.keyword_name);
    });

    it("既存のキーワードの名前が変更された場合に更新する", async () => {
      // Arrange
      const keywordToUpdate = result.current.keywords[0];
      const updatedKeywordName = "更新されたキーワード名";
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          keyword_id: keywordToUpdate.keyword_id,
          keyword_name: updatedKeywordName,
          status: HTTP_STATUS_CREATED,
        })
      );
      const bookmarkToSelect = result.current.bookmarks.find((b) => b.keywords.length === 0)!;

      // Act
      await act(async () => {
        await result.current.addKeyword(bookmarkToSelect.bookmark_id, updatedKeywordName);
      });

      // Assert
      await assertAddKeywordApiCall(bookmarkToSelect.bookmark_id, updatedKeywordName);
      const updatedKeyword = result.current.keywords.find(
        (k) => k.keyword_id === keywordToUpdate.keyword_id
      );
      expect(updatedKeyword?.keyword_name).toBe(updatedKeywordName);
      expect(result.current.keywords).toHaveLength(mockKeywords.length);
      // ブックマークの状態も更新されていることを確認
      assertBookmarkUpdatedWithKeyword(bookmarkToSelect.bookmark_id, updatedKeywordName);
    });
  });

  describe("エラーの出力をテストする", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    const errorTestCases: { description: string; status: number; errorMessage: string }[] = [
      {
        description: "指定されたブックマークが見つからない (404)",
        status: HTTP_STATUS_NOT_FOUND,
        errorMessage: "指定されたブックマークがありません。",
      },
      {
        description: "キーワードが既に登録済み (409)",
        status: HTTP_STATUS_CONFLICT,
        errorMessage: "指定されたキーワードは既にこのブックマークに登録されています。",
      },
      {
        description: "サーバー内部エラー (500)",
        status: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        errorMessage: "サーバー内部でエラーが発生しました。",
      },
    ];
    it.each(errorTestCases)("$description", async ({ status, errorMessage }) => {
      // Arrange
      const bookmarkToSelect = result.current.bookmarks.find((b) => b.keywords.length === 0)!;

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          message: errorMessage,
          status: status,
          isOk: false,
        })
      );
      // Act
      await expect(
        result.current.addKeyword(bookmarkToSelect.bookmark_id, NOLINKED_KEYWORD.keyword_name)
      ).rejects.toThrow();

      // Assert
      assertAddKeywordApiCall(bookmarkToSelect.bookmark_id, NOLINKED_KEYWORD.keyword_name);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "キーワードの追加エラー:",
        expect.stringContaining(errorMessage)
      );
    });
  });
});
