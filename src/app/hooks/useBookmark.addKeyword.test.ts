import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { act, renderHook } from "@testing-library/react";

import {
  buildMockBookmarksWithKeywords,
  createMockResponse,
  GOOGLE_BOOKMARK,
  mockKeywords,
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

      // Actの前の状態を確認
      expect(result.current.keywords).toEqual(mockKeywords);
      expect(result.current.keywords.some((k) => k.keyword_name === UNREGISTERED_KEYWORD)).toBe(
        false
      );
      // Act
      await act(async () => {
        await result.current.addKeyword(GOOGLE_BOOKMARK.bookmark_id, UNREGISTERED_KEYWORD);
      });

      // Assert
      const afterKeywords = result.current.keywords;
      expect(afterKeywords).toHaveLength(mockKeywords.length + 1);
      const addedKeyword = afterKeywords[afterKeywords.length - 1];
      expect(addedKeyword.keyword_name).toBe("未登録のキーワード");
      expect(addedKeyword.keyword_id).toBe(newKeywordId);
    });
    it("登録済みのキーワードを設定する", () => {});
  });

  describe("エラーの出力をテストする", () => {});
});
