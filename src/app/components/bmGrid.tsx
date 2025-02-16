import React, { useState, useEffect } from "react";

import { BmRow } from "./bmRow";

export const BmGrid: React.FC = () => {
  const [bookmarkGrid, setBookmarkGrid] = useState(<div></div>);
  const [bookmarks, setBookmarks] = useState<[]>([]);
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
      setBookmarkGrid(
        <div className="grid grid-cols-1">
          {bookmarks.map((bookmark, index) => (
            <BmRow key={index} bookmark={bookmark} />
          ))}
        </div>
      );
    }
  }, [bookmarks, loading, error]);

  return bookmarkGrid;
};
