import { useCallback, useState } from "react";

import { ApiError, parseApiError } from "../api/utils/ApiUtils";
import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import { Bookmark } from "../types/Bookmark";
import { Keyword } from "../types/Keyword";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.toString();
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const getBookmarks = useCallback(async () => {
    try {
      const response = await fetch(BOOKMARKS_ENDPOINT);
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
        return;
      } else {
        throw await parseApiError(response);
      }
    } catch (error: unknown) {
      console.error("ブックマークのロードエラー:", getErrorMessage(error));
      throw error;
    }
  }, []);

  const deleteBookmark = useCallback(async (bookmark_id: number) => {
    try {
      const response = await fetch(`${BOOKMARKS_ENDPOINT}/${bookmark_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookmarks((currentBookmarks) =>
          currentBookmarks.filter((bookmark) => bookmark.bookmark_id !== bookmark_id)
        );
      } else {
        throw await parseApiError(response);
      }
    } catch (error: unknown) {
      console.error("ブックマークの削除エラー:", getErrorMessage(error));
      throw error;
    }
  }, []);

  const updateBookmark = useCallback(async (bookmark_id: number, url: string, title: string) => {
    try {
      if (!url) {
        throw new Error("URLが指定されていません。");
      }
      if (!title) {
        throw new Error("タイトルが指定されていません。");
      }
      const response = await fetch(`${BOOKMARKS_ENDPOINT}/${bookmark_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, title }),
      });
      if (response.ok) {
        // APIが更新後のオブジェクトを返さないため、ローカルでタイトルを更新
        setBookmarks((currentBookmarks) =>
          currentBookmarks.map((bookmark) =>
            bookmark.bookmark_id === bookmark_id ? { ...bookmark, url, title } : bookmark
          )
        );
      } else {
        throw await parseApiError(response);
      }
    } catch (error: unknown) {
      console.error("ブックマークの更新エラー:", getErrorMessage(error)); // 詳細なエラーはコンソールへ
      throw error;
    }
  }, []);

  const addKeyword = useCallback(async (bookmark_id: number, keyword_name: string) => {
    try {
      const response = await fetch(`${BOOKMARKS_ENDPOINT}/${bookmark_id}/keywords`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword_name }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(
          json.message || `キーワードの追加に失敗しました。 Status: ${response.status}`
        );
      }
      const responseData = await response.json();
      const newKeyword: Keyword = {
        keyword_id: responseData.keyword_id,
        keyword_name: responseData.keyword_name,
      };
      setBookmarks((currentBookmarks) =>
        currentBookmarks.map((bookmark) =>
          bookmark.bookmark_id === bookmark_id
            ? { ...bookmark, keywords: [...bookmark.keywords, newKeyword] }
            : bookmark
        )
      );
      return;
    } catch (error: unknown) {
      console.error("キーワードの追加エラー:", (error as Error).message); // 詳細なエラーはコンソールへ
      throw error;
    }
  }, []);

  return {
    bookmarks,
    getBookmarks,
    deleteBookmark,
    updateBookmark,
    addKeyword,
  };
};
