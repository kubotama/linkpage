import { useEffect, useState } from "react";

import { TITLE_ENDPOINT } from "../constants/apiEndpoints";
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

  useEffect(() => {
    loadBookmarks();
  }, []);

  const deleteClick = async () => {
    if (selectedBookmark === null) {
      return;
    }
    deleteBookmark(selectedBookmark.id);
  };

  // titleClick fetches the title of the URL
  const titleClick = () => {
    setTextMessage("タイトルを取得中...");
    fetch(`${TITLE_ENDPOINT}?url=${encodeURIComponent(textUrl)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`タイトルが見つかりません: [${response.status}] `);
        } else {
          return response.text();
        }
      })
      .then((text) => {
        if (!text) {
          throw new Error(`タイトルが見つかりません: [${textUrl}] `);
        } else {
          setTextTitle(text);
          setTextMessage("");
        }
      })
      .catch((error) => {
        console.error("タイトルの取得エラー:", error); // 詳細なエラーはコンソールへ
        setErrorMessage("タイトルの取得中にエラーが発生しました。"); // ユーザーフレンドリーなメッセージ
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
      setTextMessage("URLが無効です。正しいURLを入力してください。");
    }
  };

  // clearClick clears the URL and Title input fields
  const clearClick = () => {
    setTextUrl("");
    setTextTitle("");
  };

  // handleErrorClose clears the error message
  const handleErrorClose = () => {
    setErrorMessage("");
  };

  const updateClick = () => {
    if (selectedBookmark === null) {
      return;
    }
    updateBookmark(selectedBookmark.id, textTitle);
  };

  const isBookmarkSelected = () => {
    return selectedBookmark !== null;
  };

  const isError = () => {
    return errorMessage !== "";
  };

  return {
    // selectedBookmark,
    bookmarks,
    textUrl,
    textTitle,
    textMessage,
    isError,
    isBookmarkSelected,
    setSelectedBookmark,
    setTextUrl,
    setTextTitle,
    deleteClick,
    titleClick,
    urlClick,
    pathClick,
    openClick,
    clearClick,
    handleErrorClose,
    updateClick,
  };
};
