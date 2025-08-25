import "@testing-library/jest-dom";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import {
  ADD_BUTTON_ROLE_NAME,
  KEYWORD_ROLE_NAME,
  TABLE_NAME_KEYWORD,
} from "../../constants/constants";
import { HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import {
  assertBookmarkIsSelected,
  buildMockBookmarksWithKeywords,
  clickBookmark,
  clickButtonByName,
  createMockResponse,
  deselectBookmark,
  findBookmarkWithAtLeastNKeywords,
  setupBookmarkManagerForTest,
  typeInTextbox,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

const addNewKeyword = async (user: UserEvent, keyword: string) => {
  await typeInTextbox(user, KEYWORD_ROLE_NAME, keyword);
  await clickButtonByName(user, ADD_BUTTON_ROLE_NAME);
};

const expectTableRows = (expectRows: number) => {
  const keywordTable = screen.getByRole("table", { name: TABLE_NAME_KEYWORD });
  expect(keywordTable).toBeVisible();
  const rows = within(keywordTable).getAllByRole("row");
  expect(rows).toHaveLength(expectRows);
};

const expectRowsAndKeyword = async (expectRows: number, expectKeyword: string) => {
  const keywordTable = await screen.findByRole("table", { name: TABLE_NAME_KEYWORD });
  const keywordInput = await screen.findByRole("textbox", { name: KEYWORD_ROLE_NAME });

  expect(keywordTable).toBeVisible();
  const rows = await within(keywordTable).findAllByRole("row");
  expect(rows).toHaveLength(expectRows);
  // ヘッダー行を考慮して、2行目のセルにキーワードが表示されることを確認します
  const newKeywordCell = await within(rows[1]).findByRole("cell");
  expect(newKeywordCell).toHaveTextContent(expectKeyword);
  expect(keywordInput).toHaveValue("");
};

describe("選択されたブックマークにキーワードを追加", () => {
  const keyword = "テストキーワード";

  let mockBookmarksWithKeywords: Bookmark[];
  let user: UserEvent;
  let bookmarkToSelect: Bookmark;

  beforeEach(async () => {
    mockFetch.mockReset();

    global.fetch = mockFetch;

    mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
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

      // キーワードが設定されていないブックマークを選択
      bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords, 0);
      await clickBookmark(user, bookmarkToSelect);
      await assertBookmarkIsSelected(bookmarkToSelect);

      expectTableRows(1);

      await addNewKeyword(user, keyword);
    });

    it("テキストボックスにキーワードを入力して「追加」ボタンをクリックするとAPIが呼び出されて、キーワードのテーブルに表示される", async () => {
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
      // キーワードのテーブルに表示されていることを確認
      await expectRowsAndKeyword(2, keyword);
    });

    describe("キーワード追加後の状態遷移", () => {
      beforeEach(async () => {
        // ブックマークの選択を解除
        await deselectBookmark(user);
      });

      it("キーワードを追加した後にブックマークの選択を解除すると、キーワードのテーブルが表示されなくなる", async () => {
        // 検証
        // キーワードのテーブルが表示されていないことを確認
        await waitFor(() =>
          expect(screen.queryByRole("table", { name: TABLE_NAME_KEYWORD })).not.toBeInTheDocument()
        );
      });

      it("キーワードを追加した後にブックマークの選択を解除して、再度ブックマークを選択すると、追加したキーワードが表示される", async () => {
        // 実行
        // 同じブックマークを選択
        await clickBookmark(user, bookmarkToSelect);

        // 検証
        // キーワードのテーブルに表示されていることを確認
        await expectRowsAndKeyword(2, keyword);
      });
    });
  });
});
