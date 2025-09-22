import { useCallback, useMemo } from "react";

import {
  ROW_STYLE_BOOKMARK_SELECTED,
  ROW_STYLE_DEFAULT,
  ROW_STYLE_KEYWORD_SELECTED,
} from "../constants/constants";
import { Bookmark, hasKeyword } from "../types/Bookmark";

type BookmarkRow = {
  bookmark: Bookmark;
  rowStyle: string;
};
const ROW_STYLES = {
  selected: ROW_STYLE_BOOKMARK_SELECTED,
  keywordSelected: ROW_STYLE_KEYWORD_SELECTED,
  default: ROW_STYLE_DEFAULT,
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
      const rowStyle =
        selectedBookmarkId === bookmark.bookmark_id
          ? ROW_STYLES.selected
          : selectedKeywordId && hasKeyword(bookmark, selectedKeywordId)
          ? ROW_STYLES.keywordSelected
          : ROW_STYLES.default;
      // 今後、他の条件に応じたクラスもここに追加できます
      return { bookmark, rowStyle };
    });
  }, [bookmarks, selectedBookmarkId, selectedKeywordId]);

  return { bookmarkRows, handleSelectBookmark };
};
