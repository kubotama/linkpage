import { describe, expect, it } from "vitest";

import { renderHook } from "@testing-library/react";

import {
  buildMockBookmarksWithKeywords,
  LINKED_KEYWORD,
  mockKeywords,
  NOLINKED_KEYWORD,
} from "../test-utils/bookmarkTestUtils";
import { useBookmarksLogic } from "./useBookmarkLogic";
import { Bookmark } from "../types/Bookmark";

const mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();

type RenderMyHookProps = {
  selectedBookmarkId?: number;
  selectedKeywordId?: number;
  textKeyword?: string;
};

const renderMyHook = ({
  selectedBookmarkId,
  selectedKeywordId,
  textKeyword = "",
}: RenderMyHookProps = {}) => {
  return renderHook(() =>
    useBookmarksLogic({
      bookmarks: mockBookmarksWithKeywords,
      selectedBookmarkId,
      selectedKeywordId,
      keywords: mockKeywords,
      textKeyword,
    })
  );
};

describe("useBookmarkLogic", () => {
  describe("ブックマークが選択されていない場合", () => {
    it("selectedBookmarkはundefinedであること", () => {
      const { result } = renderMyHook();
      expect(result.current.selectedBookmark).toBeUndefined();
    });

    it("selectedKeywordsはundefinedであること", () => {
      const { result } = renderMyHook();
      expect(result.current.selectedKeywords).toBeUndefined();
    });

    it("availableKeywordsはkeywordsと同じであること", () => {
      const { result } = renderMyHook();
      expect(result.current.availableKeywords).toEqual(mockKeywords);
    });

    it("isEnableAddKeywordButtonはfalseであること", () => {
      const { result } = renderMyHook();
      expect(result.current.isEnableAddKeywordButton).toBe(false);
    });
  });

  describe("ブックマークが選択されている場合", () => {
    it.each(mockBookmarksWithKeywords)(
      "$title: 対応するブックマークとキーワードが選択されること、設定可能なキーワードが表示される",
      (bookmark: Bookmark) => {
        // Arrange & Act
        const { result } = renderMyHook({ selectedBookmarkId: bookmark.bookmark_id });

        // Assert
        expect(result.current.selectedBookmark).toEqual(bookmark);
        expect(result.current.selectedKeywords).toEqual(bookmark.keywords);
        expect(result.current.availableKeywords).toEqual(
          mockKeywords.filter(
            (k) => !bookmark.keywords.some((bk) => bk.keyword_id === k.keyword_id)
          )
        );
      }
    );
  });

  describe("isEnableAddKeywordButtonのテスト", () => {
    const testKeywordCases: { description: string; textKeyword: string; expected: boolean }[] = [
      {
        description: "キーワードが空文字の場合、ボタンは無効であること",
        textKeyword: "",
        expected: false,
      },
      {
        description: "未登録のキーワードの場合、ボタンは有効であること",
        textKeyword: "新しいキーワード",
        expected: true,
      },
      {
        description: "登録済みのキーワードの場合、ボタンは無効であること",
        textKeyword: "キーワード1",
        expected: false,
      },
      {
        description: "登録済みのキーワード（前後に空白あり）の場合、ボタンは無効であること",
        textKeyword: "  キーワード1  ",
        expected: false,
      },
      {
        description: "キーワードが空白のみの場合、ボタンは無効であること",
        textKeyword: "   ",
        expected: false,
      },
    ];
    it.each(testKeywordCases)("$description: 入力されたキーワード", ({ textKeyword, expected }) => {
      // Arrange & Act
      const { result } = renderMyHook({ textKeyword });

      // Assert
      expect(result.current.isEnableAddKeywordButton).toBe(expected);
    });
  });

  describe("選択されたキーワードが設定されているブックマーク(linkedBookmarkWithSelectedKeywords)のテスト", () => {
    it("キーワードが選択されていない場合にはundefinedを返すこと", () => {
      // Arrange & Act
      const { result } = renderMyHook();

      // Assert
      expect(result.current.linkedBookmarkWithSelectedKeywords).toBeUndefined();
    });

    describe("キーワードが選択されている場合", () => {
      it("ブックマークに設定されていないキーワード", () => {
        // Arrange & Act
        const { result } = renderMyHook({ selectedKeywordId: NOLINKED_KEYWORD.keyword_id });

        // Assert
        expect(result.current.linkedBookmarkWithSelectedKeywords).toEqual([]);
      });

      it("ブックマークに設定されているキーワード", () => {
        // Arrange & Act
        const { result } = renderMyHook({ selectedKeywordId: LINKED_KEYWORD.keyword_id });

        // Assert
        expect(result.current.linkedBookmarkWithSelectedKeywords).toEqual([
          mockBookmarksWithKeywords[1],
        ]);
      });
    });
  });
});
