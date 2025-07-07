"use client";

import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useBookmarks } from "./useBookmark";

export const useBookmarkManager = () => {
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textMessage, setTextMessage] = useState("ブックマークをロード中...");

  const {
    bookmarks,
    selectedBookmark,
    setSelectedBookmark,
    loadingMessage,
    errorMessage,
    setErrorMessage,
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

  useEffect(() => {
    if (errorMessage) {
      setTextMessage(errorMessage);
    } else if (loadingMessage) {
      setTextMessage(loadingMessage);
    } else {
      setTextMessage("");
    }
  }, [loadingMessage, errorMessage]);

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
    const regex_notslash = /^(http:\/\/|https:\/\/)(.*\/)[^\/]+$/;
    const match_notslash = textUrl.match(regex_notslash);
    if (match_notslash) {
      setTextUrl(match_notslash[1] + match_notslash[2]);
      return;
    }
    const regex_slash = /^(http:\/\/|https:\/\/)(.+\/)[^\/]+\/$/;
    const match_slash = textUrl.match(regex_slash);
    if (match_slash) {
      setTextUrl(match_slash[1] + match_slash[2]);
      return;
    }
  };

  // handleErrorClose clears the error message
  const handleErrorClose = () => {
    setErrorMessage("");
  };

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

  const isError = () => {
    return errorMessage !== "";
  };

  useHotkeys(
    "enter, escape",
    (_, handler) => {
      if (!isBookmarkSelected()) {
        return true;
      }
      const key = handler.keys && handler.keys.length > 0 && handler.keys[0];
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
    textMessage,
    selectedBookmark,
    isError,
    isBookmarkSelected,
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
