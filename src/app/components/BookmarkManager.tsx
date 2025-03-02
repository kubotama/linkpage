import React, { useEffect } from "react";

import { Bookmark } from "./bmRow";

interface BookmarkManagerProps {
  onBookmarksUpdate: (bookmarks: Bookmark[]) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export const BookmarkManager: React.FC<
  BookmarkManagerProps & { children: React.ReactNode }
> = ({ children, onBookmarksUpdate, onLoadingChange, onError }) => {
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
        onBookmarksUpdate(data);
      })
      .catch((error) => {
        const errorMessage = (error as Error).message;
        onError(errorMessage);
      })
      .finally(() => {
        onLoadingChange(false);
      });
  }, [onBookmarksUpdate, onError, onLoadingChange]);

  return <>{children}</>;
};
