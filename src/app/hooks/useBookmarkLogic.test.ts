import { describe, expect, it } from "vitest";

import { renderHook } from "@testing-library/react";

import { mockBookmarks, mockKeywords } from "../test-utils/bookmarkTestUtils";
import { useBookmarksLogic } from "./useBookmarkLogic";

describe("useBookmarkLogic", () => {
  describe("ブックマークが選択されていない場合", () => {
    const { result } = renderHook(() =>
      useBookmarksLogic({
        bookmarks: mockBookmarks,
        selectedBookmarkId: undefined,
        keywords: mockKeywords,
        textKeyword: "",
      })
    );

    it("selectedBookmarkはundefinedであること", () => {
      expect(result.current.selectedBookmark).toBeUndefined();
    });

    it("selectedKeywordsはundefinedであること", () => {
      expect(result.current.selectedKeywords).toBeUndefined();
    });
  });

  describe("ブックマークが選択されている場合", () => {
    it.each(mockBookmarks)(
      "$title: 対応するブックマークとキーワードが選択されること",
      (bookmark) => {
        const { result } = renderHook(() =>
          useBookmarksLogic({
            bookmarks: mockBookmarks,
            selectedBookmarkId: bookmark.bookmark_id,
            keywords: mockKeywords,
            textKeyword: "",
          })
        );
        expect(result.current.selectedBookmark).toEqual(bookmark);
        expect(result.current.selectedKeywords).toEqual(bookmark.keywords);
      }
    );
  });
});
