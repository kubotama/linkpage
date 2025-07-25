import React from "react";

import { KEYWORDS_ENDPOINT } from "../constants/apiEndpoints";
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
import { useBookmarkManager } from "../hooks/useBookmarkManager";
import { ActionButton } from "./ActionButton";
import { BookmarkInputField } from "./BookmarkInputField";
import { BookmarkTable } from "./BookmarkTable";
import { ErrorMessage } from "./ErrorMessage";
import { KeywordTable } from "./KeywordTable";
import { Keyword } from "../types/Keyword";

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

  const [keywords, setKeywords] = React.useState<Keyword[]>([]);

  React.useEffect(() => {
    if (selectedBookmark) {
      setKeywords(selectedBookmark.keywords);
    }
  }, [selectedBookmark]);

  const addKeywordClick = async () => {
    if (!textKeyword) {
      return;
    }
    try {
      const response = await fetch(`${KEYWORDS_ENDPOINT}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword_name: textKeyword }),
      });
      if (!response.ok) {
        throw new Error("キーワードの追加に失敗しました。");
      }
      const newKeyword = await response.json();
      setKeywords([...keywords, newKeyword]);
      setTextKeyword("");
    } catch (error: unknown) {
      console.error("キーワードの追加エラー:", (error as Error).message); // 詳細なエラーはコンソールへ
      throw error;
    }
  };

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
                <fieldset className="mt-5 flex items-end justify-start border-none p-0">
                  <legend className="sr-only">{FIELDSET_KEYWORD_LABEL}</legend>
                  <BookmarkInputField
                    id="keyword"
                    placeholder="キーワードを入力してください"
                    label={KEYWORD_ROLE_NAME}
                    value={textKeyword}
                    minWidthClass="min-w-keyword-input"
                    onChange={(e) => setTextKeyword(e.target.value)}
                  />
                  <div className="ml-2">
                    <ActionButton onClick={addKeywordClick} widthClass="w-auto">
                      {ADD_BUTTON_ROLE_NAME}
                    </ActionButton>
                  </div>
                </fieldset>
                <KeywordTable keywords={keywords} />
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
