"use client";

import React, { useState, useEffect } from "react";

import fetch from "cross-fetch";

import { BmGrid, Bookmark } from "./components/bmGrid";

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/bookmark")
      .then((response) => response.json())
      .then((bookmarks) => {
        setBookmarks(bookmarks);
      });
  }, []);

  return (
    <div>
      <div>linkpage</div>
      <BmGrid bookmarks={bookmarks} />
    </div>
  );
}
