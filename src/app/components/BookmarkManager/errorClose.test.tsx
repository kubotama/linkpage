import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clickBookmark } from "../../test-utils/bookmarkTestUtils";
import {
  CLOSE_BUTTON_ROLE_NAME,
  TITLE_ROLE_NAME,
  URL_ROLE_NAME,
} from "../../test-utils/constants";
import { mockBookmarks } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

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

    await act(async () => {
      render(<BookmarkManager />);
    });
  });

  it("エラーメッセージと閉じるボタンの表示を確認するテスト", async () => {
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const titleInput = screen.getByRole("textbox", { name: TITLE_ROLE_NAME });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: "" } });
      fireEvent.change(titleInput, { target: { value: "" } });
      fireEvent.keyDown(document.body, { key: "Enter", code: "Enter" });
    });

    await waitFor(() => {
      const errorSpan = screen.getByTestId("bookmark-message");
      expect(errorSpan).toHaveTextContent(
        "URLが無効です。正しいURLを入力してください。"
      );
      expect(errorSpan).toHaveStyle("color: rgb(255, 0, 0)");
    });

    const closeButton = screen.getByRole("button", {
      name: CLOSE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(closeButton);
    });

    await waitFor(() => {
      const errorSpan = screen.queryByTestId("bookmark-message");
      expect(errorSpan).not.toBeInTheDocument();
    });
  });

  it("should not display the close button when there is no error", async () => {
    const messageSpan = screen.queryByTestId("bookmark-message");
    expect(messageSpan).not.toBeInTheDocument();
    // Ensure the close button is not in the document
    const closeButton = screen.queryByRole("button", {
      name: CLOSE_BUTTON_ROLE_NAME,
    });
    expect(closeButton).not.toBeInTheDocument();
  });
});
