import "@testing-library/jest-dom";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

import { TABLE_NAME_ALL_BOOKMARKS, TABLE_NAME_LINKED_BOOKMARKS } from "../../constants/constants";

import {
  buildMockBookmarksWithKeywords,
  mockKeywords,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

describe("選択したキーワードを設定しているブックマークを表示するテーブル", () => {
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

  it("キーワードを選択していない場合、すべてのブックマークテーブルは表示されるが、関連ブックマークテーブルは表示されない", async () => {
    // すべてのブックマークテーブルは常に表示されている
    expect(screen.getByRole("table", { name: TABLE_NAME_ALL_BOOKMARKS })).toBeInTheDocument();
    // 関連ブックマークテーブルは表示されていない
    expect(
      screen.queryByRole("table", { name: TABLE_NAME_LINKED_BOOKMARKS })
    ).not.toBeInTheDocument();
  });

  describe("キーワードを選択した場合", () => {
    it("キーワードを選択すると、関連ブックマークテーブルが表示される", async () => {
      const keywordCell = screen.getByText(mockKeywords[0].keyword_name);
      await user.click(keywordCell);

      expect(screen.getByRole("table", { name: TABLE_NAME_LINKED_BOOKMARKS })).toBeInTheDocument();
    });
  });
});
