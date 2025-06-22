import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clickBookmark } from "../../test-utils/click.test";
import {
  ARROW_BUTTON_ROLE_NAME,
  URL_ROLE_NAME,
} from "../../test-utils/constants";
import { mockBookmarks } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("「←」ボタン: URLから、/の階層を一段、削除する", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });
  it("https://mail.google.com/mail/u/0/", async () => {
    const url = "https://mail.google.com/mail/u/0/#inbox";

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const pathButton = screen.getByRole("button", {
      name: ARROW_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
    });
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376", async () => {
    const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376";

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue(
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
      );
    });
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/", async () => {
    const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/";

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const pathButton = screen.getByRole("button", {
      name: ARROW_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue(
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
      );
    });
  });

  it("https://xtech.nikkei.com", async () => {
    const url = "https://xtech.nikkei.com";

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const pathButton = screen.getByRole("button", {
      name: ARROW_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://xtech.nikkei.com");
    });
  });

  it("https://xtech.nikkei.com/", async () => {
    const url = "https://xtech.nikkei.com/";

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const pathButton = screen.getByRole("button", {
      name: ARROW_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://xtech.nikkei.com/");
    });
  });
});
