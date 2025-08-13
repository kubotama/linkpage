import "@testing-library/jest-dom";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor, within } from "@testing-library/react";

import {
  ADD_BUTTON_ROLE_NAME,
  FIELDSET_KEYWORD_LABEL,
  KEYWORD_ROLE_NAME,
} from "../../constants/constants";
import {
  buildMockBookmarksWithKeywords,
  clickBookmark,
  findBookmarkWithAtLeastNKeywords,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

const clickBookmarkAndAssertKeywords = async (bookmark: Bookmark) => {
  const keywords = bookmark.keywords;

  await clickBookmark(bookmark);

  await waitFor(() => {
    // まず、特定のキーワードテーブルをaria-labelで取得します
    const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });
    // そのテーブルのスコープ内でrowをクエリします
    const rows = within(keywordTable).queryAllByRole("row");
    // ヘッダ行の1行を追加する
    expect(rows).toHaveLength(keywords.length + 1);

    keywords.forEach((keyword, index) => {
      // ヘッダ行の1行を考慮する
      const row = rows[index + 1];
      // そのrowのスコープ内でcellをクエリします
      const cell = within(row).getByRole("cell");
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
    await setupBookmarkManagerForTest();
  });

  describe("ブックマークが選択されていない場合", () => {
    it("キーワード設定フォームは表示されない", () => {
      expect(screen.queryByRole("group", { name: FIELDSET_KEYWORD_LABEL })).not.toBeInTheDocument();
      expect(screen.queryByRole("textbox", { name: KEYWORD_ROLE_NAME })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: ADD_BUTTON_ROLE_NAME })).not.toBeInTheDocument();
    });
  });

  describe("ブックマークが選択されている場合", () => {
    it("キーワード設定フォーム（入力欄と追加ボタン）が表示される", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords);
      await clickBookmark(bookmarkToSelect);

      expect(screen.getByRole("group", { name: FIELDSET_KEYWORD_LABEL })).toBeInTheDocument();

      const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });
      expect(keywordInput).toBeInTheDocument();
      expect(keywordInput).toHaveValue("");

      const addButton = screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeEnabled();
    });

    it.each(buildMockBookmarksWithKeywords())(
      "選択されたブックマーク「$title」に設定されたキーワードが一覧で表示される",
      async (bookmark) => {
        await clickBookmarkAndAssertKeywords(bookmark);
      }
    );
  });
});
