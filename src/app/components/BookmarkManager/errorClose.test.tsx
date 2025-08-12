import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, screen, waitFor } from "@testing-library/react";

import { CLOSE_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  keyDown,
  mockBookmarks,
  setBookmarkFormValuesAndClickButton,
  setupBookmarkManagerForTest,
} from "../../test-utils/bookmarkTestUtils";

const mockFetch = vi.fn();

describe("BookmarkManager", () => {
  beforeEach(async () => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });

    await setupBookmarkManagerForTest();
  });

  it("エラーメッセージと閉じるボタンの表示を確認するテスト", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    await setBookmarkFormValuesAndClickButton({ url: "", title: "" });
    keyDown("Enter");

    await waitFor(() => {
      const errorSpan = screen.getByTestId("bookmark-message");
      expect(errorSpan).toHaveTextContent("URLが無効です。正しいURLを入力してください。");
      expect(errorSpan).toHaveClass("text-red-500");
    });

    const closeButton = screen.getByRole("button", {
      name: CLOSE_BUTTON_ROLE_NAME,
    });

    fireEvent.click(closeButton);

    await waitFor(() => {
      const errorSpan = screen.queryAllByTestId("bookmark-message");
      expect(errorSpan).toHaveLength(0);
    });
  });

  it("should not display the close button when there is no error", async () => {
    const messageSpan = screen.queryAllByTestId("bookmark-message");
    expect(messageSpan).toHaveLength(0);

    // Ensure the close button is not in the document
    const closeButton = screen.queryAllByRole("button", {
      name: CLOSE_BUTTON_ROLE_NAME,
    });
    expect(closeButton).toHaveLength(0);
  });
});
