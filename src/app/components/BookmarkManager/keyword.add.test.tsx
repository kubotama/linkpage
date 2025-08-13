import "@testing-library/jest-dom";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import {
  ADD_BUTTON_ROLE_NAME,
  KEYWORD_ROLE_NAME,
  TABLE_NAME_KEYWORD,
} from "../../constants/constants";
import {
  buildMockBookmarksWithKeywords,
  clickBookmark,
  createMockResponse,
  deselectBookmark,
  findBookmarkWithAtLeastNKeywords,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

const addNewKeyword = async (keyword: string) => {
  const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });
  const addButton = screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME });
  await act(async () => {
    fireEvent.change(keywordInput, { target: { value: keyword } });
    fireEvent.click(addButton);
  });
};

const expectTableRows = async (expectRows: number) => {
  const keywordTable = screen.getByRole("table", { name: TABLE_NAME_KEYWORD });
  expect(keywordTable).toBeInTheDocument();
  const rows = within(keywordTable).queryAllByRole("row");
  expect(rows).toHaveLength(expectRows);
};

const expectRowsAndKeyword = async (expectRows: number, expectKeyword: string) => {
  await waitFor(() => {
    const keywordTable = screen.getByRole("table", { name: TABLE_NAME_KEYWORD });
    const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });

    expect(keywordTable).toBeInTheDocument();
    const rows = within(keywordTable).queryAllByRole("row");
    expect(rows).toHaveLength(expectRows);
    expect(within(rows[1]).getByRole("cell")).toHaveTextContent(expectKeyword);
    expect(keywordInput).toHaveValue("");
  });
};

describe("選択されたブックマークにキーワードを追加", () => {
  let mockBookmarksWithKeywords: Bookmark[];
  let user: UserEvent;

  beforeEach(async () => {
    mockFetch.mockReset();

    global.fetch = mockFetch;

    mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarksWithKeywords,
    });
    user = userEvent.setup();

    await setupBookmarkManagerForTest();
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

      const keyword = "テストキーワード";
      await addNewKeyword(keyword);

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
            keyword_name: keyword,
          }),
        });
      });
    });

    it("テキストボックスにキーワードを入力して「追加」ボタンをクリックするとキーワードのテーブルに表示される", async () => {
      // キーワードが設定されていないブックマークを選択
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords, 0);
      await clickBookmark(bookmarkToSelect);

      await expectTableRows(1);

      // 実行
      // ブックマークにキーワードを追加
      const keyword = "テストキーワード";
      await addNewKeyword(keyword);

      // 検証
      // キーワードのテーブルに表示されていることを確認
      await expectRowsAndKeyword(2, keyword);
    });

    describe("キーワード追加後の状態遷移", () => {
      let bookmarkToSelect: Bookmark;
      const keyword = "テストキーワード";

      beforeEach(async () => {
        // キーワードが設定されていないブックマークを選択
        bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords, 0);
        await clickBookmark(bookmarkToSelect);

        await expectTableRows(1);

        // ブックマークにキーワードを追加
        await addNewKeyword(keyword);
      });

      it("キーワードを追加した後にブックマークの選択を解除すると、キーワードのテーブルが表示されなくなる", async () => {
        // 実行
        // ブックマークの選択を解除
        await deselectBookmark(user);

        // 検証
        // キーワードのテーブルが表示されていないことを確認
        await waitFor(() => {
          const keywordTable = screen.queryAllByRole("table", { name: TABLE_NAME_KEYWORD });
          expect(keywordTable).toHaveLength(0);
        });
      });

      it("キーワードを追加した後にブックマークの選択を解除して、再度ブックマークを選択すると、追加したキーワードが表示される", async () => {
        // 実行
        // ブックマークの選択を解除
        await deselectBookmark(user);
        // 同じブックマークを選択
        await clickBookmark(bookmarkToSelect);

        // 検証
        // キーワードのテーブルに表示されていることを確認
        await expectRowsAndKeyword(2, keyword);
      });
    });
  });
});
