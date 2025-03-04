import React, { useEffect, useState } from "react";

import { useMessage } from "../contexts/MessageContext";
import BmDetail from "./bmDetail";
import { BmGrid } from "./bmGrid";
import { Bookmark } from "./bmRow";

// interface BookmarkManagerProps {
//   onBookmarksUpdate: (bookmarks: Bookmark[]) => void;
//   onLoadingChange: (loading: boolean) => void;
//   onError: (error: string | null) => void;
// }

export const BookmarkManager = ({}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setMessage } = useMessage();
  // const [isFirstLoading, setIsFirstLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setMessage({ text: "Loading..." });
    } else if (error) {
      setMessage({ text: error });
    } else {
      setMessage({ text: "" });
    }
  }, [loading, error, setMessage]);

  useEffect(() => {
    fetch("/api/bookmark")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch: [${response.status}] ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        setBookmarks(data);
      })
      .catch((error) => {
        const errorMessage = (error as Error).message;
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // useEffect(() => {
  //   if (isFirstLoading) {
  //     setIsFirstLoading(false);
  //     return;
  //   }
  //   fetch("/api/bookmark", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(bookmarks),
  //   });
  // }, [bookmarks, isFirstLoading]);

  const handleAddBookmark = (textUrl: string, textTitle: string) => {
    const newBookmark = { url: textUrl, title: textTitle };
    const newBookmarks = [...bookmarks, newBookmark];
    setBookmarks(newBookmarks);
    fetch("/api/bookmark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBookmarks),
    });
  };

  return (
    <>
      <BmDetail onAddBookmark={handleAddBookmark} />
      <BmGrid bookmarks={bookmarks} />
    </>
  );
};
