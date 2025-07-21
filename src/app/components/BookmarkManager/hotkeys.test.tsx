import "@testing-library/jest-dom";

import { act } from "react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { URL_ROLE_NAME } from "../../constants/constants";
import {
  assertBookmarkIsSelected,
  assertNoBookmarkIsSelected,
  clickBookmark,
  mockBookmarks,
} from "../../test-utils/bookmarkTestUtils";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();
const mockOpen = vi.fn();

// Store the original window.open and window.location
const originalOpen = window.open;
let originalLocation: Location;

// Interface to mock window.location for testing purposes
interface MockedLocation {
  href: string;
}

const keyDown = async (key: string) => {
  await act(async () => {
    fireEvent.keyDown(document.body, { key: key, code: key });
  });
};

describe("BookmarkManager Hotkeys", () => {
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
      status: 200,
      json: async () => mockBookmarks,
    });

    // Reset href for window.location mock
    (window.location as MockedLocation).href = "";

    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });
  });

  it("Enterキーを押すと、選択されたブックマークのURLが開かれる", async () => {
    // ブックマークを選択
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    await keyDown("Enter");

    // window.openが正しいURLで呼び出されたことを検証
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(bookmarkToSelect.url, "_blank", "noopener,noreferrer");
    });
  });

  it("Enterキーを押した際にURLが無効な場合、エラーメッセージが表示され、URLは開かれない", async () => {
    // ブックマークを選択し、URLを無効な値に変更
    await clickBookmark(mockBookmarks[1]);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: "invalid-url" } });
    });

    // Enterキーの押下をシミュレート
    await keyDown("Enter");

    // エラーメッセージが表示され、window.openが呼び出されていないことを検証
    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "URLが無効です。正しいURLを入力してください。"
      );
      expect(mockOpen).not.toHaveBeenCalled();
    });
  });

  it("Escapeキーを押すと、選択が解除され、入力フィールドがクリアされる", async () => {
    // ブックマークを選択
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    await keyDown("Escape");

    // 入力フィールドがドキュメントから消えたことを検証
    await assertNoBookmarkIsSelected();
  });

  it("Escapeキーを押して選択が解除された後でEnterキーを押しても、なにも起きない。", async () => {
    // ブックマークを選択
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    // Escapeキーの押下をシミュレート
    await keyDown("Escape");

    // 入力フィールドがドキュメントから消えたことを検証
    await assertNoBookmarkIsSelected();

    // Enterキーの押下をシミュレート
    await keyDown("Enter");

    // window.openが呼び出されていないことを検証
    await waitFor(() => {
      expect(mockOpen).not.toHaveBeenCalled();
    });
  });

  it("ブックマークが選択されていないときに↓キーを押した。→ 一番上のブックマークが選択される。", async () => {
    await keyDown("ArrowDown");

    await assertBookmarkIsSelected(mockBookmarks[0]);
  });

  it("ブックマークが選択されていないときに↑キーを押した。→ 一番下のブックマークが選択される。", async () => {
    await keyDown("ArrowUp");

    await assertBookmarkIsSelected(mockBookmarks[mockBookmarks.length - 1]);
  });

  it("一番下のブックマークが選択されているときに↓キーを押した。→ 一番上のブックマークが選択される。", async () => {
    const lastBookmark = mockBookmarks[mockBookmarks.length - 1];
    await clickBookmark(lastBookmark);

    await keyDown("ArrowDown");

    await assertBookmarkIsSelected(mockBookmarks[0]);
  });

  it("一番上のブックマークが選択されているときに↑キーを押した。→ 一番下のブックマークが選択される。", async () => {
    const firstBookmark = mockBookmarks[0];
    await clickBookmark(firstBookmark);

    await keyDown("ArrowUp");

    await assertBookmarkIsSelected(mockBookmarks[mockBookmarks.length - 1]);
  });

  it("一番上でも下でもないブックマークが選択されているときに↓キーを押した。→ 一つ下のブックマークが選択される。", async () => {
    const middleBookmark = mockBookmarks[1];
    await clickBookmark(middleBookmark);

    await keyDown("ArrowDown");

    await assertBookmarkIsSelected(mockBookmarks[2]);
  });

  it("一番上でも下でもないブックマークが選択されているときに↑キーを押した。→ 一つ上のブックマークが選択される。", async () => {
    const middleBookmark = mockBookmarks[1];
    await clickBookmark(middleBookmark);

    await keyDown("ArrowUp");

    await assertBookmarkIsSelected(mockBookmarks[0]);
  });
});
