import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { useBookmarkManager } from "../hooks/useBookmarkManager";
import { BookmarkTable } from "./BookmarkTable";

export const BookmarkManager = ({}) => {
  const {
    bookmarks,
    isError,
    textUrl,
    textTitle,
    textMessage,
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
    refreshClick,
  } = useBookmarkManager();

  return (
    <>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <div>
          {textMessage && (
            <Box
              display="flex"
              alignItems="center"
              sx={{ marginBottom: "10px" }}
            >
              {isError() && ( // エラーメッセージがある場合のみ「閉じる」ボタンを表示
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
                  color: isError() ? "red" : "inherit", // エラーの場合は文字色を赤に
                }}
              >
                {textMessage}
              </span>
            </Box>
          )}
        </div>
        {isBookmarkSelected() && (
          <>
            <Box
              display="flex"
              alignItems="center"
              sx={{ marginBottom: "10px" }}
            >
              <>
                <button
                  className="button-bookmark-manager"
                  onClick={() => setSelectedBookmark(null)}
                >
                  選択解除
                </button>
                <button className="button-bookmark-manager" onClick={openClick}>
                  開く
                </button>
                <button
                  className="button-bookmark-manager"
                  onClick={deleteClick}
                >
                  削除
                </button>
                <button
                  className="button-bookmark-manager"
                  onClick={updateClick}
                >
                  タイトル更新
                </button>
              </>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{ marginBottom: "10px" }}
            >
              <>
                <button
                  className="button-bookmark-manager"
                  onClick={titleClick}
                >
                  タイトル
                </button>

                <button
                  className="button-bookmark-manager"
                  onClick={clearClick}
                >
                  クリア
                </button>

                <button className="button-bookmark-manager" onClick={urlClick}>
                  パラメータ
                </button>

                <button className="button-bookmark-manager" onClick={pathClick}>
                  ←
                </button>
              </>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              sx={{ marginBottom: "10px" }}
            >
              <input
                className="text-bookmark-manager"
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
                className="text-bookmark-manager"
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
          </>
        )}
      </div>
      <Box display="flex" alignItems="center" sx={{ marginBottom: "10px" }}>
        <Button
          variant="contained"
          onClick={refreshClick}
          sx={{ height: "2rem" }}
        >
          再表示
        </Button>
      </Box>

      {bookmarks.length > 0 && (
        <BookmarkTable
          bookmarks={bookmarks}
          onSelectBookmark={setSelectedBookmark}
        />
      )}
    </>
  );
};
