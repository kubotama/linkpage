import { useMemo } from "react";

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
  setSelectedKeywordId: (keywordId: number | undefined) => void;
};

export const useBookmarkTable = ({
  bookmarks,
  selectedBookmarkId,
  selectedKeywordId,
  onSelectBookmarkId,
  setSelectedKeywordId,
}: UseBookmarkTableProps) => {
  const handleSelectBookmark = (bookmarkId: number) => {
    onSelectBookmarkId(bookmarkId);
    setSelectedKeywordId(undefined);
  };

  const bookmarkRows: BookmarkRow[] = useMemo(() => {
    return bookmarks.map((bookmark) => {
      const rowStyle = (() => {
        if (selectedBookmarkId === bookmark.bookmark_id) {
          return ROW_STYLES.selected;
        }
        if (selectedKeywordId && hasKeyword(bookmark, selectedKeywordId)) {
          return ROW_STYLES.keywordSelected;
        }
        return ROW_STYLES.default;
      })();
      // 今後、他の条件に応じたクラスもここに追加できます
      return { bookmark, rowStyle };
    });
  }, [bookmarks, selectedBookmarkId, selectedKeywordId]);

  return { bookmarkRows, handleSelectBookmark };
};
