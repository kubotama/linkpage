"use client";

import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useBookmarks } from "./useBookmark";

export const useBookmarkManager = () => {
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");

  const {
    bookmarks,
    selectedBookmark,
    textMessage,
    setLoadingMessage,
    setErrorMessage,
    setSelectedBookmark,
    isError,
    handleErrorClose,
    loadBookmarks,
    deleteBookmark,
    updateBookmark,
  } = useBookmarks();

  useEffect(() => {
    loadBookmarks();

    // SSEエンドポイントに接続
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "bookmarks-updated") {
          loadBookmarks();
        }
      } catch (error) {
        console.error("Failed to parse SSE message data:", error, event.data);
      }
    };

    // エラーハンドリング
    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
    };

    // コンポーネントがアンマウントされるときに接続を閉じるクリーンアップ処理
    return () => {
      eventSource.close();
    };
  }, [loadBookmarks]);

  useEffect(() => {
    if (selectedBookmark === null) {
      setTextUrl("");
      setTextTitle("");
    } else {
      setTextUrl(selectedBookmark.url);
      setTextTitle(selectedBookmark.title);
    }
  }, [selectedBookmark]);

  // useEffect(() => {
  //   if (errorMessage) {
  //     setTextMessage(errorMessage);
  //   } else if (loadingMessage) {
  //     setTextMessage(loadingMessage);
  //   } else {
  //     setTextMessage("");
  //   }
  // }, [loadingMessage, errorMessage]);

  // deleteClick deletes the selected bookmark
  const deleteClick = async () => {
    if (selectedBookmark === null) {
      return;
    }
    deleteBookmark(selectedBookmark.bookmark_id);
  };

  // urlClick delete the parameter of URL
  const urlClick = () => {
    // #や?の後ろを削除する
    // #や?のない場合は、入力されたURLをそのままとする
    const regex = /(https?:\/\/(.*?))(?:[#\?].*|$)/;
    const matches = textUrl.match(regex);

    if (matches && matches.length > 2) {
      setTextUrl(matches[1]);
    }
  };

  // pathClick truncate the most last part of path
  const pathClick = () => {
    try {
      const url = new URL(textUrl);
      // 末尾にスラッシュがあれば除去して親ディレクトリを取得
      const path = url.pathname.replace(/\/$/, "");
      const lastSlashIndex = path.lastIndexOf("/");

      if (lastSlashIndex > 0) {
        // e.g. /foo/bar -> /foo/
        url.pathname = path.substring(0, lastSlashIndex) + "/";
        setTextUrl(url.toString());
      } else if (lastSlashIndex === 0 && path.length > 1) {
        // e.g. /foo -> /
        url.pathname = "/";
        setTextUrl(url.toString());
      }
      // ルートディレクトリやパスがない場合は何もしない
    } catch {
      // 不正なURLの場合は何もしない
    }
  };

  // handleErrorClose clears the error message
  // const handleErrorClose = () => {
  //   setErrorMessage("");
  // };

  const updateClick = () => {
    if (selectedBookmark === null) {
      return;
    }
    updateBookmark(selectedBookmark.bookmark_id, textUrl, textTitle);
  };

  const openBookmark = useCallback(() => {
    try {
      new URL(textUrl);
      window.open(textUrl, "_blank", "noopener,noreferrer");
    } catch {
      setErrorMessage("URLが無効です。正しいURLを入力してください。");
    }
  }, [textUrl, setErrorMessage]);

  const isBookmarkSelected = useCallback(() => {
    return selectedBookmark !== null;
  }, [selectedBookmark]);

  // const isError = () => {
  //   return errorMessage !== "";
  // };

  useHotkeys(
    "enter, escape",
    (_, handler) => {
      if (!isBookmarkSelected()) {
        return true;
      }
      const key = handler.keys?.[0];
      if (key === "enter") {
        openBookmark();
      } else if (key === "escape") {
        setSelectedBookmark(null);
      }
      return true;
    },
    [isBookmarkSelected, openBookmark, setSelectedBookmark]
  );

  return {
    bookmarks,
    textUrl,
    textTitle,
    selectedBookmark,
    isBookmarkSelected,
    textMessage,
    setLoadingMessage,
    setErrorMessage,
    isError,
    loadBookmarks,
    setSelectedBookmark,
    setTextUrl,
    setTextTitle,
    deleteClick,
    urlClick,
    pathClick,
    handleErrorClose,
    updateClick,
  };
};
