import React from "react";

import { useBookmarkManager } from "../hooks/useBookmarkManager";
import { ActionButton } from "./ActionButton";
import { BookmarkInputField } from "./BookmarkInputField";
import { BookmarkTable } from "./BookmarkTable";
import { ErrorMessage } from "./ErrorMessage";
import { FORM_BOOKMARK_DETAIL } from "../test-utils/constants";

export const BookmarkManager = () => {
  const {
    bookmarks,
    isError,
    textUrl,
    textTitle,
    textMessage,
    selectedBookmark,
    setSelectedBookmark,
    setTextUrl,
    setTextTitle,
    deleteClick,
    urlClick,
    pathClick,
    handleErrorClose,
    updateClick,
  } = useBookmarkManager();

  return (
    <>
      <div className="mt-5 mb-5">
        <div className="flex space-x-4">
          <div className="w-bookmark-list">
            <BookmarkTable
              bookmarks={bookmarks}
              selectedBookmark={selectedBookmark}
              onSelectBookmark={setSelectedBookmark}
            />
          </div>
          <div className="w-bookmark-details">
            <div className="mb-1 flex justify-center items-center h-8">
              <ErrorMessage
                textMessage={textMessage}
                isError={isError}
                handleErrorClose={handleErrorClose}
              />
            </div>
            {selectedBookmark && (
              <div role="form" aria-label={FORM_BOOKMARK_DETAIL}>
                <div className="mb-2 flex justify-between">
                  <ActionButton onClick={updateClick}>更新</ActionButton>
                  <ActionButton onClick={deleteClick}>削除</ActionButton>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
