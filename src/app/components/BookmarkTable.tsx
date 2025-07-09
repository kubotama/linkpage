import React from "react";

import { Bookmark, SelectedBookmarkIndex } from "../types/Bookmark";

export const BookmarkTable: React.FC<{
  bookmarks: Bookmark[];
  selectedBookmarkIndex: SelectedBookmarkIndex;
  onSelectBookmarkIndex: (index: number) => void;
}> = ({
  bookmarks,
  selectedBookmarkIndex,
  onSelectBookmarkIndex: onSelectBookmark,
}) => {
  return (
    <div role="table" className="flex flex-col " aria-label="bookmarks table">
      <div
        className="p-1 text-base font-bold border border-gray-700 bg-slate-700 text-gray-200"
        role="columnheader"
      >
        タイトル
      </div>
      {bookmarks.map((bookmark, index) => {
        const isSelected = selectedBookmarkIndex === index;
        const conditionalClasses = isSelected
          ? "bg-sky-500 text-gray-100"
          : "bg-gray-100 text-gray-900";

        return (
          <div
            role="row"
            key={bookmark.bookmark_id}
            onClick={() => onSelectBookmark(index)}
          >
            <div
              className={`p-1 text-sm border border-gray-700 ${conditionalClasses}`}
              role="cell"
            >
              {bookmark.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};
