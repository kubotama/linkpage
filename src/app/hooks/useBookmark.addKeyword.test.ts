import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import {
  buildMockBookmarksWithKeywords,
  createMockResponse,
  findBookmarkWithAtLeastNKeywords,
  GOOGLE_BOOKMARK,
  mockKeywords,
  NOLINKED_KEYWORD,
} from "../test-utils/bookmarkTestUtils";
import { useBookmarks } from "./useBookmark";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useBookmarks - addKeyword", () => {
  beforeEach(async () => {
    mockFetch.mockClear();
    const mockDataWithKeywords = buildMockBookmarksWithKeywords();
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockDataWithKeywords), { status: 200 })
    );
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockKeywords), { status: 200 }));
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
          message: "キーワードをブックマークに追加しました。",
          keyword_name: UNREGISTERED_KEYWORD,
          keyword_id: newKeywordId,
        })
      );
      const { result } = renderHook(() => useBookmarks());
      await act(async () => {
        await result.current.getBookmarks();
        await result.current.getKeywords();
      });
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(result.current.bookmarks, 0); // キーワードが0個のブックマークを選択

      // Actの前の状態を確認
      // 登録されているキーワードはテスト用のデータ
      expect(result.current.keywords).toEqual(mockKeywords);
      // 設定するキーワードはキーワードとして未登録
      expect(result.current.keywords.some((k) => k.keyword_name === UNREGISTERED_KEYWORD)).toBe(
        false
      );
      // 設定するブックマークにはキーワードとして登録されていない
      expect(GOOGLE_BOOKMARK.keywords.some((k) => k.keyword_name === UNREGISTERED_KEYWORD)).toBe(
        false
      );

      // Act
      await act(async () => {
        await result.current.addKeyword(bookmarkToSelect.bookmark_id, UNREGISTERED_KEYWORD);
      });

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${BOOKMARKS_ENDPOINT}/${bookmarkToSelect.bookmark_id}/keywords`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              keyword_name: UNREGISTERED_KEYWORD,
            }),
          }
        );
      });

      const afterKeywords = result.current.keywords;
      expect(afterKeywords).toHaveLength(mockKeywords.length + 1);
      const addedKeyword = afterKeywords[afterKeywords.length - 1];
      expect(addedKeyword.keyword_name).toBe(UNREGISTERED_KEYWORD);
      expect(addedKeyword.keyword_id).toBe(newKeywordId);
      // ブックマークの状態も更新されていることを確認
      const updatedBookmark = result.current.bookmarks.find(
        (b) => b.bookmark_id === bookmarkToSelect.bookmark_id
      );
      expect(updatedBookmark?.keywords.some((k) => k.keyword_name === UNREGISTERED_KEYWORD)).toBe(
        true
      );
    });

    it("登録済みのキーワードを設定する", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          message: "キーワードをブックマークに追加しました。",
          keyword_name: NOLINKED_KEYWORD.keyword_name,
          keyword_id: NOLINKED_KEYWORD.keyword_id,
        })
      );
      const { result } = renderHook(() => useBookmarks());
      await act(async () => {
        await result.current.getBookmarks();
        await result.current.getKeywords();
      });
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(result.current.bookmarks, 0); // キーワードが0個のブックマークを選択

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
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${BOOKMARKS_ENDPOINT}/${bookmarkToSelect.bookmark_id}/keywords`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              keyword_name: NOLINKED_KEYWORD.keyword_name,
            }),
          }
        );
      });
      const afterKeywords = result.current.keywords;
      expect(afterKeywords).toHaveLength(mockKeywords.length);
      expect(afterKeywords.some((k) => k.keyword_name === NOLINKED_KEYWORD.keyword_name)).toBe(
        true
      );
      // ブックマークの状態も更新されていることを確認
      const updatedBookmark = result.current.bookmarks.find(
        (b) => b.bookmark_id === bookmarkToSelect.bookmark_id
      );
      expect(
        updatedBookmark?.keywords.some((k) => k.keyword_name === NOLINKED_KEYWORD.keyword_name)
      ).toBe(true);
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
        status: 404,
        errorMessage: "指定されたブックマークがありません。",
      },
      {
        description: "キーワードが既に登録済み (409)",
        status: 409,
        errorMessage: "指定されたキーワードは既にこのブックマークに登録されています。",
      },
      // ... 他のエラーケース
      {
        description: "サーバー内部エラー (500)",
        status: 500,
        errorMessage: "サーバー内部でエラーが発生しました。",
      },
    ];
    it.each(errorTestCases)("$description", async ({ status, errorMessage }) => {
      // Arrange
      const { result } = renderHook(() => useBookmarks());
      await act(async () => {
        await result.current.getBookmarks();
        await result.current.getKeywords();
      });
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(result.current.bookmarks, 0); // キーワードが0個のブックマークを選択

      mockFetch.mockReset();
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
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          `${BOOKMARKS_ENDPOINT}/${bookmarkToSelect.bookmark_id}/keywords`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              keyword_name: NOLINKED_KEYWORD.keyword_name,
            }),
          }
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "キーワードの追加エラー:",
          expect.stringContaining(errorMessage)
        );
      });
    });
  });
});
