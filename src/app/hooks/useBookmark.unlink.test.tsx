import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import {
  buildMockBookmarksWithKeywords,
  mockBookmarks,
  GOOGLE_BOOKMARK,
  GOOGLE_KEYWORD_1,
} from "../test-utils/bookmarkTestUtils";
import { useBookmarks } from "./useBookmark";

global.fetch = vi.fn();

describe("useBookmarks - unlinkKeyword", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  it("should unlink a keyword from a bookmark and update the state", async () => {
    // Arrange
    const bookmarkId = GOOGLE_BOOKMARK.bookmark_id;
    const keywordId = GOOGLE_KEYWORD_1.keyword_id;
    const mockDataWithKeywords = buildMockBookmarksWithKeywords();
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(mockDataWithKeywords), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const { result } = renderHook(() => useBookmarks());

    // Act
    await act(async () => {
      await result.current.getBookmarks();
    });

    expect(result.current.bookmarks.length).toBe(mockDataWithKeywords.length);
    const bookmarkBeforeUnlink = result.current.bookmarks.find((b) => b.bookmark_id === bookmarkId);
    expect(bookmarkBeforeUnlink?.keywords.some((k) => k.keyword_id === keywordId)).toBe(true);

    // Act
    await act(async () => {
      await result.current.unlinkKeyword(bookmarkId, keywordId);
    });

    // Assert: キーワードが解除されたことを確認
    await waitFor(() => {
      const updatedBookmark = result.current.bookmarks.find((b) => b.bookmark_id === bookmarkId);
      expect(updatedBookmark?.keywords.some((k) => k.keyword_id === keywordId)).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith(
      `${BOOKMARKS_ENDPOINT}/${bookmarkId}/keywords/${keywordId}`,
      {
        method: "DELETE",
      }
    );
  });

  describe("エラーの出力をテストする", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const errorTestCase: { description: string; status?: number; errorMessage: string }[] = [
      {
        description: "指定されたブックマークとキーワードの関連付けが見つからない",
        status: 404,
        errorMessage: "指定されたブックマークに指定されたキーワードが設定されていません。",
      },
      {
        description: "keyword_idが未指定、または空",
        status: 400,
        errorMessage: "キーワードを指定してください。",
      },
      {
        description: "bookmark_idが未指定、または空",
        status: 400,
        errorMessage: "ブックマークを指定してください。",
      },
      {
        description: "bookmark_idが不正な値",
        status: 400,
        errorMessage: "ID は正の整数である必要があります。",
      },
      {
        description: "keyword_idが不正な値",
        status: 400,
        errorMessage: "ID は正の整数である必要があります。",
      },
      {
        description: "サーバー内部の予期せぬエラーの場合",
        status: 500,
        errorMessage: "サーバー内部でエラーが発生しました。",
      },
    ];

    it.each(errorTestCase)("$description", async ({ status, errorMessage }) => {
      // Arrange
      const bookmarkId = 1;
      const keywordId = 1;
      const logMessage = `ApiError: [${status}] ${errorMessage}`;
      vi.mocked(fetch)
        .mockResolvedValueOnce(new Response(JSON.stringify(mockBookmarks), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ message: errorMessage }), { status }));

      const { result } = renderHook(() => useBookmarks());

      // Act
      await act(async () => {
        await result.current.getBookmarks();
      });

      // Assert
      expect(result.current.bookmarks.length).toBe(mockBookmarks.length);

      // Act & Assert
      await expect(result.current.unlinkKeyword(bookmarkId, keywordId)).rejects.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        `${BOOKMARKS_ENDPOINT}/${bookmarkId}/keywords/${keywordId}`,
        {
          method: "DELETE",
        }
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith("キーワードの解除エラー:", logMessage);
    });
  });
});
