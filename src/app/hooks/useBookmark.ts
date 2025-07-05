import { useCallback, useState } from "react";

import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import { Bookmark, SelectedBookmark } from "../types/Bookmark";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBookmark, setSelectedBookmark] =
    useState<SelectedBookmark>(null);

  const loadBookmarks = useCallback(() => {
    setLoadingMessage("ブックマークをロード中...");
    fetch(BOOKMARKS_ENDPOINT)
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
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("ブックマークのロードエラー:", error); // 詳細なエラーはコンソールへ
        setErrorMessage("ブックマークのロード中にエラーが発生しました。"); // ユーザーフレンドリーなメッセージ
      })
      .finally(() => {
        setLoadingMessage("");
      });
  }, []);

  const deleteBookmark = useCallback(async (id: number) => {
    setLoadingMessage("ブックマークの削除処理中...");
    try {
      const response = await fetch(`${BOOKMARKS_ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 204) {
        setBookmarks((currentBookmarks) =>
          currentBookmarks.filter((bookmark) => bookmark.id !== id)
        );
        setSelectedBookmark(null);
        setErrorMessage("");
      } else if (!response.ok) {
        const json = await response.json();
        throw new Error(`[${response.status}] ${json.message}`);
      }
    } catch (error: unknown) {
      // より具体的なエラー型付けも検討可能です
      console.error("ブックマーク削除エラー:", (error as Error).message);
      setErrorMessage("ブックマークの削除中にエラーが発生しました。");
    } finally {
      setLoadingMessage("");
    }
  }, []);

  const updateBookmark = useCallback(
    async (id: number, url: string, title: string) => {
      setLoadingMessage("ブックマークの更新処理中...");
      try {
        const response = await fetch(`${BOOKMARKS_ENDPOINT}/${id}`, {
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
              bookmark.id === id ? { ...bookmark, url, title } : bookmark
            )
          );
          setErrorMessage("");
        } else {
          // エラーレスポンスの処理
          const json = await response.json();
          throw new Error(`[${response.status}] ${json.message}`);
        }
      } catch (error: unknown) {
        console.error("ブックマークの更新エラー:", (error as Error).message); // 詳細なエラーはコンソールへ
        setErrorMessage("ブックマークの更新中にエラーが発生しました。"); // ユーザーフレンドリーなメッセージ
      } finally {
        setLoadingMessage("");
      }
    },
    []
  );

  return {
    bookmarks,
    setSelectedBookmark,
    selectedBookmark,
    loadingMessage,
    errorMessage,
    setErrorMessage,
    loadBookmarks,
    deleteBookmark,
    updateBookmark,
  };
};
