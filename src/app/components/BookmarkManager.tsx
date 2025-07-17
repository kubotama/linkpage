import React from "react";

import {
  ADD_BUTTON_ROLE_NAME,
  ARROW_BUTTON_ROLE_NAME,
  DELETE_BUTTON_ROLE_NAME,
  FORM_BOOKMARK_DETAIL,
  FIELDSET_KEYWORD_LABEL,
  PARAMETER_BUTTON_ROLE_NAME,
  UPDATE_BUTTON_ROLE_NAME,
} from "../constants/constants";
import { useBookmarkManager } from "../hooks/useBookmarkManager";
import { ActionButton } from "./ActionButton";
import { BookmarkInputField } from "./BookmarkInputField";
import { BookmarkTable } from "./BookmarkTable";
import { ErrorMessage } from "./ErrorMessage";

export const BookmarkManager = () => {
  const {
    bookmarks,
    isError,
    textUrl,
    textTitle,
    textKeyword,
    textMessage,
    selectedBookmark,
    setSelectedBookmark,
    setTextUrl,
    setTextTitle,
    setTextKeyword,
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
              <form aria-label={FORM_BOOKMARK_DETAIL} onSubmit={(e) => e.preventDefault()}>
                <div className="mb-2 flex justify-between">
                  <ActionButton onClick={updateClick}>{UPDATE_BUTTON_ROLE_NAME}</ActionButton>
                  <ActionButton onClick={deleteClick}>{DELETE_BUTTON_ROLE_NAME}</ActionButton>
                  <ActionButton onClick={urlClick}>{PARAMETER_BUTTON_ROLE_NAME}</ActionButton>
                  <ActionButton onClick={pathClick}>{ARROW_BUTTON_ROLE_NAME}</ActionButton>
                </div>
                <div className="mb-1 flex justify-center">
                  <BookmarkInputField
                    id="url"
                    placeholder="URL"
                    label="URL"
                    value={textUrl}
                    onChange={(e) => setTextUrl(e.target.value)}
                  />
                </div>
                <div className="mb-1 flex justify-center">
                  <BookmarkInputField
                    id="title"
                    placeholder="タイトル"
                    label="タイトル"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                  />
                </div>
                <fieldset
                  aria-label={FIELDSET_KEYWORD_LABEL}
                  className="mt-5 flex items-end justify-start border-none p-0"
                >
                  <BookmarkInputField
                    id="keyword"
                    placeholder="キーワードを入力してください"
                    label="キーワード"
                    value={textKeyword}
                    minWidthClass="min-w-keyword-input"
                    onChange={(e) => setTextKeyword(e.target.value)}
                  />
                  <div className="ml-2">
                    <ActionButton onClick={() => {}}>{ADD_BUTTON_ROLE_NAME}</ActionButton>
                  </div>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
