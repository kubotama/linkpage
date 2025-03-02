import React, { JSX, useEffect, useState } from "react";

// import { useBookmark } from "../contexts/BookmarkContext";
// import { useMessage } from "../contexts/MessageContext";
import { BmRow, Bookmark } from "./bmRow"; // Import the Bookmark type

export const BmGrid: React.FC<{ bookmarks: Bookmark[] }> = ({ bookmarks }) => {
  const [bookmarkGrid, setBookmarkGrid] = useState<JSX.Element>(<div></div>);
  // const [bookmarks, setBookmarks] = useState<Bookmark[]>([]); // Type as Bookmark[]
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const { setMessage } = useMessage();
  // const { bookmarks, loading, error } = useBookmark();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch("/api/bookmark");

  //       if (!response.ok) {
  //         const message = `Failed to fetch: ${response.status} ${response.statusText}`;
  //         throw new Error(message);
  //       }

  //       const data: Bookmark[] = await response.json(); // Type the data as Bookmark[]
  //       setBookmarks(data);
  //     } catch (error: unknown) {
  //       setError((error as Error).message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   if (loading) {
  //     setBookmarkGrid(<div></div>);
  //     setMessage({ text: "Loading..." });
  //   } else if (error) {
  //     setBookmarkGrid(<div></div>);
  //     setMessage({ text: error });
  //   } else {
  //     setMessage({ text: "" });
  //     setBookmarkGrid(
  //       <div className="grid grid-cols-1">
  //         {bookmarks.map((bookmark, index) => (
  //           <BmRow key={index} bookmark={bookmark} />
  //         ))}
  //       </div>
  //     );
  //   }
  // }, [bookmarks, loading, error, setMessage]);

  useEffect(() => {
    setBookmarkGrid(
      <div className="grid grid-cols-1">
        {bookmarks.map((bookmark, index) => (
          <BmRow key={index} bookmark={bookmark} />
        ))}
      </div>
    );
  }, [bookmarks]);

  return bookmarkGrid;
};
