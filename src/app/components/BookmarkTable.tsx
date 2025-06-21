import React from "react";

import { Bookmark, SelectedBookmark } from "../types/Bookmark";

export const BookmarkTable: React.FC<{
  bookmarks: Bookmark[];
  onSelectBookmark: (bookmark: SelectedBookmark) => void;
}> = ({ bookmarks, onSelectBookmark }) => {
  return (
    <div role="table" className="flex flex-col " aria-label="bookmarks table">
      <div className="p-1 text-base border border-gray-700" role="columnheader">
        タイトル
      </div>
      {bookmarks.map((bookmark) => (
        <div
          role="row"
          key={bookmark.id}
          onClick={() => onSelectBookmark(bookmark)}
        >
          <div className="p-1 text-sm border border-gray-700" role="cell">
            {bookmark.title}
          </div>
        </div>
      ))}
    </div>
  );
};
