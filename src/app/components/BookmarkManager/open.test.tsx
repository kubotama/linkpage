import "@testing-library/jest-dom";

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { waitFor } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

import {
  assertBookmarkIsSelected,
  assertErrorMessage,
  clickBookmark,
  GOOGLE_BOOKMARK,
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
  let user: UserEvent;

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
    global.fetch = mockFetch;
    vi.clearAllMocks();

    // hrefをリセット
    (window.location as MockedLocation).href = "";

    user = await setupBookmarkManagerForTest({ fetchForSetup: mockFetch });
  });

  describe("ブックマーク選択後", () => {
    beforeEach(async () => {
      // クリックするブックマークを選択（例：2番目のブックマーク）
      await clickBookmark(user, GOOGLE_BOOKMARK);
      await assertBookmarkIsSelected(GOOGLE_BOOKMARK);
    });

    it("Enterキーを押した場合", async () => {
      const url = "https://xtech.nikkei.com/";

      await setBookmarkFormValuesAndEnterKeydown(user, url);

      // window.openが正しいURLで呼び出されたことを検証
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
      });
    });

    it("不正なURLを入力した場合", async () => {
      await setBookmarkFormValuesAndEnterKeydown(user, "invalid-url");

      await assertErrorMessage({
        message: "URLが無効です。正しいURLを入力してください。",
        isError: true,
        isAsync: true,
      });

      expect(mockOpen).not.toHaveBeenCalled();
    });
  });
});
