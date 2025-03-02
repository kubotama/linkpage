import React, { JSX, useEffect, useState } from "react";

import { BmRow, Bookmark } from "./bmRow"; // Import the Bookmark type

export const BmGrid: React.FC<{ bookmarks: Bookmark[] }> = ({ bookmarks }) => {
  const [bookmarkGrid, setBookmarkGrid] = useState<JSX.Element>(<div></div>);

  useEffect(() => {
    setBookmarkGrid(
      <div className="grid grid-cols-1">
        {bookmarks.map((bookmark, index) => (
          <BmRow key={index} bookmark={bookmark} />
        ))}
      </div>
    );
  }, [bookmarks]);

  return bookmarkGrid;
};
