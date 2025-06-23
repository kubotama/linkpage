import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clickBookmark } from "../../test-utils/click.test";
import {
  CLEAR_BUTTON_ROLE_NAME,
  TITLE_ROLE_NAME,
  URL_ROLE_NAME,
} from "../../test-utils/constants";
import { mockBookmarks } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("「クリア」ボタン", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });
  it("クリアボタンがクリックされたら、URLとタイトルテキストがクリアされる。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const titleInput = screen.getByRole("textbox", { name: TITLE_ROLE_NAME });
    const clearButton = screen.getByRole("button", {
      name: CLEAR_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: "https://example.com" } });
      fireEvent.change(titleInput, { target: { value: "Example Site" } });
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("");
      expect(titleInput).toHaveValue("");
    });
  });
});
