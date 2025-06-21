import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clickBookmark } from "../../test-utils/click.test";
import { Bookmark, mockBookmarks } from "../../types/Bookmark";
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

    const urlInput = screen.queryAllByRole("textbox", { name: "url" });
    const titleInput = screen.queryAllByRole("textbox", { name: "title" });
    const unselectButton = screen.queryAllByRole("button", {
      name: "選択解除",
    });

    await waitFor(() => {
      expect(urlInput).toHaveLength(0);
      expect(titleInput).toHaveLength(0);
      expect(unselectButton).toHaveLength(0);
    });
  });

  it("テーブル内のブックマーク行をクリックすると、URLとタイトルのテキストボックスにそのブックマークの情報が表示される。「選択解除」のボタンが表示される。", async () => {
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

    // BookmarkManager内のuseEffectによって入力フィールドが更新されるのを待つ
    await waitFor(() => {
      const urlInput = screen.getByRole("textbox", { name: "url" });
      const titleInput = screen.getByRole("textbox", { name: "title" });
      expect(urlInput).toHaveValue(bookmarkToSelect.url);
      expect(titleInput).toHaveValue(bookmarkToSelect.title);

      const unselectButton = screen.getByRole("button", { name: "選択解除" });
      expect(unselectButton).toBeInTheDocument();
    });
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

    // BookmarkManager内のuseEffectによって入力フィールドが更新されるのを待つ;
    await waitFor(() => {
      const urlInput = screen.getByRole("textbox", { name: "url" });
      const titleInput = screen.getByRole("textbox", { name: "title" });
      expect(urlInput).toHaveValue(bookmarkToSelect.url);
      expect(titleInput).toHaveValue(bookmarkToSelect.title);

      expect(
        screen.getByRole("button", { name: "選択解除" })
      ).toBeInTheDocument();
    });

    const unselectButton = screen.getByRole("button", { name: "選択解除" });
    await act(async () => {
      fireEvent.click(unselectButton);
    });
    await waitFor(() => {
      const urlInput = screen.queryAllByRole("textbox", { name: "url" });
      const titleInput = screen.queryAllByRole("textbox", { name: "title" });
      const unselectButton = screen.queryAllByRole("button", {
        name: "選択解除",
      });

      expect(urlInput).toHaveLength(0);
      expect(titleInput).toHaveLength(0);
      expect(unselectButton).toHaveLength(0);
    });
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
    const bookmarkToSelect: Bookmark = {
      id: 999,
      url: "bad url",
      title: "bad title",
    };
    try {
      await clickBookmark(bookmarkToSelect);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe(
        `ブックマーク "${bookmarkToSelect.title}" のテーブル行のクリック処理中にエラーが発生しました。`
      );
    }
  });
});
