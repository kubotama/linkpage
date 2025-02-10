import React, { useState, useEffect } from "react";

import { BmRow } from "./bmRow";

export type Bookmark = {
  url: string;
  title: string;
};

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
