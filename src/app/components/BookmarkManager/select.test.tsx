import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import {
  assertNoBookmarkIsSelected,
  clickBookmark,
  createBookmark,
  mockBookmarks,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("ブックマークの選択", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });

  it("初期状態では、URLとタイトルのテキストボックスには、なにも表示されていない。選択解除のボタンが表示されていない。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    await assertNoBookmarkIsSelected();
  });

  it("選択解除のボタンをクリックすると、URLとタイトルのテキストボックスがクリアされる。選択解除のボタンが表示されていない。", async () => {
    // mockFetchはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    });

    await assertNoBookmarkIsSelected();
  });

  it("表示されていないタイトルが指定された場合", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect: Bookmark = createBookmark({
      bookmark_id: 999,
      url: "bad url",
      title: "bad title",
    });
    await expect(clickBookmark(bookmarkToSelect)).rejects.toThrow(
      `ブックマーク "${bookmarkToSelect.title}" のテーブル行のクリック処理中にエラーが発生しました。`
    );
  });
});
