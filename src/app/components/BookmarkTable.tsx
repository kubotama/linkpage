import React from "react";

import { BASE_CELL_STYLE, TABLE_NAME_BOOKMARKS, TITLE_CELL_STYLE } from "../constants/constants";
import { useBookmarkTable } from "../hooks/useBookmarkTable";
import { Bookmark } from "../types/Bookmark";

type BookmarkTableProps = {
  bookmarks: Bookmark[];
  tableName: string;
  selectedBookmarkId: number | undefined;
  onSelectBookmarkId: (bookmarkId: number) => void;
  selectedKeywordId: number | undefined;
  className?: string;
};

export const BookmarkTable = ({
  bookmarks,
  tableName,
  selectedBookmarkId,
  onSelectBookmarkId,
  selectedKeywordId,
  className = "",
}: BookmarkTableProps): React.ReactElement => {
  const { bookmarkRows, handleSelectBookmark } = useBookmarkTable({
    bookmarks,
    selectedBookmarkId,
    selectedKeywordId,
    onSelectBookmarkId,
  });

  return (
    <table aria-label={TABLE_NAME_BOOKMARKS} className={className}>
      <thead>
        <tr>
          <th className={`${TITLE_CELL_STYLE} ${BASE_CELL_STYLE}`} scope="col">
            {tableName}
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
