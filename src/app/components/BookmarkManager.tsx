import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { useBookmarkManager } from "../hooks/useBookmarkManager"; // または適切なパス
import { BookmarkTable } from "./BookmarkTable";

export const BookmarkManager = ({}) => {
  const {
    bookmarks,
    isError,
    textUrl,
    textTitle,
    bookmarkMessage,
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
  } = useBookmarkManager();

  return (
    <>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <div>
          {bookmarkMessage !== "" && (
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
                {bookmarkMessage}
              </span>
            </Box>
          )}
        </div>
        <Box display="flex" alignItems="center" sx={{ marginBottom: "10px" }}>
          <>
            {isBookmarkSelected() && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    width: "8rem",
                    height: "2rem",
                    marginRight: "0.7rem",
                  }}
                  onClick={() => setSelectedBookmark(null)}
                >
                  選択解除
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    width: "8rem",
                    height: "2rem",
                    marginRight: "0.7rem",
                  }}
                  onClick={deleteClick}
                >
                  削除
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    width: "8rem",
                    height: "2rem",
                    marginRight: "0.7rem",
                  }}
                  onClick={updateClick}
                >
                  タイトル更新
                </Button>
              </>
            )}
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
              onClick={addClick}
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
          </>
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
      {bookmarks.length > 0 && (
        <BookmarkTable
          bookmarks={bookmarks}
          onSelectBookmark={setSelectedBookmark}
        />
      )}
    </>
  );
};
