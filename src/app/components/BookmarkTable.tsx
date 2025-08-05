import React from "react";

import { Bookmark } from "../types/Bookmark";

export const BookmarkTable: React.FC<{
  bookmarks: Bookmark[];
  selectedBookmarkId: number | undefined;
  onSelectBookmarkId: (bookmark_id: number) => void;
}> = ({ bookmarks, selectedBookmarkId, onSelectBookmarkId }) => {
  return (
    <table aria-label="bookmarks">
      <thead className="p-1 text-base font-bold border border-gray-700 bg-slate-700 text-gray-200">
        <tr>
          <th scope="col">タイトル</th>
        </tr>
      </thead>
      <tbody>
        {bookmarks.map((bookmark) => {
          const isSelected = selectedBookmarkId === bookmark.bookmark_id;
          const conditionalClasses = isSelected
            ? "bg-sky-500 text-gray-100"
            : "bg-gray-100 text-gray-900";

          return (
            <tr
              key={bookmark.bookmark_id}
              onClick={() => onSelectBookmarkId(bookmark.bookmark_id)}
              className="cursor-pointer"
            >
              <td className={`p-1 text-sm border border-gray-700 ${conditionalClasses}`}>
                {bookmark.title}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
