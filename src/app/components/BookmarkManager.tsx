import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { Bookmark, createBookmark } from "../types/Bookmark";
import { BookmarkTable } from "./BookmarkTable";

export const BookmarkManager = ({}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [bookmarkMessage, setBookmarkMessage] =
    useState("ブックマークをロード中...");

  useEffect(() => {
    if (loading) {
      setBookmarkMessage("ブックマークをロード中...");
    } else if (error) {
      setBookmarkMessage(error);
    } else {
      setBookmarkMessage("");
    }
  }, [loading, error]);

  useEffect(() => {
    setBookmarkMessage("ブックマークをロード中...");
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
        setBookmarkMessage("");
      })
      .catch((error) => {
        const errorMessage = (error as Error).message;
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddBookmark = (textUrl: string, textTitle: string) => {
    const newBookmark = createBookmark({ url: textUrl, title: textTitle });

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
            setError(
              `BookmarkManager: [${response.status}] 既に登録されています。 ${data.url}`
            );
          } else if (!response.ok) {
            setError(
              `BookmarkManager: [${response.status}] ${response.statusText}`
            );
          } else {
            const data = await response.json();
            const newBookmarks = [...bookmarks, createBookmark(data)];
            setBookmarks(newBookmarks);
          }
        } catch (jsonError) {
          setError(`BookmarkManager: ${jsonError}`);
        }
      })
      .catch((error) => {
        setError(`BookmarkManager: ${error}`);
      });
  };

  const updateClick = () => {
    handleAddBookmark(textUrl, textTitle);
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

  return (
    <>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <Box display="flex" alignItems="center" sx={{ marginBottom: "10px" }}>
          {bookmarkMessage !== "" && (
            <Box
              display="flex"
              alignItems="center"
              sx={{ marginBottom: "10px" }}
            >
              {error && ( // エラーメッセージがある場合のみ「閉じる」ボタンを表示
                <Button
                  variant="contained"
                  onClick={handleErrorClose}
                  sx={{ height: "2rem" }}
                >
                  閉じる
                </Button>
              )}
              <span
                data-testid="bookmark-message"
                style={{
                  marginLeft: "0.7rem",
                  color: error ? "red" : "inherit", // エラーの場合は文字色を赤に
                }}
              >
                {bookmarkMessage}
              </span>
            </Box>
          )}

          {bookmarkMessage === "" && ( // エラーメッセージがない場合に「タイトル」ボタンを表示
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "8rem", height: "2rem", marginRight: "0.7rem" }}
              onClick={titleClick}
            >
              タイトル
            </Button>
          )}

          {bookmarkMessage === "" && ( // エラーメッセージがない場合に「追加」ボタンを表示
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "8rem", height: "2rem", marginRight: "0.7rem" }}
              onClick={updateClick}
            >
              追加
            </Button>
          )}

          {bookmarkMessage === "" && ( // エラーメッセージがない場合に「クリア」ボタンを表示
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "8rem", height: "2rem", marginRight: "0.7rem" }}
              onClick={clearClick}
            >
              クリア
            </Button>
          )}

          {bookmarkMessage === "" && ( // エラーメッセージがない場合に「パラメータ」ボタンを表示
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
              onClick={urlClick}
            >
              パラメータ
            </Button>
          )}

          {bookmarkMessage === "" && ( // エラーメッセージがない場合に「←」ボタンを表示
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
              onClick={pathClick}
            >
              ←
            </Button>
          )}

          {bookmarkMessage === "" && ( // エラーメッセージがない場合に「開く」ボタンを表示
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
              onClick={openClick}
            >
              開く
            </Button>
          )}
        </Box>

        <Box display="flex" alignItems="center" sx={{ marginBottom: "10px" }}>
          <input
            style={{
              padding: "0.5rem",
              height: "1.2rem",
              maxWidth: "1200px",
              minWidth: "800px",
            }}
            id="url"
            placeholder="URL"
            type="text"
            aria-label="url"
            value={textUrl}
            onChange={(e) => {
              setTextUrl(e.target.value);
            }}
          />
        </Box>
        <Box display="flex" alignItems="center">
          <input
            style={{
              padding: "0.5rem",
              height: "1.2rem",
              maxWidth: "1200px",
              minWidth: "800px",
            }}
            id="title"
            placeholder="タイトル"
            type="text"
            aria-label="title"
            value={textTitle}
            onChange={(e) => {
              setTextTitle(e.target.value);
            }}
          />
        </Box>
      </div>
      <BookmarkTable bookmarks={bookmarks} />
    </>
  );
};
