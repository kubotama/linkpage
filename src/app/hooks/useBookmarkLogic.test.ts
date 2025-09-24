import { describe, expect, it } from "vitest";

import { renderHook } from "@testing-library/react";

import { mockBookmarks, mockKeywords } from "../test-utils/bookmarkTestUtils";
import { useBookmarksLogic } from "./useBookmarkLogic";

describe("useBookmarkLogic", () => {
  describe("selectedBookmark", () => {
    it("ブックマークが選択されていない場合", () => {
      const bookmarks = mockBookmarks;
      const { result } = renderHook(() =>
        useBookmarksLogic({
          bookmarks,
          selectedBookmarkId: undefined,
          keywords: mockKeywords,
          textKeyword: "",
        })
      );

      expect(result.current.selectedBookmark).toBeUndefined();
    });

    it.each(mockBookmarks)("ブックマークが選択されている場合: $title", (bookmark) => {
      const { result } = renderHook(() =>
        useBookmarksLogic({
          bookmarks: mockBookmarks,
          selectedBookmarkId: bookmark.bookmark_id,
          keywords: mockKeywords,
          textKeyword: "",
        })
      );
      expect(result.current.selectedBookmark).toEqual(bookmark);
    });
  });
});
