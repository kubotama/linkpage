import { useEffect, useState } from "react";

import { Bookmark, createBookmark, SelectedBookmark } from "../types/Bookmark";

export const useBookmarkManager = () => {
  const [selectedBookmark, setSelectedBookmark] =
    useState<SelectedBookmark>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [bookmarkMessage, setBookmarkMessage] =
    useState("ブックマークをロード中...");

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
    if (error) {
      setBookmarkMessage(error);
    } else if (loading) {
      setBookmarkMessage(loading);
    } else {
      setBookmarkMessage("");
    }
  }, [loading, error]);

  useEffect(() => {
    setLoading("ブックマークをロード中...");
    fetch("/api/bookmark")
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
        setError("");
      })
      .catch((error) => {
        const errorMessage = (error as Error).message;
        setError(errorMessage);
      })
      .finally(() => {
        setLoading("");
      });
  }, []);

  const deleteClick = () => {
    if (selectedBookmark === null) {
      return;
    }
    setLoading("ブックマークの削除処理中...");
    fetch("/api/bookmark/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: selectedBookmark.id }),
    })
      .then(async (response) => {
        if (response.status === 204) {
          const newBookmarks = bookmarks.filter(
            (bookmark) => bookmark.id !== selectedBookmark.id
          );
          setBookmarks(newBookmarks);
          setSelectedBookmark(null);
          setError("");
        } else if (response.status === 404 || response.status === 400) {
          const errorText = await response.text();
          setError(errorText);
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
        setError(`BookmarkManager: ${error}`);
      })
      .finally(() => {
        setLoading("");
      });
  };

  const addClick = () => {
    const newBookmark = createBookmark({ url: textUrl, title: textTitle });
    setLoading("ブックマークの追加処理中...");

    fetch("/api/bookmark/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBookmark),
    })
      .then(async (response) => {
        try {
          if (response.status === 409) {
            const data = await response.json();
            setError(`[${response.status}] 既に登録されています。 ${data.url}`);
          } else if (!response.ok) {
            setError(
              `BookmarkManager: [${response.status}] ${response.statusText}`
            );
          } else {
            const data = await response.json();
            const newBookmarks = [...bookmarks, createBookmark(data)];
            setBookmarks(newBookmarks);
            setSelectedBookmark(null);
            setError("");
          }
        } catch (jsonError) {
          setError(`BookmarkManager: ${jsonError}`);
        }
      })
      .catch((error) => {
        setError(`BookmarkManager: ${error}`);
      })
      .finally(() => {
        setLoading("");
      });
  };

  // titleClick fetches the title of the URL
  const titleClick = () => {
    setBookmarkMessage("タイトルを取得中...");
    fetch("/api/title?url=" + textUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Can't find title: [${response.status}] `);
        } else {
          return response.text();
        }
      })
      .then((text) => {
        if (!text) {
          throw new Error(`Can't find title: `);
        } else {
          setTextTitle(text);
          setBookmarkMessage("");
        }
      })
      .catch((error) => {
        setError(error.message + textUrl);
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
    } catch (error: unknown) {
      setBookmarkMessage((error as Error).message);
    }
  };

  // clearClick clears the URL and Title input fields
  const clearClick = () => {
    setTextUrl("");
    setTextTitle("");
  };

  // handleErrorClose clears the error message
  const handleErrorClose = () => {
    setError("");
  };

  const updateClick = () => {
    if (selectedBookmark === null) {
      return;
    }
    setLoading("ブックマークのタイトル更新処理中...");
    fetch("/api/bookmark/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: selectedBookmark.id, title: textTitle }),
    })
      .then(async (response) => {
        if (response.ok) {
          // APIが成功のレスポンス（例: 更新されたブックマークオブジェクト）を返すと仮定
          // もしAPIが更新後のオブジェクトを返さない場合は、ローカルでタイトルを更新
          const updatedBookmarks = bookmarks.map((bookmark) =>
            bookmark.id === selectedBookmark.id
              ? { ...bookmark, title: textTitle }
              : bookmark
          );
          setBookmarks(updatedBookmarks);
          setSelectedBookmark(null); // 選択を解除
          setError("");
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
        setError(`BookmarkManager: ${error.message}`);
      })
      .finally(() => {
        setLoading("");
      });
  };

  const isBookmarkSelected = () => {
    return selectedBookmark !== null;
  };

  const isError = () => {
    return error !== "";
  };

  return {
    // selectedBookmark,
    bookmarks,
    textUrl,
    textTitle,
    bookmarkMessage,
    isError,
    isBookmarkSelected,
    setSelectedBookmark,
    setTextUrl,
    setTextTitle,
    deleteClick,
    addClick,
    titleClick,
    urlClick,
    pathClick,
    openClick,
    clearClick,
    handleErrorClose,
    updateClick,
  };
};
