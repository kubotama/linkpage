import React from "react";

import {
  ADD_BUTTON_ROLE_NAME,
  ARROW_BUTTON_ROLE_NAME,
  DELETE_BUTTON_ROLE_NAME,
  FIELDSET_KEYWORD_LABEL,
  FORM_BOOKMARK_DETAIL,
  KEYWORD_ROLE_NAME,
  LINK_BUTTON_ROLE_NAME,
  PARAMETER_BUTTON_ROLE_NAME,
  TABLE_HEADER_ALL_KEYWORD,
  TABLE_HEADER_LINKED_KEYWORD,
  TABLE_NAME_ALL_BOOKMARK,
  TABLE_NAME_ALL_KEYWORD,
  TABLE_NAME_LINKED_BOOKMARKS,
  TABLE_NAME_LINKED_KEYWORD,
  UNLINK_BUTTON_ROLE_NAME,
  UPDATE_BUTTON_ROLE_NAME,
} from "../constants/constants";
import { useBookmarks } from "../hooks/useBookmark";
import { useBookmarksLogic } from "../hooks/useBookmarkLogic";
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
  const {
    bookmarks,
    keywords,
    getBookmarks,
    getKeywords,
    deleteBookmark,
    updateBookmark,
    addKeyword,
    unlinkKeyword,
  } = useBookmarks();

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
    linkKeywordClick,
  } = useBookmarkManager({
    bookmarks,
    getBookmarks,
    getKeywords,
    deleteBookmark,
    updateBookmark,
    addKeyword,
    unlinkKeyword,
  });

  const {
    selectedBookmark,
    selectedKeywords,
    availableKeywords,
    isEnableAddKeywordButton,
    linkedBookmarkWithSelectedKeywords,
  } = useBookmarksLogic({
    bookmarks,
    keywords,
    selectedBookmarkId,
    selectedKeywordId,
    textKeyword,
  });

  return (
    <div className={`mt-5 mb-5 ${className}`}>
      <div className="flex space-x-4">
        <div>
          {linkedBookmarkWithSelectedKeywords && (
            <BookmarkTable
              bookmarks={linkedBookmarkWithSelectedKeywords}
              tableName={TABLE_NAME_LINKED_BOOKMARKS}
              selectedBookmarkId={selectedBookmarkId}
              onSelectBookmarkId={setSelectedBookmarkId}
              selectedKeywordId={selectedKeywordId}
              className="w-bookmark-list mb-2"
            />
          )}
          <BookmarkTable
            bookmarks={bookmarks}
            tableName={TABLE_NAME_ALL_BOOKMARK}
            selectedBookmarkId={selectedBookmarkId}
            onSelectBookmarkId={setSelectedBookmarkId}
            selectedKeywordId={selectedKeywordId}
            className="w-bookmark-list"
          />
        </div>
        <div className="w-bookmark-details">
          <ErrorMessage
            textMessage={textMessage}
            isError={isError}
            handleErrorClose={handleErrorClose}
            className="mb-1 flex justify-center items-center h-8"
          />

          {selectedBookmark && ( // フォーム内のボタンはtype="button"のため、onSubmitイベントは発生せず、e.preventDefault()は不要
            <form aria-label={FORM_BOOKMARK_DETAIL}>
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
                {isEnableAddKeywordButton && (
                  <div className="ml-2">
                    <ActionButton onClick={addKeywordClick} className="w-auto">
                      {ADD_BUTTON_ROLE_NAME}
                    </ActionButton>
                  </div>
                )}
              </fieldset>
            </form>
          )}
          {selectedBookmark && (
            <KeywordTable
              keywords={selectedKeywords}
              className="mt-4 w-keyword-list"
              labelText={TABLE_NAME_LINKED_KEYWORD}
              headerText={TABLE_HEADER_LINKED_KEYWORD}
              selectedKeywordId={selectedKeywordId}
              setSelectedKeywordId={setSelectedKeywordId}
              rowActionButton={{
                label: UNLINK_BUTTON_ROLE_NAME,
                onClick: unlinkKeywordClick,
              }}
            />
          )}
          <KeywordTable
            keywords={availableKeywords}
            className="mt-2 w-keyword-list"
            labelText={TABLE_NAME_ALL_KEYWORD}
            headerText={TABLE_HEADER_ALL_KEYWORD}
            selectedKeywordId={selectedKeywordId}
            setSelectedKeywordId={setSelectedKeywordId}
            {...(selectedBookmark && {
              rowActionButton: {
                label: LINK_BUTTON_ROLE_NAME,
                onClick: linkKeywordClick,
              },
            })}
          />
        </div>
      </div>
    </div>
  );
};
