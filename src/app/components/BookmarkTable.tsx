import React, { useMemo } from "react";

import { TABLE_NAME_BOOKMARKS } from "../constants/constants";
import { Bookmark } from "../types/Bookmark";

type BookmarkTableProps = {
  bookmarks: Bookmark[];
  selectedBookmarkId: number | undefined;
  onSelectBookmarkId: (bookmarkId: number) => void;
  className?: string;
};

const ROW_STYLES = {
  selected: "bg-sky-500 text-gray-100",
  default: "bg-gray-100 text-gray-900",
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
  className = "",
}: BookmarkTableProps): React.ReactElement => {
  const bookmarkRows: BookmarkRow[] = useMemo(() => {
    return bookmarks.map((bookmark) => {
      const rowStyle =
        selectedBookmarkId === bookmark.bookmark_id ? ROW_STYLES.selected : ROW_STYLES.default;
      return { bookmark, rowStyle };
    });
  }, [bookmarks, selectedBookmarkId]);

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
              onClick={() => onSelectBookmarkId(bookmark.bookmark_id)}
              className="cursor-pointer"
            >
              <td className={`text-sm ${rowStyle}  ${BASE_CELL_STYLE}`}>{bookmark.title}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
