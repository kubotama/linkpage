"use client";

import { useCallback, useEffect, useState } from "react";

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

  const refreshClick = useCallback(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
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

  // openClick opens the URL in a new tab
  const openClick = () => {
    try {
      new URL(textUrl);
      // 新しいウィンドウでURLを開く
      window.open(textUrl, "_blank", "noopener,noreferrer");
    } catch {
      setErrorMessage("URLが無効です。正しいURLを入力してください。");
    }
  };

  // clearClick clears the URL and Title input fields
  const clearClick = useCallback(() => {
    setTextUrl("");
    setTextTitle("");
  }, []);

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

  const isBookmarkSelected = () => {
    return selectedBookmark !== null;
  };

  const isError = () => {
    return errorMessage !== "";
  };

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    // selectedBookmark,
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
    openClick,
    clearClick,
    handleErrorClose,
    updateClick,
    refreshClick,
  };
};
