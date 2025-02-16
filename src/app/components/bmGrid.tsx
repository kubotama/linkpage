import React, { useState, useEffect } from "react";

import { BmRow } from "./bmRow";
import { Bookmark } from "./bmRow";

export const BmGrid: React.FC<{ bookmarks: Bookmark[] }> = ({ bookmarks }) => {
  const [bookmarkGrid, setBookmarkGrid] = useState(<div></div>);

  useEffect(() => {
    setBookmarkGrid(() => (
      <>
        {bookmarks.map((bookmark, index) => (
          <BmRow key={index} bookmark={bookmark} />
        ))}
      </>
    ));
  }, [bookmarks]);

  return <div className="grid grid-cols-1">{bookmarkGrid}</div>;
};
