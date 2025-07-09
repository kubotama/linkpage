import { useCallback, useState } from "react";

import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";
import { Bookmark, SelectedBookmark } from "../types/Bookmark";
import { useErrorMessage } from "./useErrorMessage";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedBookmark, setSelectedBookmark] =
    useState<SelectedBookmark>(null);

  const {
    textMessage,
    setLoadingMessage,
    setErrorMessage,
    isError,
    handleErrorClose,
  } = useErrorMessage();

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
        setErrorMessage(
          "ブックマークのロード中にエラーが発生しました。ネットワーク接続を確認し、URLが正しいか確認してください。"
        ); // ユーザーフレンドリーなメッセージ
      })
      .finally(() => {
        setLoadingMessage("");
      });
  }, [setErrorMessage, setLoadingMessage]);

  const deleteBookmark = useCallback(
    async (bookmark_id: number) => {
      setLoadingMessage("ブックマークの削除処理中...");
      try {
        const response = await fetch(`${BOOKMARKS_ENDPOINT}/${bookmark_id}`, {
          method: "DELETE",
        });

        if (response.status === 204) {
          setBookmarks((currentBookmarks) =>
            currentBookmarks.filter(
              (bookmark) => bookmark.bookmark_id !== bookmark_id
            )
          );
          setSelectedBookmark(null);
          setErrorMessage("");
        } else if (!response.ok) {
          const json = await response.json();
          throw new Error(`[${response.status}] ${json.message}`);
        }
      } catch (error: unknown) {
        console.error("ブックマーク削除エラー:", (error as Error).message);
        setErrorMessage(
          "ブックマークの削除中にエラーが発生しました。ネットワーク接続を確認し、URLが正しいか確認してください。"
        );
      } finally {
        setLoadingMessage("");
      }
    },
    [setErrorMessage, setLoadingMessage]
  );

  const updateBookmark = useCallback(
    async (bookmark_id: number, url: string, title: string) => {
      setLoadingMessage("ブックマークの更新処理中...");
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
          setErrorMessage("");
        } else {
          // エラーレスポンスの処理
          const json = await response.json();
          throw new Error(`[${response.status}] ${json.message}`);
        }
      } catch (error: unknown) {
        console.error("ブックマークの更新エラー:", (error as Error).message); // 詳細なエラーはコンソールへ
        setErrorMessage(
          "ブックマークの更新中にエラーが発生しました。ネットワーク接続を確認し、URLが正しいか確認してください。"
        ); // ユーザーフレンドリーなメッセージ
      } finally {
        setLoadingMessage("");
      }
    },
    [setErrorMessage, setLoadingMessage]
  );

  return {
    bookmarks,
    setSelectedBookmark,
    selectedBookmark,
    loadBookmarks,
    deleteBookmark,
    updateBookmark,
    isError,
    textMessage,
    handleErrorClose,
    setLoadingMessage,
    setErrorMessage,
  };
};
