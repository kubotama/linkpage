import React, { JSX, useEffect, useState } from "react";

// import { BmRow } from "./bmRow";
import { Bookmark } from "./BookmarkManager";

export const BmGrid: React.FC<{ bookmarks: Bookmark[] }> = ({ bookmarks }) => {
  const [bookmarkGrid, setBookmarkGrid] = useState<JSX.Element>(<div></div>);

  useEffect(() => {
    setBookmarkGrid(
      <div className="grid grid-cols-1">
        {bookmarks.map((bookmark, index) => (
          <div key={index} className="grid-item">
            <a href={bookmark.url} target="_blank">
              {bookmark.title}
            </a>
          </div>
        ))}
      </div>
    );
  }, [bookmarks]);

  return bookmarkGrid;
};
