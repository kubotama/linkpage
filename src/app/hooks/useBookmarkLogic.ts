import { useMemo } from "react";

import { Bookmark } from "../types/Bookmark";
import { Keyword } from "../types/Keyword";

type UseBookmarksLogicProps = {
  bookmarks: Bookmark[];
  selectedBookmarkId: number | undefined;
  keywords: Keyword[];
  textKeyword: string;
};

export const useBookmarksLogic = ({
  bookmarks,
  selectedBookmarkId,
  keywords,
  textKeyword,
}: UseBookmarksLogicProps) => {
  const selectedBookmark = useMemo(
    () => bookmarks.find((b) => b.bookmark_id === selectedBookmarkId),
    [bookmarks, selectedBookmarkId]
  );

  const selectedKeywords = useMemo(() => selectedBookmark?.keywords, [selectedBookmark]);

  const linkedKeywordIds = useMemo(() => {
    return new Set(selectedKeywords?.map((k) => k.keyword_id));
  }, [selectedKeywords]);

  const availableKeywords = useMemo(() => {
    if (linkedKeywordIds.size === 0) {
      return keywords;
    }
    return keywords.filter((k) => !linkedKeywordIds.has(k.keyword_id));
  }, [keywords, linkedKeywordIds]);

  const isEnableAddKeywordButton = useMemo(() => {
    const normalizedKeyword = textKeyword.trim();
    return (
      normalizedKeyword.length > 0 &&
      !keywords.some((k) => k.keyword_name.toLowerCase() === normalizedKeyword.toLowerCase())
    );
  }, [textKeyword, keywords]);

  return {
    selectedBookmark,
    selectedKeywords,
    availableKeywords,
    isEnableAddKeywordButton,
  };
};
