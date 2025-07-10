import { useCallback, useState } from "react";

import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import { Bookmark } from "../types/Bookmark";

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
      console.error("ブックマークのロードエラー:", error);
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
          currentBookmarks.filter(
            (bookmark) => bookmark.bookmark_id !== bookmark_id
          )
        );
      } else {
        const json = await response.json();
        throw new Error(`[${response.status}] ${json.message}`);
      }
    } catch (error: unknown) {
      console.error("ブックマーク削除エラー:", (error as Error).message);
      throw error;
    }
  }, []);

  const updateBookmark = useCallback(
    async (bookmark_id: number, url: string, title: string) => {
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
              bookmark.bookmark_id === bookmark_id
                ? { ...bookmark, url, title }
                : bookmark
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
    },
    []
  );

  return {
    bookmarks,
    getBookmarks,
    deleteBookmark,
    updateBookmark,
  };
};
