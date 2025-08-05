import "@testing-library/jest-dom";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { ADD_BUTTON_ROLE_NAME, KEYWORD_ROLE_NAME } from "../../constants/constants";
import {
  buildMockBookmarksWithKeywords,
  clickBookmark,
  createMockResponse,
  findBookmarkWithAtLeastNKeywords,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("選択されたブックマークにキーワードを追加", () => {
  let mockBookmarksWithKeywords: Bookmark[];

  beforeEach(async () => {
    mockFetch.mockReset();

    global.fetch = mockFetch;

    mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("キーワードの設定に成功", () => {
    beforeEach(async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          message: "キーワードをブックマークに追加しました。",
          keyword_name: "テストキーワード",
        })
      );
    });

    it("テキストボックスにキーワードを入力して「追加」ボタンをクリックするとAPIが呼び出される", async () => {
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
        expect(mockFetch.mock.calls[0][0]).toEqual(
          `${BOOKMARKS_ENDPOINT}/${bookmarkToSelect.bookmark_id}/keywords`
        );
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

    describe("キーワード追加後の状態遷移", () => {
      const addNewKeyword = async () => {
        const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });
        const addButton = screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME });
        await act(async () => {
          fireEvent.change(keywordInput, { target: { value: "テストキーワード" } });
          fireEvent.click(addButton);
        });
      };

      const deselectBookmark = async () => {
        await act(async () => {
          fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
        });
      };

      it("キーワードを追加した後にブックマークの選択を解除すると、キーワードのテーブルが表示されなくなる", async () => {
        // キーワードが設定されていないブックマークを選択
        const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords, 0);
        await clickBookmark(bookmarkToSelect);

        // 事前のキーワードのテーブルに表示されている件数を確認
        const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });
        await waitFor(() => {
          expect(within(keywordTable).queryAllByRole("row")).toHaveLength(1);
        });

        // 実行
        // ブックマークにキーワードを追加
        await addNewKeyword();
        // ブックマークの選択を解除
        await deselectBookmark();

        // 検証
        // キーワードのテーブルが表示されていないことを確認
        await waitFor(() => {
          expect(keywordTable).not.toBeInTheDocument();
        });
      });

      it("キーワードを追加した後にブックマークの選択を解除して、再度ブックマークを選択すると、追加したキーワードが表示される", async () => {
        // キーワードが設定されていないブックマークを選択
        const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords, 0);
        await clickBookmark(bookmarkToSelect);

        // 事前のキーワードのテーブルに表示されている件数を確認
        await waitFor(() => {
          const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });
          expect(within(keywordTable).queryAllByRole("row")).toHaveLength(1);
        });

        // 実行
        // ブックマークにキーワードを追加
        await addNewKeyword();
        // ブックマークの選択を解除
        await deselectBookmark();
        // 同じブックマークを選択
        await clickBookmark(bookmarkToSelect);

        await waitFor(() => {
          const keywordTable = screen.getByRole("table", { name: "キーワードのテーブル" });
          const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });

          expect(keywordTable).toBeInTheDocument();
          const rows = within(keywordTable).queryAllByRole("row");
          expect(rows).toHaveLength(2);
          expect(within(rows[1]).getByRole("cell")).toHaveTextContent("テストキーワード");
          expect(keywordInput).toHaveValue("");
        });
      });
    });
  });
});
