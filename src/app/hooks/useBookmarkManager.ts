"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    // setLoadingMessage,
    // setErrorMessage,
    // clearMessage,
    setMessage,
    isError,
    handleErrorClose,
  } = useErrorMessage();

  const loadBookmarks = useCallback(async () => {
    setMessage("ブックマークをロード中...", false);
    try {
      await getBookmarks();
      setMessage();
    } catch {
      setMessage("ブックマークのロード中にエラーが発生しました。", true);
    }
  }, [setMessage, getBookmarks]);

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

    setMessage("ブックマークの削除処理中...", false);
    try {
      await deleteBookmark(selectedBookmark.bookmark_id);
      setSelectedBookmark(undefined);
      setMessage();
    } catch {
      setMessage("ブックマークの削除中にエラーが発生しました。", true);
    }
  }, [
    // clearMessage,
    deleteBookmark,
    selectedBookmark,
    // setErrorMessage,
    // setLoadingMessage,
    setMessage,
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
    setMessage("ブックマークの更新中...", false);
    try {
      await updateBookmark(selectedBookmark.bookmark_id, textUrl, textTitle);
      setMessage();
    } catch (error: unknown) {
      if (error instanceof DuplicatedUrlError) {
        setMessage("指定されたURLのブックマークは既に登録されています。", true);
      } else {
        setMessage("ブックマークの更新中にエラーが発生しました。", true);
      }
    }
  }, [
    // clearMessage,
    selectedBookmark,
    // setLoadingMessage,
    // setErrorMessage,
    setMessage,
    textTitle,
    textUrl,
    updateBookmark,
  ]);

  // openBookmarkコールバック内で最新のtextUrlを参照しつつ、
  // textUrlの変更でコールバックが再生成されるのを防ぐためのref。
  // これにより、useHotkeysフックの再登録が抑制され、パフォーマンスが向上します。
  const textUrlRef = useRef(textUrl);
  useEffect(() => {
    textUrlRef.current = textUrl;
  }, [textUrl]);
  const openBookmark = useCallback(() => {
    try {
      new URL(textUrlRef.current);
      window.open(textUrlRef.current, "_blank", "noopener,noreferrer");
    } catch {
      setMessage("URLが無効です。正しいURLを入力してください。", true);
    }
  }, [setMessage]); // textUrlへの依存を削除

  // ブックマークリストと選択されたブックマークの最新値を参照するためのref
  // これにより、useHotkeysフックの依存配列からこれらを除外し、不要な再登録を防ぎます。
  const bookmarksRef = useRef(bookmarks);
  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);
  const selectedBookmarkRef = useRef(selectedBookmark);
  useEffect(() => {
    selectedBookmarkRef.current = selectedBookmark;
  }, [selectedBookmark]);

  // getSelectedBookmarkIndex は useHotkeys の内部で定義し、ref を使用する
  useHotkeys(
    "enter, escape, arrowup, arrowdown",
    (_, handler) => {
      const key = handler.keys?.[0];
      if (!key) {
        return true;
      }
      // ホットキーハンドラ内で最新のブックマークと選択状態を参照するためのヘルパー関数
      const getSelectedBookmarkIndexInternal = () => {
        const currentSelectedBookmark = selectedBookmarkRef.current;
        const currentBookmarks = bookmarksRef.current;
        if (currentSelectedBookmark === undefined) {
          return undefined;
        }
        const currentIndex = currentBookmarks.findIndex(
          (bookmark) =>
            bookmark.bookmark_id === currentSelectedBookmark.bookmark_id
        );
        if (currentIndex === -1) {
          return undefined;
        }
        return currentIndex;
      };
      if (key === "arrowup" || key === "arrowdown") {
        const currentBookmarks = bookmarksRef.current;
        if (currentBookmarks.length === 0) {
          return true;
        }
        const currentIndex = getSelectedBookmarkIndexInternal();
        const increment = key === "arrowdown" ? 1 : -1;
        let newIndex;
        if (currentIndex === undefined) {
          // ブックマークが選択されていない場合、最初または最後に移動
          newIndex = increment === 1 ? 0 : currentBookmarks.length - 1;
        } else {
          // ブックマークを循環
          newIndex =
            (currentIndex + increment + currentBookmarks.length) %
            currentBookmarks.length;
        }
        setSelectedBookmark(currentBookmarks[newIndex]);
        return false; // Prevent default scroll
      }
      // 以降のキー操作はブックマーク選択中のみ有効
      // if (!isBookmarkSelected()) {
      if (selectedBookmarkRef.current === undefined) {
        return true;
      }
      switch (key) {
        case "enter":
          openBookmark();
          return false; // Prevent default
        case "escape":
          setSelectedBookmark(undefined);
          return false; // Prevent default
        default:
          return true;
      }
    },
    [
      openBookmark,
      setSelectedBookmark,
      // bookmarks, selectedBookmark, textUrl は ref を介してアクセスされるため、
      // 依存配列から除外しています。
      // isBookmarkSelected もインライン化されたため、依存配列から削除されます。
    ]
  );

  return {
    bookmarks,
    textUrl,
    textTitle,
    selectedBookmark,
    setSelectedBookmark,
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
