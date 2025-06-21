import React from "react";

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
            <div className="flex justify-between">
              {isError() && ( // エラーメッセージがある場合のみ「閉じる」ボタンを表示
                <button
                  type="button"
                  className="button-bookmark-manager mb-2 h-8" // h-8 により高さを2remに維持
                  onClick={handleErrorClose}
                >
                  閉じる
                </button>
              )}
              <div
                data-testid="bookmark-message"
                style={{
                  marginLeft: "0.7rem",
                  color: isError() ? "red" : "inherit", // エラーの場合は文字色を赤に
                }}
              >
                {textMessage}
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <div className="w-[800]">
            <div className="mb-2">
              <button
                onClick={refreshClick}
                className="button-bookmark-manager"
              >
                再表示
              </button>
            </div>

            <BookmarkTable
              bookmarks={bookmarks}
              onSelectBookmark={setSelectedBookmark}
            />
          </div>
          <div className="w-[500]">
            {isBookmarkSelected() && (
              <>
                <div className="mb-2 flex justify-between">
                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={() => setSelectedBookmark(null)}
                    >
                      選択解除
                    </button>
                  </div>
                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={openClick}
                    >
                      開く
                    </button>
                  </div>
                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={deleteClick}
                    >
                      削除
                    </button>
                  </div>
                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={updateClick}
                    >
                      タイトル更新
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex justify-between">
                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={titleClick}
                    >
                      タイトル
                    </button>
                  </div>

                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={clearClick}
                    >
                      クリア
                    </button>
                  </div>
                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={urlClick}
                    >
                      パラメータ
                    </button>
                  </div>
                  <div>
                    <button
                      className="button-bookmark-manager"
                      onClick={pathClick}
                    >
                      ←
                    </button>
                  </div>
                </div>
                <div>
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
                </div>
                <div>
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
