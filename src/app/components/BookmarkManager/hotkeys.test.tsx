import "@testing-library/jest-dom";

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import {
  assertBookmarkIsSelected,
  assertErrorMessage,
  assertNoBookmarkIsSelected,
  clickBookmark,
  deselectBookmark,
  GOOGLE_BOOKMARK,
  keyDown,
  mockBookmarks,
  setBookmarkFormValuesAndClickButton,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";
import { Bookmark } from "../../types/Bookmark";

const mockFetch = vi.fn();
const mockOpen = vi.fn();

// Store the original window.open and window.location
const originalOpen = window.open;
let originalLocation: Location;

// Interface to mock window.location for testing purposes
interface MockedLocation {
  href: string;
}

describe("BookmarkManager Hotkeys", () => {
  let user: UserEvent;
  let bookmarkToSelect: Bookmark;

  beforeAll(() => {
    // Save original window.location
    originalLocation = window.location;

    // Mock window.open
    window.open = mockOpen as typeof window.open;

    // Mock window.location using Object.defineProperty
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
      writable: true,
    });
  });

  afterAll(() => {
    // Restore original implementations after all tests
    window.open = originalOpen;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
  });

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => mockBookmarks,
    });

    // Reset href for window.location mock
    (window.location as MockedLocation).href = "";

    user = userEvent.setup();

    await setupBookmarkManagerForTest();
  });

  describe("ブックマークが選択されている場合", () => {
    beforeEach(async () => {
      // 2番目のブックマーク「Google」を選択
      bookmarkToSelect = GOOGLE_BOOKMARK; // Google
      await clickBookmark(user, bookmarkToSelect);
      await assertBookmarkIsSelected(bookmarkToSelect);
    });

    it("Enterキーを押すと、選択されたブックマークのURLが開かれる", async () => {
      await keyDown(user, "{enter}");

      // window.openが正しいURLで呼び出されたことを検証
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith(
          bookmarkToSelect.url,
          "_blank",
          "noopener,noreferrer"
        );
      });
    });

    it("Enterキーを押した際にURLが無効な場合、エラーメッセージが表示され、URLは開かれない", async () => {
      // ブックマークを選択し、URLを無効な値に変更
      await setBookmarkFormValuesAndClickButton(user, { url: "invalid-url" });

      // Enterキーの押下をシミュレート
      await keyDown(user, "{enter}");

      // エラーメッセージが表示され、window.openが呼び出されていないことを検証
      await assertErrorMessage({
        message: "URLが無効です。正しいURLを入力してください。",
        isError: true,
        isAsync: true,
      });
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it("Escapeキーを押すと、選択が解除され、入力フィールドがクリアされる", async () => {
      await deselectBookmark(user);

      // 入力フィールドがドキュメントから消えたことを検証
      await assertNoBookmarkIsSelected();
    });

    it("Escapeキーを押して選択が解除された後でEnterキーを押しても、なにも起きない。", async () => {
      // Escapeキーの押下をシミュレート
      await deselectBookmark(user);

      // 入力フィールドがドキュメントから消えたことを検証
      await assertNoBookmarkIsSelected();

      // Enterキーの押下をシミュレート
      await keyDown(user, "{enter}");

      // window.openが呼び出されていないことを検証
      await waitFor(() => {
        expect(mockOpen).not.toHaveBeenCalled();
      });
    });
  });

  it.each([
    {
      selectRow: undefined,
      key: "{arrowdown}",
      expectedRow: 1,
    },
    {
      selectRow: undefined,
      key: "{arrowup}",
      expectedRow: mockBookmarks.length,
    },
    {
      selectRow: mockBookmarks.length,
      key: "{arrowdown}",
      expectedRow: 1,
    },
    {
      selectRow: 1,
      key: "{arrowup}",
      expectedRow: mockBookmarks.length,
    },
    {
      selectRow: 2,
      key: "{arrowdown}",
      expectedRow: 3,
    },
    {
      selectRow: 3,
      key: "{arrowup}",
      expectedRow: 2,
    },
  ])(
    "$keyキーを押したときに $expectedRow行目が選択される。",
    async ({ selectRow, key, expectedRow }) => {
      if (selectRow !== undefined) {
        await clickBookmark(user, mockBookmarks[selectRow - 1]);
        await assertBookmarkIsSelected(mockBookmarks[selectRow - 1]);
      }
      await keyDown(user, key);
      await assertBookmarkIsSelected(mockBookmarks[expectedRow - 1]);
    }
  );
});
