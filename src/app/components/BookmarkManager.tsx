import React from "react";

import { useBookmarkManager } from "../hooks/useBookmarkManager";
import { BookmarkTable } from "./BookmarkTable";
import { ActionButton } from "./ActionButton";
import { BookmarkInputField } from "./BookmarkInputField";

export const BookmarkManager = () => {
  const {
    bookmarks,
    isError,
    textUrl,
    textTitle,
    textMessage,
    selectedBookmark,
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
      <div className="mt-5 mb-5">
        {textMessage && (
          <div className="flex justify-center items-center mb-2">
            {isError() && ( // エラーメッセージがある場合のみ「閉じる」ボタンを表示
              <ActionButton onClick={handleErrorClose}>閉じる</ActionButton>
            )}
            <div
              data-testid="bookmark-message"
              className="ml-2"
              style={{
                color: isError() ? "red" : "inherit", // エラーの場合は文字色を赤に
              }}
            >
              {textMessage}
            </div>
          </div>
        )}
        <div className="flex space-x-4">
          <div className="w-[800]">
            <div className="mb-2">
              <ActionButton onClick={refreshClick}>再表示</ActionButton>
            </div>

            <BookmarkTable
              bookmarks={bookmarks}
              selectedBookmark={selectedBookmark}
              onSelectBookmark={setSelectedBookmark}
            />
          </div>
          <div className="w-[500]">
            {isBookmarkSelected() && (
              <>
                <div className="mb-2 flex justify-between">
                  <ActionButton onClick={() => setSelectedBookmark(null)}>
                    選択解除
                  </ActionButton>
                  <ActionButton onClick={openClick}>開く</ActionButton>
                  <ActionButton onClick={deleteClick}>削除</ActionButton>
                  <ActionButton onClick={updateClick}>
                    タイトル更新
                  </ActionButton>
                </div>
                <div className="mb-2 flex justify-between">
                  <ActionButton onClick={titleClick}>タイトル</ActionButton>
                  <ActionButton onClick={clearClick}>クリア</ActionButton>
                  <ActionButton onClick={urlClick}>パラメータ</ActionButton>
                  <ActionButton onClick={pathClick}>←</ActionButton>
                </div>
                <div className="mb-1 flex justify-center">
                  <BookmarkInputField
                    id="url"
                    placeholder="URL"
                    label="URL"
                    value={textUrl}
                    onChange={(e) => {
                      setTextUrl(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-1 flex justify-center">
                  <BookmarkInputField
                    id="title"
                    placeholder="タイトル"
                    label="タイトル"
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
