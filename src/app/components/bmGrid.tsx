import React, { useState, useEffect } from "react";

import fetch from "cross-fetch";
import { BmRow } from "./bmRow";

export type Bookmark = {
  url: string;
  title: string;
};

export const BmGrid = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkGrid, setBookmarkGrid] = useState(<div></div>);

  useEffect(() => {
    fetch("http://localhost:3001/bookmark")
      .then((response) => response.json())
      .then((bookmarks) => {
        setBookmarks(bookmarks);
      });
  }, []);

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
