import React, { useEffect, useState } from "react";

import { useMessage } from "../contexts/MessageContext";
import { BmGrid } from "./bmGrid";
import { Bookmark } from "./bmRow"; // Import the Bookmark type
import { BookmarkManager } from "./BookmarkManager";
import BmDetail from "./bmDetail";

export const LinkPage = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setMessage } = useMessage();

  useEffect(() => {
    if (loading) {
      setMessage({ text: "Loading..." });
    } else if (error) {
      setMessage({ text: error });
    } else {
      setMessage({ text: "" });
    }
  }, [loading, error, setMessage]);

  return (
    <div>
      <BmDetail onBmUpdate={() => {}} />
      <BookmarkManager
        onBookmarksUpdate={setBookmarks}
        onLoadingChange={setLoading}
        onError={setError}
      >
        <BmGrid bookmarks={bookmarks} />
      </BookmarkManager>
    </div>
  );
};
