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
        method: "POST",
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
      } else if (response.status === 404 || response.status === 400) {
        const errorText = await response.text();
        throw new Error(errorText); // This error will be caught by the catch block below
      } else {
        let errorDetail = response.statusText;
        try {
          const serverMessage = await response.text();
          if (serverMessage) {
            errorDetail = serverMessage;
          }
        } catch (e) {
          console.error("Failed to read error response body:", e);
        }
        throw new Error(
          `Failed to delete: [${response.status}] ${errorDetail}` // Caught by catch block
        );
      }
    } catch (error: unknown) {
      // より具体的なエラー型付けも検討可能です
      console.error(
        "ブックマーク削除エラー:",
        (error as Error).message ? (error as Error).message : String(error)
      );
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
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, url, title }),
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
          const errorText = await response.text();
          throw new Error(
            `ブックマークの更新エラー: [${response.status}] ${
              errorText || response.statusText
            }`
          );
        }
      } catch (error: unknown) {
        console.error("ブックマークの更新エラー:", error); // 詳細なエラーはコンソールへ
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
