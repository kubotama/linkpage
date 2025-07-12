"use client";

import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { SelectedBookmark } from "../types/Bookmark";
import { DuplicatedUrlError, useBookmarks } from "./useBookmark";
import { useErrorMessage } from "./useErrorMessage";

export const useBookmarkManager = () => {
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [selectedBookmark, setSelectedBookmark] =
    useState<SelectedBookmark>(undefined);

  const { bookmarks, getBookmarks, deleteBookmark, updateBookmark } =
    useBookmarks();

  const {
    textMessage,
    setLoadingMessage,
    setErrorMessage,
    clearMessage,
    isError,
    handleErrorClose,
  } = useErrorMessage();

  const loadBookmarks = useCallback(async () => {
    setLoadingMessage("ブックマークをロード中...");
    try {
      await getBookmarks();
      clearMessage();
    } catch {
      setErrorMessage("ブックマークのロード中にエラーが発生しました。");
    }
  }, [clearMessage, getBookmarks, setErrorMessage, setLoadingMessage]);

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
  const deleteClick = useCallback(async () => {
    if (selectedBookmark === undefined) {
      return;
    }

    setLoadingMessage("ブックマークの削除処理中...");
    try {
      await deleteBookmark(selectedBookmark.bookmark_id);
      setSelectedBookmark(undefined);
      clearMessage();
    } catch {
      setErrorMessage("ブックマークの削除中にエラーが発生しました。");
    }
  }, [
    clearMessage,
    deleteBookmark,
    selectedBookmark,
    // setSelectedBookmarkIndex,
    setErrorMessage,
    setLoadingMessage,
  ]);

  // urlClick delete the parameter of URL
  const urlClick = useCallback(() => {
    // #や?の後ろを削除する
    // #や?のない場合は、入力されたURLをそのままとする
    const regex = /(https?:\/\/(.*?))(?:[#\?].*|$)/;
    const matches = textUrl.match(regex);

    if (matches && matches.length > 2) {
      setTextUrl(matches[1]);
    }
  }, [textUrl]);

  // pathClick truncate the most last part of path
  const pathClick = useCallback(() => {
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
  }, [textUrl]);

  // updateClick updates the selected bookmark
  const updateClick = useCallback(async () => {
    if (selectedBookmark === undefined) {
      return;
    }
    setLoadingMessage("ブックマークの更新中...");
    try {
      await updateBookmark(selectedBookmark.bookmark_id, textUrl, textTitle);
      clearMessage();
    } catch (error: unknown) {
      if (error instanceof DuplicatedUrlError) {
        setErrorMessage("指定されたURLのブックマークは既に登録されています。");
      } else {
        setErrorMessage("ブックマークの更新中にエラーが発生しました。");
      }
    }
  }, [
    clearMessage,
    selectedBookmark,
    setLoadingMessage,
    setErrorMessage,
    textTitle,
    textUrl,
    updateBookmark,
  ]);

  const openBookmark = useCallback(() => {
    try {
      new URL(textUrl);
      window.open(textUrl, "_blank", "noopener,noreferrer");
    } catch {
      setErrorMessage("URLが無効です。正しいURLを入力してください。");
    }
  }, [textUrl, setErrorMessage]);

  const isBookmarkSelected = useCallback(() => {
    return selectedBookmark !== undefined;
  }, [selectedBookmark]);

  const getSelectedBookmarkIndex = useCallback(() => {
    if (selectedBookmark === undefined) {
      return undefined;
    }
    return bookmarks.findIndex(
      (bookmark) => bookmark.bookmark_id === selectedBookmark.bookmark_id
    );
  }, [bookmarks, selectedBookmark]);

  useHotkeys(
    "enter, escape, up, down",
    (_, handler) => {
      const key = handler.keys?.[0];
      if (!key) {
        return false;
      }
      if (key === "arrowdown") {
        if (bookmarks.length === 0) {
          return true;
        }
        const index = getSelectedBookmarkIndex();
        if (index === undefined) {
          setSelectedBookmark(bookmarks[0]);
        } else {
          const nextIndex = (index + 1) % bookmarks.length;
          setSelectedBookmark(bookmarks[nextIndex]);
        }
        return true;
      } else if (key === "arrowup") {
        if (bookmarks.length === 0) {
          return true;
        }
        const index = getSelectedBookmarkIndex();
        if (index === undefined) {
          setSelectedBookmark(bookmarks[bookmarks.length - 1]);
        } else {
          const prevIndex = index === 0 ? bookmarks.length - 1 : index - 1;
          setSelectedBookmark(bookmarks[prevIndex]);
        }
        return true;
      }
      if (!isBookmarkSelected()) {
        return true;
      }
      if (key === "enter") {
        openBookmark();
      } else if (key === "escape") {
        setSelectedBookmark(undefined);
      }
      return true;
    },
    [
      isBookmarkSelected,
      openBookmark,
      setSelectedBookmark,
      bookmarks,
      getSelectedBookmarkIndex,
    ]
  );

  return {
    bookmarks,
    textUrl,
    textTitle,
    selectedBookmark,
    setSelectedBookmark,
    isBookmarkSelected,
    textMessage,
    isError,
    setTextUrl,
    setTextTitle,
    deleteClick,
    urlClick,
    pathClick,
    handleErrorClose,
    updateClick,
  };
};
