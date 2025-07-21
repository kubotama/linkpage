import "@testing-library/jest-dom";

import { act } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

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

describe("キーワード詳細フォームの表示のテスト", () => {
  let mockBookmarksWithKeywords: Bookmark[];

  beforeAll(() => {
    mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
  });

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarksWithKeywords,
    });
  });

  it("ブックマークを選択していないと、キーワード設定フォームが表示されていない。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    await waitFor(() => {
      expect(queryFieldsetKeywordLabel()).toHaveLength(0);
      expect(queryKeywordInput()).toHaveLength(0);
      expect(queryAddButton()).toHaveLength(0);
    });
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
  });
});
