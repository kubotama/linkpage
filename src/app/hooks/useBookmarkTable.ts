import { useCallback, useMemo } from "react";

import {
  ROW_STYLE_BOOKMARK_SELECTED,
  ROW_STYLE_BOOKMARK_UNSELECTED,
  ROW_STYLE_KEYWORD_SELECTED,
  ROW_STYLE_KEYWORD_UNSELECTED,
} from "../constants/constants";
import { Bookmark, hasKeyword } from "../types/Bookmark";

type BookmarkRow = {
  bookmark: Bookmark;
  rowStyle: string;
};
const ROW_STYLES = {
  bookmarkSelected: ROW_STYLE_BOOKMARK_SELECTED,
  bookmarkUnselected: ROW_STYLE_BOOKMARK_UNSELECTED,
  keywordSelected: ROW_STYLE_KEYWORD_SELECTED,
  keywordUnselected: ROW_STYLE_KEYWORD_UNSELECTED,
};

type UseBookmarkTableProps = {
  bookmarks: Bookmark[];
  selectedBookmarkId: number | undefined;
  selectedKeywordId: number | undefined;
  onSelectBookmarkId: (bookmarkId: number) => void;
};

export const useBookmarkTable = ({
  bookmarks,
  selectedBookmarkId,
  selectedKeywordId,
  onSelectBookmarkId,
}: UseBookmarkTableProps) => {
  const handleSelectBookmark = useCallback(
    (bookmarkId: number) => {
      onSelectBookmarkId(bookmarkId);
    },
    [onSelectBookmarkId]
  );

  const bookmarkRows: BookmarkRow[] = useMemo(() => {
    return bookmarks.map((bookmark) => {
      const rowClasses: string[] = [];
      rowClasses.push(
        selectedBookmarkId === bookmark.bookmark_id
          ? ROW_STYLES.bookmarkSelected
          : ROW_STYLES.bookmarkUnselected
      );

      rowClasses.push(
        selectedKeywordId !== undefined && hasKeyword(bookmark, selectedKeywordId)
          ? ROW_STYLES.keywordSelected
          : ROW_STYLES.keywordUnselected
      );
      // 今後、他の条件に応じたクラスもここに追加できます
      return { bookmark, rowStyle: rowClasses.join(" ") };
    });
  }, [bookmarks, selectedBookmarkId, selectedKeywordId]);

  return { bookmarkRows, handleSelectBookmark };
};
