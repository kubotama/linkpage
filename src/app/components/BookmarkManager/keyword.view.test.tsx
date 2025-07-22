import "@testing-library/jest-dom";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { act, render, screen, waitFor, within } from "@testing-library/react";

import {
  ADD_BUTTON_ROLE_NAME,
  FIELDSET_KEYWORD_LABEL,
  KEYWORD_ROLE_NAME,
} from "../../constants/constants";
import { buildMockBookmarksWithKeywords, clickBookmark } from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

const queryFieldsetKeywordLabel = () =>
  screen.queryAllByRole("group", { name: FIELDSET_KEYWORD_LABEL });
const queryKeywordInput = () => screen.queryAllByRole("textbox", { name: KEYWORD_ROLE_NAME });
const queryAddButton = () => screen.queryAllByRole("button", { name: ADD_BUTTON_ROLE_NAME });

const clickBookmarkAndAssertKeywords = async (bookmark: Bookmark) => {
  const keywords = bookmark.keywords;

  await clickBookmark(bookmark);

  await waitFor(() => {
    const rows = screen.queryAllByRole("keyword-row");
    expect(rows).toHaveLength(keywords.length);

    keywords.forEach((keyword, index) => {
      const row = rows[index];
      const cell = within(row).getByRole("keyword-cell");
      expect(cell).toHaveTextContent(keyword.keyword_name);
    });
  });
};

describe("キーワード詳細フォームの表示のテスト", () => {
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

  describe("ブックマークが選択されていない場合", () => {
    it("キーワード設定フォームは表示されない", () => {
      expect(screen.queryByRole("group", { name: FIELDSET_KEYWORD_LABEL })).not.toBeInTheDocument();
      expect(screen.queryByRole("textbox", { name: KEYWORD_ROLE_NAME })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: ADD_BUTTON_ROLE_NAME })).not.toBeInTheDocument();
    });
  });

  describe("ブックマークが選択されている場合", () => {
    beforeEach(async () => {
      const bookmarkToSelect = mockBookmarksWithKeywords[1];
      await clickBookmark(bookmarkToSelect);
    });

    it("キーワード設定フォーム（入力欄と追加ボタン）が表示される", () => {
      expect(screen.getByRole("group", { name: FIELDSET_KEYWORD_LABEL })).toBeInTheDocument();

      const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });
      expect(keywordInput).toBeInTheDocument();
      expect(keywordInput).toHaveValue("");

      const addButton = screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeEnabled();
    });

    it("ブックマークを選択すると、キーワード設定フォーム(キーワードを入力するテキストボックスと「追加」ボタン)が表示される。", async () => {
      await act(async () => {
        render(<BookmarkManager />);
      });

      await clickBookmark(mockBookmarksWithKeywords[1]);

      await waitFor(() => {
        expect(queryFieldsetKeywordLabel()).toHaveLength(1);

        const keywordInput = queryKeywordInput();
        expect(keywordInput).toHaveLength(1);
        expect(keywordInput[0]).toHaveValue("");

        const addButton = queryAddButton();
        expect(addButton).toHaveLength(1);
        expect(addButton[0]).toBeEnabled();
      });

      for (const bookmark of mockBookmarksWithKeywords) {
        await clickBookmarkAndAssertKeywords(bookmark);
      }
    });
  });
});
