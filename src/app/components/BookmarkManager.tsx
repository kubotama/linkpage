import React, { useMemo } from "react";

import {
  ADD_BUTTON_ROLE_NAME,
  ARROW_BUTTON_ROLE_NAME,
  DELETE_BUTTON_ROLE_NAME,
  FIELDSET_KEYWORD_LABEL,
  FORM_BOOKMARK_DETAIL,
  KEYWORD_ROLE_NAME,
  PARAMETER_BUTTON_ROLE_NAME,
  UPDATE_BUTTON_ROLE_NAME,
} from "../constants/constants";
import { useBookmarks } from "../hooks/useBookmark";
import { useBookmarkManager } from "../hooks/useBookmarkManager";
import { ActionButton } from "./ActionButton";
import { BookmarkInputField } from "./BookmarkInputField";
import { BookmarkTable } from "./BookmarkTable";
import { ErrorMessage } from "./ErrorMessage";
import { KeywordTable } from "./KeywordTable";

type BookmarkManagerProps = {
  className?: string;
};

export const BookmarkManager = ({ className = "" }: BookmarkManagerProps) => {
  const { bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword, unlinkKeyword } =
    useBookmarks();

  const {
    isError,
    textUrl,
    textTitle,
    textKeyword,
    textMessage,
    selectedBookmarkId,
    selectedKeywordId,
    setSelectedBookmarkId,
    setSelectedKeywordId,
    setTextUrl,
    setTextTitle,
    setTextKeyword,
    deleteClick,
    urlClick,
    pathClick,
    handleErrorClose,
    updateClick,
    addKeywordClick,
    unlinkKeywordClick,
  } = useBookmarkManager({
    bookmarks,
    getBookmarks,
    deleteBookmark,
    updateBookmark,
    addKeyword,
    unlinkKeyword,
  });

  const selectedBookmark = useMemo(
    () => bookmarks.find((b) => b.bookmark_id === selectedBookmarkId),
    [bookmarks, selectedBookmarkId]
  );

  return (
    <div className={`mt-5 mb-5 ${className}`}>
      <div className="flex space-x-4">
        <BookmarkTable
          bookmarks={bookmarks}
          selectedBookmarkId={selectedBookmarkId}
          onSelectBookmarkId={setSelectedBookmarkId}
          selectedKeywordId={selectedKeywordId}
          setSelectedKeywordId={setSelectedKeywordId}
          className="w-bookmark-list"
        />
        <div className="w-bookmark-details">
          <ErrorMessage
            textMessage={textMessage}
            isError={isError}
            handleErrorClose={handleErrorClose}
            className="mb-1 flex justify-center items-center h-8"
          />
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
              <KeywordTable
                keywords={selectedBookmark.keywords}
                className="mt-2 w-keyword-list"
                selectedKeywordId={selectedKeywordId}
                setSelectedKeywordId={setSelectedKeywordId}
                unlinkKeywordClick={unlinkKeywordClick}
              />
              <fieldset className="mt-5 flex items-end justify-start border-none p-0">
                <legend className="sr-only">{FIELDSET_KEYWORD_LABEL}</legend>
                <BookmarkInputField
                  id="keyword"
                  placeholder="キーワードを入力してください"
                  label={KEYWORD_ROLE_NAME}
                  value={textKeyword}
                  className="min-w-keyword-input"
                  onChange={(e) => setTextKeyword(e.target.value)}
                />
                <div className="ml-2">
                  <ActionButton onClick={addKeywordClick} className="w-auto">
                    {ADD_BUTTON_ROLE_NAME}
                  </ActionButton>
                </div>
              </fieldset>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
