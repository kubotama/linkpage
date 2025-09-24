import { beforeEach, describe, expect, it } from "vitest";

import { renderHook } from "@testing-library/react";

import { buildMockBookmarksWithKeywords, mockKeywords } from "../test-utils/bookmarkTestUtils";
import { useBookmarksLogic } from "./useBookmarkLogic";
import { Bookmark } from "../types/Bookmark";

const mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();

const renderMyHook = (selectedBookmarkId?: number) => {
  return renderHook(() =>
    useBookmarksLogic({
      bookmarks: mockBookmarksWithKeywords,
      selectedBookmarkId,
      keywords: mockKeywords,
      textKeyword: "",
    })
  );
};

describe("useBookmarkLogic", () => {
  describe("ブックマークが選択されていない場合", () => {
    let result: { current: ReturnType<typeof useBookmarksLogic> };

    beforeEach(() => {
      const { result: hookResult } = renderMyHook();
      result = hookResult;
    });

    it("selectedBookmarkはundefinedであること", () => {
      expect(result.current.selectedBookmark).toBeUndefined();
    });

    it("selectedKeywordsはundefinedであること", () => {
      expect(result.current.selectedKeywords).toBeUndefined();
    });

    it("availableKeywordsはkeywordsと同じであること", () => {
      expect(result.current.availableKeywords).toEqual(mockKeywords);
    });
  });

  describe("ブックマークが選択されている場合", () => {
    it.each(mockBookmarksWithKeywords)(
      "$title: 対応するブックマークとキーワードが選択されること、設定可能なキーワードが表示される",
      (bookmark: Bookmark) => {
        // Arrange & Act
        const { result } = renderMyHook(bookmark.bookmark_id);

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
});
