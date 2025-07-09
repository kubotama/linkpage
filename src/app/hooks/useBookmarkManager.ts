"use client";

import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useBookmarks } from "./useBookmark";
import { SelectedBookmarkIndex, SelectedBookmark } from "../types/Bookmark";

export const useBookmarkManager = () => {
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [selectedBookmark, setSelectedBookmark] =
    useState<SelectedBookmark>(undefined);
  const [selectedBookmarkIndex, setSelectedBookmarkIndex] =
    useState<SelectedBookmarkIndex>(undefined);

  const {
    bookmarks,
    textMessage,
    setLoadingMessage,
    setErrorMessage,
    isError,
    handleErrorClose,
    loadBookmarks,
    deleteBookmark,
    updateBookmark,
  } = useBookmarks();

  useEffect(() => {
    if (selectedBookmarkIndex === undefined) {
      setSelectedBookmark(undefined);
    } else {
      setSelectedBookmark(bookmarks[selectedBookmarkIndex]);
    }
  }, [bookmarks, selectedBookmarkIndex, setSelectedBookmark]);

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
    if (selectedBookmark === undefined) {
      setTextUrl("");
      setTextTitle("");
    } else {
      setTextUrl(selectedBookmark.url);
      setTextTitle(selectedBookmark.title);
    }
  }, [selectedBookmark]);

  // deleteClick deletes the selected bookmark
  const deleteClick = async () => {
    if (selectedBookmark === undefined) {
      return;
    }
    deleteBookmark(selectedBookmark.bookmark_id).then(() => {
      setSelectedBookmarkIndex(undefined);
    });
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

  const updateClick = () => {
    if (selectedBookmark === undefined) {
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
    return selectedBookmarkIndex !== undefined;
  }, [selectedBookmarkIndex]);

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
        setSelectedBookmarkIndex(undefined);
      }
      return true;
    },
    [isBookmarkSelected, openBookmark, setSelectedBookmarkIndex]
  );

  return {
    bookmarks,
    textUrl,
    textTitle,
    selectedBookmarkIndex,
    setSelectedBookmarkIndex,
    isBookmarkSelected,
    textMessage,
    setLoadingMessage,
    setErrorMessage,
    isError,
    loadBookmarks,
    setTextUrl,
    setTextTitle,
    deleteClick,
    urlClick,
    pathClick,
    handleErrorClose,
    updateClick,
  };
};
