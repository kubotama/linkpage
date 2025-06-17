import "@testing-library/jest-dom";

import { act } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

const mockFetch = vi.fn();

describe("ブックマークの再表示", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });
  it("タイトルを取得するボタンをクリック", async () => {
    // タイトルを取得するボタンをクリックすると、タイトルを取得するAPIを呼び出す。
    // パラメータとしてURLのテキストボックスに入力された文字列が渡される。
    // タイトルのテキストボックスに、APIから返されたタイトルが表示される。

    // mockFetchはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });

    const refreshButton = screen.getByRole("button", { name: "再表示" });

    await act(async () => {
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
