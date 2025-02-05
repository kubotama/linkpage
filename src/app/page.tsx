"use client";

import React, { useState, useEffect } from "react";

import { Bookmarks, Bookmark } from "./components/bookmark";

export default function Home() {
  return (
    <div>
      <div>linkpage</div>
      <BookmarkGrid />
    </div>
  );
}

const BookmarkGrid = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkGrid, setBookmarkGrid] = useState(<div></div>);

  if (bookmarks.length === 0) {
    setBookmarks(Bookmarks());
  }

  useEffect(() => {
    setBookmarkGrid(() => (
      <>
        {bookmarks.map((bookmark, index) => (
          <div className="grid-item" key={index}>
            <a href={bookmark.url} target="_blank">
              {bookmark.title}
            </a>
          </div>
        ))}
      </>
    ));
  }, [bookmarks]);
  return <div className="grid grid-cols-1">{bookmarkGrid}</div>;
};
