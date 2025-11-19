import React from "react";

import { BASE_CELL_STYLE, TITLE_CELL_STYLE } from "../constants/constants";
import { useBookmarkTable } from "../hooks/useBookmarkTable";
import { Bookmark } from "../types/Bookmark";
import { DraggableTableRow } from "./DraggableTableRow";

type BookmarkTableProps = {
  bookmarks: Bookmark[];
  tableName: string;
  selectedBookmarkId: number | undefined;
  onSelectBookmarkId: (bookmarkId: number) => void;
  selectedKeywordId: number | undefined;
  className?: string;
  isDraggable?: boolean;
};

export const BookmarkTable = ({
  bookmarks,
  tableName,
  selectedBookmarkId,
  onSelectBookmarkId,
  selectedKeywordId,
  className = "",
  isDraggable,
}: BookmarkTableProps): React.ReactElement => {
  const { bookmarkRows, handleSelectBookmark } = useBookmarkTable({
    bookmarks,
    selectedBookmarkId,
    selectedKeywordId,
    onSelectBookmarkId,
  });

  return (
    <table aria-label={tableName} className={className}>
      <thead>
        <tr>
          <th className={`${TITLE_CELL_STYLE} ${BASE_CELL_STYLE}`} scope="col">
            {tableName}
          </th>
        </tr>
      </thead>
      <tbody>
        {isDraggable
          ? bookmarkRows.map(({ bookmark, rowStyle }) => (
              <DraggableTableRow
                key={bookmark.bookmark_id}
                bookmark={bookmark}
                rowStyle={rowStyle}
                onSelectBookmark={handleSelectBookmark}
              />
            ))
          : bookmarkRows.map(({ bookmark, rowStyle }) => (
              <tr
                key={bookmark.bookmark_id}
                onClick={() => handleSelectBookmark(bookmark.bookmark_id)}
                className="cursor-pointer"
              >
                <td className={`text-sm ${rowStyle} ${BASE_CELL_STYLE}`}>{bookmark.title}</td>
              </tr>
            ))}
      </tbody>
    </table>
  );
};
