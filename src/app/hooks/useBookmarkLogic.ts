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

  const existingKeywordNames = useMemo(
    () => new Set(keywords.map((k) => k.keyword_name.toLowerCase())),
    [keywords]
  );

  const isEnableAddKeywordButton = useMemo(() => {
    const normalizedKeyword = textKeyword.trim().toLowerCase();
    if (normalizedKeyword.length === 0) {
      return false;
    }
    return !existingKeywordNames.has(normalizedKeyword);
  }, [textKeyword, existingKeywordNames]);

  return {
    selectedBookmark,
    selectedKeywords,
    availableKeywords,
    isEnableAddKeywordButton,
  };
};
