import "@testing-library/jest-dom";

import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";
import { clickBookmark } from "../../test-utils/click.test";

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

const mockFetch = vi.fn();

describe("「パラメータ」ボタン: URLから無駄な文字列を削除する#61", () => {
  describe("#や?の後ろを削除する", () => {
    it("https://mail.google.com/mail/u/0/#inbox", async () => {
      const url = "https://mail.google.com/mail/u/0/#inbox";

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

      // クリックするブックマークを選択（例：2番目のブックマーク）
      const bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(bookmarkToSelect);

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });

    it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh", async () => {
      const url =
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBookmarks,
      });
      await act(async () => {
        render(<BookmarkManager />);
      });

      // クリックするブックマークを選択（例：2番目のブックマーク）
      const bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(bookmarkToSelect);

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue(
          "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/"
        );
      });
    });

    it("https://mail.google.com/mail/u/0/", async () => {
      const url = "https://mail.google.com/mail/u/0/";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBookmarks,
      });

      await act(async () => {
        render(<BookmarkManager />);
      });

      // クリックするブックマークを選択（例：2番目のブックマーク）
      const bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(bookmarkToSelect);

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });
  });
});
