"use client";

import React, { useState, useEffect } from "react";

import { BmGrid } from "./components/bmGrid";

export type Bookmark = {
  url: string;
  title: string;
};

export default function Home() {
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
    if (bookmarks.length === 0) {
      setBookmarkGrid(<div>Loading...</div>);
    } else {
      setBookmarkGrid(<BmGrid bookmarks={bookmarks} />);
    }
  }, [bookmarks]);

  return (
    <>
      <div>linkpage</div>
      <>{bookmarkGrid}</>
    </>
  );
}
