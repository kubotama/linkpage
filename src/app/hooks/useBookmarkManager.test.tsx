import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useBookmarkManager } from "./useBookmarkManager";
import { Bookmark, createBookmarkList } from "../types/Bookmark";

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

describe("useBookmarkManager", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });

  it("ブックマークを選択しないで「削除」ボタンを押すとエラーメッセージが表示される", async () => {
    const { result } = renderHook(() => useBookmarkManager());

    vi.resetAllMocks();

    act(() => {
      result.current.setSelectedBookmark(null);
      result.current.deleteClick();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });

  it("ブックマークを選択しないで「タイトル更新」ボタンを押すとエラーメッセージが表示される", async () => {
    const { result } = renderHook(() => useBookmarkManager());

    vi.resetAllMocks();

    act(() => {
      result.current.setSelectedBookmark(null);
      result.current.updateClick();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });
});
