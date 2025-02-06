import React, { useState, useEffect } from "react";

import fetch from "cross-fetch";
import { BmRow } from "./bmRow";

export type Bookmark = {
  url: string;
  title: string;
};

export const Bookmarks = async (): Promise<Bookmark[]> => {
  const response = await fetch("http://localhost:3001/bookmark.json");
  return await response.json();
};

export const BmGrid = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkGrid, setBookmarkGrid] = useState(<div></div>);

  if (bookmarks.length === 0) {
    Bookmarks().then((bookmarks) => setBookmarks(bookmarks));
  }

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
