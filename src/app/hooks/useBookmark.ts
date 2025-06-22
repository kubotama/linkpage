import { useCallback, useState } from "react";

import {
  BOOKMARK_DELETE_ENDPOINT,
  BOOKMARK_UPDATE_ENDPOINT,
  BOOKMARKS_ENDPOINT,
} from "../constants/apiEndpoints";
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

  const deleteBookmark = useCallback(
    async (id: number) => {
      setLoadingMessage("ブックマークの削除処理中...");
      try {
        const response = await fetch(BOOKMARK_DELETE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }),
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
    },
    [setBookmarks, setSelectedBookmark, setLoadingMessage, setErrorMessage]
  );

  const updateBookmark = useCallback(
    async (id: number, title: string) => {
      setLoadingMessage("ブックマークのタイトル更新処理中...");
      try {
        const response = await fetch(BOOKMARK_UPDATE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, title }),
        });
        if (response.ok) {
          // APIが成功のレスポンス（例: 更新されたブックマークオブジェクト）を返すと仮定
          // もしAPIが更新後のオブジェクトを返さない場合は、ローカルでタイトルを更新
          const updatedBookmarks = bookmarks.map((bookmark) =>
            bookmark.id === id ? { ...bookmark, title } : bookmark
          );
          setBookmarks(updatedBookmarks);
          setSelectedBookmark(null); // 選択を解除
          setErrorMessage("");
        } else {
          // エラーレスポンスの処理
          const errorText = await response.text();
          throw new Error(
            `タイトルの更新エラー: [${response.status}] ${
              errorText || response.statusText
            }`
          );
        }
      } catch (error: unknown) {
        console.error("ブックマークのタイトル更新エラー:", error); // 詳細なエラーはコンソールへ
        setErrorMessage("ブックマークのタイトル更新中にエラーが発生しました。"); // ユーザーフレンドリーなメッセージ
      } finally {
        setLoadingMessage("");
      }
    },
    [
      bookmarks,
      setBookmarks,
      setSelectedBookmark,
      setLoadingMessage,
      setErrorMessage,
    ]
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
