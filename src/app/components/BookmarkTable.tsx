import React, { useMemo } from "react";

import {
  ROW_STYLE_BOOKMARK_SELECTED,
  ROW_STYLE_DEFAULT,
  ROW_STYLE_KEYWORD_SELECTED,
  TABLE_NAME_BOOKMARKS,
} from "../constants/constants";
import { Bookmark } from "../types/Bookmark";
import { Keyword } from "../types/Keyword";

/**
 * ブックマークに指定されたキーワードが含まれているかを確認します。
 * @param bookmark - 確認対象のブックマークオブジェクト
 * @param keywordIdentifier - キーワード名(string)またはキーワードID(number)
 * @returns キーワードが含まれていればtrue、そうでなければfalse
 */
export const hasKeyword = (bookmark: Bookmark, keywordIdentifier: string | number): boolean => {
  if (!bookmark || !bookmark.keywords) {
    return false;
  }

  if (typeof keywordIdentifier === "string") {
    return bookmark.keywords.some((k: Keyword) => k.keyword_name === keywordIdentifier);
  } else {
    return bookmark.keywords.some((k: Keyword) => k.keyword_id === keywordIdentifier);
  }
};

type BookmarkTableProps = {
  bookmarks: Bookmark[];
  selectedBookmarkId: number | undefined;
  onSelectBookmarkId: (bookmarkId: number) => void;
  selectedKeywordId: number | undefined;
  setSelectedKeywordId: (keywordId: number | undefined) => void;
  className?: string;
};

const ROW_STYLES = {
  selected: ROW_STYLE_BOOKMARK_SELECTED,
  keywordSelected: ROW_STYLE_KEYWORD_SELECTED,
  default: ROW_STYLE_DEFAULT,
};

type BookmarkRow = {
  bookmark: Bookmark;
  rowStyle: string;
};

const BASE_CELL_STYLE = "p-1 border border-gray-700";

export const BookmarkTable = ({
  bookmarks,
  selectedBookmarkId,
  onSelectBookmarkId,
  selectedKeywordId,
  setSelectedKeywordId,
  className = "",
}: BookmarkTableProps): React.ReactElement => {
  const bookmarkRows: BookmarkRow[] = useMemo(() => {
    return bookmarks.map((bookmark) => {
      const rowClasses = [];
      if (selectedBookmarkId === bookmark.bookmark_id) {
        rowClasses.push(ROW_STYLES.selected);
      } else if (selectedKeywordId && hasKeyword(bookmark, selectedKeywordId)) {
        rowClasses.push(ROW_STYLES.keywordSelected);
      } else {
        rowClasses.push(ROW_STYLES.default);
      }
      // 今後、他の条件に応じたクラスもここに追加できます
      return { bookmark, rowStyle: rowClasses.join(" ") };
    });
  }, [bookmarks, selectedBookmarkId, selectedKeywordId]);

  const handleSelectBookmark = (bookmarkId: number) => {
    onSelectBookmarkId(bookmarkId);
    setSelectedKeywordId(undefined);
  };

  return (
    <table aria-label={TABLE_NAME_BOOKMARKS} className={className}>
      <thead>
        <tr>
          <th
            className={`text-base font-bold bg-slate-700 text-gray-200 ${BASE_CELL_STYLE}`}
            scope="col"
          >
            タイトル
          </th>
        </tr>
      </thead>
      <tbody>
        {bookmarkRows.map(({ bookmark, rowStyle }) => {
          return (
            <tr
              key={bookmark.bookmark_id}
              onClick={() => handleSelectBookmark(bookmark.bookmark_id)}
              className="cursor-pointer"
            >
              <td className={`text-sm ${rowStyle} ${BASE_CELL_STYLE}`}>{bookmark.title}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
