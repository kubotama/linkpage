import { useCallback, useState } from "react";

import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import { Bookmark } from "../types/Bookmark";
import { Keyword } from "../types/Keyword";

export class DuplicatedUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicatedUrlError";
  }
}

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
        const json = await response.json();
        throw new Error(`[${response.status}] ${json.message}`);
      }
    } catch (error: unknown) {
      console.error("ブックマークのロードエラー:", (error as Error).message);
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
        const json = await response.json();
        throw new Error(`[${response.status}] ${json.message}`);
      }
    } catch (error: unknown) {
      console.error("ブックマークの削除エラー:", (error as Error).message);
      throw error;
    }
  }, []);

  const updateBookmark = useCallback(async (bookmark_id: number, url: string, title: string) => {
    try {
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
        // エラーレスポンスの処理
        const json = await response.json();
        if (response.status === 409) {
          throw new DuplicatedUrlError(json.message);
        } else {
          throw new Error(`[${response.status}] ${json.message}`);
        }
      }
    } catch (error: unknown) {
      console.error("ブックマークの更新エラー:", (error as Error).message); // 詳細なエラーはコンソールへ
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
