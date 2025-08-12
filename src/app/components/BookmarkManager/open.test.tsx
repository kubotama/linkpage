import "@testing-library/jest-dom";

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { screen, waitFor } from "@testing-library/react";

import {
  clickBookmark,
  mockBookmarks,
  setBookmarkFormValuesAndEnterKeydown,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";

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

  beforeEach(async () => {
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

    await setupBookmarkManagerForTest();
  });

  describe("ブックマーク選択後", () => {
    beforeEach(async () => {
      // クリックするブックマークを選択（例：2番目のブックマーク）
      await clickBookmark(mockBookmarks[1]);
    });

    it("Enterキーを押した場合", async () => {
      const url = "https://xtech.nikkei.com/";

      await setBookmarkFormValuesAndEnterKeydown(url);

      // window.openが正しいURLで呼び出されたことを検証
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
      });
    });

    it("不正なURLを入力した場合", async () => {
      await setBookmarkFormValuesAndEnterKeydown("invalid-url");

      // エラーメッセージが表示され、window.openが呼び出されていないことを検証
      await waitFor(() => {
        expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
          "URLが無効です。正しいURLを入力してください。"
        );
        expect(mockOpen).not.toHaveBeenCalled();
      });
    });
  });
});
