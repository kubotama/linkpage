import "@testing-library/jest-dom";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { screen, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

import {
  ADD_BUTTON_ROLE_NAME,
  FIELDSET_KEYWORD_LABEL,
  KEYWORD_ROLE_NAME,
  TABLE_NAME_LINKED_KEYWORD,
  UNLINK_BUTTON_ROLE_NAME,
} from "../../constants/constants";
import {
  assertBookmarkIsSelected,
  buildMockBookmarksWithKeywords,
  clickBookmark,
  findBookmarkWithAtLeastNKeywords,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

describe("キーワード詳細フォームの表示のテスト", () => {
  let mockBookmarksWithKeywords: Bookmark[];
  let user: UserEvent;

  beforeAll(() => {
    mockBookmarksWithKeywords = buildMockBookmarksWithKeywords();
  });

  beforeEach(async () => {
    global.fetch = mockFetch;

    user = await setupBookmarkManagerForTest({
      fetchForSetup: mockFetch,
      bookmarksForSetup: mockBookmarksWithKeywords,
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
    it("キーワード設定フォーム（入力欄と追加ボタン）が表示される", async () => {
      const bookmarkToSelect = findBookmarkWithAtLeastNKeywords(mockBookmarksWithKeywords);
      await clickBookmark(user, bookmarkToSelect);
      await assertBookmarkIsSelected(bookmarkToSelect);

      expect(screen.getByRole("group", { name: FIELDSET_KEYWORD_LABEL })).toBeVisible();

      const keywordInput = screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME });
      expect(keywordInput).toBeVisible();
      expect(keywordInput).toHaveValue("");

      const addButton = screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME });
      expect(addButton).toBeVisible();
      expect(addButton).toBeEnabled();
    });

    it.each(buildMockBookmarksWithKeywords())(
      "選択されたブックマーク「$title」に設定されたキーワードが一覧で表示される",
      async (bookmark) => {
        const keywords = bookmark.keywords;

        await clickBookmark(user, bookmark);
        await assertBookmarkIsSelected(bookmark);

        if (keywords.length > 0) {
          const keywordTable = await screen.findByRole("table", {
            name: TABLE_NAME_LINKED_KEYWORD,
          });
          const rows = await within(keywordTable).findAllByRole("row");
          expect(rows).toHaveLength(keywords.length + 1);

          // forEachはasyncなコールバックを待たないので、for...ofループを使用する
          for (const [index, keyword] of keywords.entries()) {
            // ヘッダ行の1行を考慮する
            const row = rows[index + 1];
            // そのrowのスコープ内でcellをクエリします
            const [keywordLabel, unlinkButton] = await within(row).findAllByRole("cell");
            expect(keywordLabel).toHaveTextContent(keyword.keyword_name);
            expect(unlinkButton).toHaveTextContent(UNLINK_BUTTON_ROLE_NAME);
          }
        }
      }
    );
  });
});
