"use client";

import React, { useState, useEffect } from "react";

import { BmGrid } from "./components/bmGrid";

export type Bookmark = {
  url: string;
  title: string;
};

export const Home: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkGrid, setBookmarkGrid] = useState(<div></div>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/bookmark")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        return response.json();
      })
      .then((data) => {
        setBookmarks(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) {
      setBookmarkGrid(<div>Loading...</div>);
    } else if (error) {
      setBookmarkGrid(<div>{error}</div>);
    } else {
      setBookmarkGrid(<BmGrid bookmarks={bookmarks} />);
    }
  }, [bookmarks, loading, error]);

  return (
    <>
      <div>linkpage</div>
      <>{bookmarkGrid}</>
    </>
  );
};

export default Home;
