import "@testing-library/jest-dom";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { KEYWORDS_ENDPOINT } from "../../constants/apiEndpoints";
import { ADD_BUTTON_ROLE_NAME, KEYWORD_ROLE_NAME } from "../../constants/constants";
import {
  buildMockBookmarksWithKeywords,
  clickBookmark,
  findBookmarkWithAtLeastNKeywords,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("選択されたブックマークにキーワードを追加", () => {
  let mockBookmarksWithKeywords: Bookmark[];

  beforeAll(() => {
    mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
  });

  beforeEach(async () => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarksWithKeywords,
    });
    render(<BookmarkManager />);
    await waitFor(() => {
      expect(screen.getByText(mockBookmarksWithKeywords[0].title)).toBeInTheDocument();
    });
  });

  it("テキストボックスにキーワードを入力して「追加」ボタンをクリックするとAPIが呼び出される", async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ keyword_id: "1", keyword_name: "テストキーワード" }),
    });
    // キーワードが設定されていないブックマークを選択
    const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords, 0);
    await clickBookmark(bookmarkToSelect);

    const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });
    const addButton = screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME });

    await act(async () => {
      fireEvent.change(keywordInput, { target: { value: "テストキーワード" } });
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toEqual(`${KEYWORDS_ENDPOINT}/`);
      expect(mockFetch.mock.calls[0][1]).toEqual({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword_name: "テストキーワード",
        }),
      });
    });
  });

  it("テキストボックスにキーワードを入力して「追加」ボタンをクリックするとキーワードのテーブルに表示される", async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ keyword_id: "1", keyword_name: "テストキーワード" }),
    });
    // キーワードが設定されていないブックマークを選択
    const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords, 0);
    await clickBookmark(bookmarkToSelect);

    const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });
    const addButton = screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME });
    const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });

    await waitFor(() => {
      expect(keywordTable).toBeInTheDocument();
      const rows = within(keywordTable).queryAllByRole("row");
      expect(rows).toHaveLength(1);
    });

    await act(async () => {
      fireEvent.change(keywordInput, { target: { value: "テストキーワード" } });
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(keywordTable).toBeInTheDocument();
      const rows = within(keywordTable).queryAllByRole("row");
      expect(rows).toHaveLength(2);
      const cell = within(rows[1]).getByRole("cell");
      expect(cell).toHaveTextContent("テストキーワード");
      expect(keywordInput).toHaveValue("");
    });
  });
});
