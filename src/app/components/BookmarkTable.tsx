import React from "react";

import { Bookmark, SelectedBookmark } from "../types/Bookmark";

export const BookmarkTable: React.FC<{
  bookmarks: Bookmark[];
  onSelectBookmark: (bookmark: SelectedBookmark) => void;
}> = ({ bookmarks, onSelectBookmark }) => {
  return (
    <div role="table" className="flex flex-col " aria-label="bookmarks table">
      <div className="p-1 text-base border">タイトル</div>
      <div className="flex flex-col">
        {bookmarks.map((bookmark, index) => (
          <div
            className="p-1 text-sm border"
            key={index}
            onClick={() => onSelectBookmark(bookmark)}
          >
            {bookmark.title}
          </div>
        ))}
      </div>
    </div>
  );
};
