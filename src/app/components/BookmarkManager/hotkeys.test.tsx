import "@testing-library/jest-dom";

import { act } from "react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clickBookmark } from "../../test-utils/click.test";
import {
  TITLE_ROLE_NAME,
  URL_ROLE_NAME,
  UNSELECT_BUTTON_ROLE_NAME,
} from "../../test-utils/constants";
import { mockBookmarks } from "../../types/Bookmark";
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

  beforeEach(() => {
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
  });

  it("Enterキーを押すと、選択されたブックマークのURLが開かれる", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // ブックマークを選択
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    // 入力フィールドが設定されるのを待つ
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: URL_ROLE_NAME })).toHaveValue(
        bookmarkToSelect.url
      );
    });

    // Enterキーの押下をシミュレート
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Enter", code: "Enter" });
    });

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
    await act(async () => {
      render(<BookmarkManager />);
    });

    // ブックマークを選択し、URLを無効な値に変更
    await clickBookmark(mockBookmarks[1]);
    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: "invalid-url" } });
    });

    // Enterキーの押下をシミュレート
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Enter", code: "Enter" });
    });

    // エラーメッセージが表示され、window.openが呼び出されていないことを検証
    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "URLが無効です。正しいURLを入力してください。"
      );
      expect(mockOpen).not.toHaveBeenCalled();
    });
  });

  it("Escapeキーを押すと、選択が解除され、入力フィールドがクリアされる", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // ブックマークを選択
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    // 入力フィールドが存在し、値が設定されていることを検証
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: URL_ROLE_NAME })).toHaveValue(
        bookmarkToSelect.url
      );
      expect(
        screen.getByRole("button", { name: UNSELECT_BUTTON_ROLE_NAME })
      ).toBeInTheDocument();
    });

    // Escapeキーの押下をシミュレート
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    });

    // 入力フィールドがドキュメントから消えたことを検証
    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: URL_ROLE_NAME })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("textbox", { name: TITLE_ROLE_NAME })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: UNSELECT_BUTTON_ROLE_NAME })
      ).not.toBeInTheDocument();
    });
  });

  it("Escapeキーを押して選択が解除された後でEnterキーを押しても、なにも起きない。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // ブックマークを選択
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    // 入力フィールドが存在し、値が設定されていることを検証
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: URL_ROLE_NAME })).toHaveValue(
        bookmarkToSelect.url
      );
      expect(
        screen.getByRole("button", { name: UNSELECT_BUTTON_ROLE_NAME })
      ).toBeInTheDocument();
    });

    // Escapeキーの押下をシミュレート
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    });

    // 入力フィールドがドキュメントから消えたことを検証
    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: URL_ROLE_NAME })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("textbox", { name: TITLE_ROLE_NAME })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: UNSELECT_BUTTON_ROLE_NAME })
      ).not.toBeInTheDocument();
    });

    // Enterキーの押下をシミュレート
    await act(async () => {
      fireEvent.keyDown(document.body, { key: "Enter", code: "Enter" });
    });

    // 入力フィールドがドキュメントから消えたことを検証
    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: URL_ROLE_NAME })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("textbox", { name: TITLE_ROLE_NAME })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: UNSELECT_BUTTON_ROLE_NAME })
      ).not.toBeInTheDocument();
    });
  });
});
