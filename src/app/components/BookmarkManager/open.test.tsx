import "@testing-library/jest-dom";

// import fetchMock from "jest-fetch-mock";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";
import { clickBookmark } from "./click";

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

// Mock for window.open to test the 'Open' button functionality
// const mockOpen = jest.fn();
const mockOpen = vi.fn();

// Store the original window.open
const originalOpen = window.open;

// Interface to mock window.location for testing purposes
interface MockedLocation {
  href: string;
}

const mockFetch = vi.fn();

describe("「開く」ボタン: 入力されたURLを新しいタブで開く", () => {
  let originalLocation: Location;

  beforeAll(() => {
    // 元のlocationを保存
    originalLocation = window.location;

    // window.open をモック
    window.open = mockOpen as typeof window.open;

    // window.location をモックする代替アプローチ
    // Object.definePropertyを使用して一時的にlocationプロパティを再定義
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
      writable: true,
    });
  });

  afterAll(() => {
    // テスト後に元の実装を復元
    window.open = originalOpen;

    // locationを元に戻す
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
  });

  beforeEach(() => {
    // 各テスト前にモックをリセット
    // jest.clearAllMocks();
    vi.clearAllMocks();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });

    // hrefをリセット
    (window.location as MockedLocation).href = "";
  });

  it("「開く」ボタンをクリック", async () => {
    const url = "https://xtech.nikkei.com/";

    // fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
    // mockFetch.mockResolvedValueOnce({
    //   ok: true,
    //   status: 200,
    //   json: async () => mockBookmarks,
    // });

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const openButton = screen.getByRole("button", { name: "開く" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(openButton);
    });

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  it("不正なURLを入力した場合", async () => {
    // fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
    // mockFetch.mockResolvedValueOnce({
    //   ok: true,
    //   status: 200,
    //   json: async () => mockBookmarks,
    // });

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const openButton = screen.getByRole("button", { name: "開く" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: "invalid-url" } });
      fireEvent.click(openButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "Invalid URL: invalid-url"
      );
      expect(mockOpen).not.toHaveBeenCalled();
    });
  });
});
