import { useState } from "react";

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

  const loadBookmarks = () => {
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
  };

  const deleteBookmark = async (id: number) => {
    setLoadingMessage("ブックマークの削除処理中...");
    fetch(BOOKMARK_DELETE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    })
      .then(async (response) => {
        if (response.status === 204) {
          const newBookmarks = bookmarks.filter(
            (bookmark) => bookmark.id !== id
          );
          setBookmarks(newBookmarks);
          setSelectedBookmark(null);
          setErrorMessage("");
        } else if (response.status === 404 || response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText);
        } else {
          let errorDetail = response.statusText; // デフォルトは statusText
          try {
            const serverMessage = await response.text();
            if (serverMessage) {
              // サーバーがボディにメッセージを含めていればそれを使用
              errorDetail = serverMessage;
            }
          } catch (e) {
            // response.text() の読み取りに失敗した場合の処理 (例: ログ出力)
            console.error("Failed to read error response body:", e);
            // errorDetail は response.statusText のまま
          }
          throw new Error(
            `Failed to delete: [${response.status}] ${errorDetail}`
          );
        }
      })
      .catch((error) => {
        console.error("ブックマーク削除エラー:", error); // 詳細なエラーはコンソールへ
        setErrorMessage("ブックマークの削除中にエラーが発生しました。"); // ユーザーフレンドリーなメッセージ
      })
      .finally(() => {
        setLoadingMessage("");
      });
  };

  const updateBookmark = async (id: number, title: string) => {
    setLoadingMessage("ブックマークのタイトル更新処理中...");
    setLoadingMessage("ブックマークのタイトル更新処理中...");
    fetch(BOOKMARK_UPDATE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, title }),
    })
      .then(async (response) => {
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
      })
      .catch((error) => {
        console.error("ブックマークのタイトル更新エラー:", error); // 詳細なエラーはコンソールへ
        setErrorMessage("ブックマークのタイトル更新中にエラーが発生しました。"); // ユーザーフレンドリーなメッセージ
      })
      .finally(() => {
        setLoadingMessage("");
      });
  };

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
