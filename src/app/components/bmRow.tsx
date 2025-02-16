import React from "react";

export type Bookmark = {
  url: string;
  title: string;
};

export const BmRow: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => {
  return (
    <div className="grid-item">
      <a href={bookmark.url} target="_blank">
        {bookmark.title}
      </a>
    </div>
  );
};
