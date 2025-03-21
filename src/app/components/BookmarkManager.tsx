import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";

import Button from "@mui/material/Button";

import { useMessage } from "../contexts/MessageContext";
// import BmDetail from "./bmDetail";
import { BmGrid } from "./bmGrid";

export type Bookmark = {
  url: string;
  title: string;
};

export const BookmarkManager = ({}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [textUrl, setTextUrl] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const { setMessage } = useMessage();

  useEffect(() => {
    if (loading) {
      setMessage({ text: "Loading..." });
    } else if (error) {
      setMessage({ text: error });
    } else {
      setMessage({ text: "" });
    }
  }, [loading, error, setMessage]);

  useEffect(() => {
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
    const newBookmark = { url: textUrl, title: textTitle };
    const newBookmarks = [...bookmarks, newBookmark];
    setBookmarks(newBookmarks);

    fetch("/api/bookmark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBookmarks),
    })
      .then((response) => {
        if (!response.ok) {
          setError(
            `BookmarkManager: [${response.status}] ${response.statusText}`
          );
        }
      })
      .catch((error) => {
        setError(`BookmarkManager: ${error}`);
      });
  };

  const updateClick = () => {
    handleAddBookmark(textUrl, textTitle);
  };

  const titleClick = async () => {
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
          setMessage({ text: "" });
        }
      })
      .catch((error) => {
        setTextTitle("");
        setMessage({ text: error.message + textUrl });
      });
  };

  const urlClick = () => {
    // #や?の後ろを削除する
    // #や?のない場合は、入力されたURLをそのままとする
    const regex = /(https?:\/\/(.*?))(?:[#\?].*|$)/;
    const matches = textUrl.match(regex);

    if (matches && matches.length > 2) {
      setTextUrl(matches[1]);
    }
  };

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

  const openClick = () => {
    try {
      new URL(textUrl);
      // 新しいウィンドウでURLを開く
      window.open(textUrl, "_blank", "noopener,noreferrer");
    } catch (error: unknown) {
      setMessage({ text: (error as Error).message });
    }
  };

  const clearClick = () => {
    setTextUrl("");
    setTextTitle("");
  };

  return (
    <>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <Box display="flex" alignItems="center" sx={{ marginBottom: "10px" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "8rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={titleClick}
          >
            タイトル
          </Button>

          <Button
            variant="contained"
            color="primary"
            sx={{ width: "8rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={updateClick}
          >
            追加
          </Button>

          <Button
            variant="contained"
            color="primary"
            sx={{ width: "8rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={clearClick}
          >
            クリア
          </Button>

          <Button
            variant="contained"
            color="primary"
            sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={urlClick}
          >
            パラメータ
          </Button>

          <Button
            variant="contained"
            color="primary"
            sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={pathClick}
          >
            ←
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "7rem", height: "2rem", marginRight: "0.7rem" }}
            onClick={openClick}
          >
            開く
          </Button>
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
      <BmGrid bookmarks={bookmarks} />
    </>
  );
};
