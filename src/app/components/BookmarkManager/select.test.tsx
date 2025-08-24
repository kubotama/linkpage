import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import userEvent, { UserEvent } from "@testing-library/user-event";

import { HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import {
  assertBookmarkIsSelected,
  assertNoBookmarkIsSelected,
  clickBookmark,
  createBookmark,
  deselectBookmark,
  GOOGLE_BOOKMARK,
  mockBookmarks,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();

describe("ブックマークの選択", () => {
  let user: UserEvent;

  beforeEach(async () => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => mockBookmarks,
    });
    user = userEvent.setup();

    await setupBookmarkManagerForTest();
  });

  it("初期状態では、URLとタイトルのテキストボックスには、なにも表示されていない。選択解除のボタンが表示されていない。", async () => {
    await assertNoBookmarkIsSelected();
  });

  it("選択解除のボタンをクリックすると、URLとタイトルのテキストボックスがクリアされる。選択解除のボタンが表示されていない。", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = GOOGLE_BOOKMARK; // Google
    await clickBookmark(user, bookmarkToSelect);
    await assertBookmarkIsSelected(bookmarkToSelect);

    await deselectBookmark(user);

    await assertNoBookmarkIsSelected();
  });

  it("表示されていないタイトルが指定された場合", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect: Bookmark = createBookmark({
      bookmark_id: 999,
      url: "bad url",
      title: "bad title",
    });
    await expect(clickBookmark(user, bookmarkToSelect)).rejects.toThrow(
      `ブックマーク "${bookmarkToSelect.title}" の選択処理中にエラーが発生しました。`
    );
  });
});
