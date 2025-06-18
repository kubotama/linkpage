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
  it("再表示ボタンをクリック", async () => {
    //  「再表示」ボタンをクリックすると、ブックマークのデータを API から読み込んで、再表示されます。

    // mockFetchはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    mockFetch.mockReset();
    const updatedMockBookmarks: Bookmark[] = createBookmarkList([
      {
        url: "https://www.google.co.jp/maps/",
        title: "Google マップ",
      },
      {
        url: "https://qiita.com/",
        title: "Qiita",
      },
      {
        url: "https://zenn.dev/",
        title: "Zenn",
      },
    ]);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => updatedMockBookmarks,
    });

    const refreshButton = screen.getByRole("button", { name: "再表示" });

    await act(async () => {
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Google マップ")).toBeInTheDocument();
      expect(screen.getByText("Qiita")).toBeInTheDocument();
      expect(screen.getByText("Zenn")).toBeInTheDocument();
      expect(screen.queryAllByText("kubotama/linkpage")).toHaveLength(0);
      expect(screen.queryAllByText("Google")).toHaveLength(0);
      expect(screen.queryAllByText("Gmail")).toHaveLength(0);
      expect(screen.queryAllByText("Amazon")).toHaveLength(0);
    });
  });
});
