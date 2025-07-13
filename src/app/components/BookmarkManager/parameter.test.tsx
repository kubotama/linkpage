import "@testing-library/jest-dom";

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clickBookmark } from "../../test-utils/bookmarkTestUtils";
import {
  PARAMETER_BUTTON_ROLE_NAME,
  URL_ROLE_NAME,
} from "../../constants/constants";
import { mockBookmarks } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("「パラメータ」ボタン: URLから無駄な文字列を削除する#61", () => {
  describe("#や?の後ろを削除する", () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      mockFetch.mockReset();
      originalFetch = global.fetch;
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBookmarks,
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });
    it("https://mail.google.com/mail/u/0/#inbox", async () => {
      const url = "https://mail.google.com/mail/u/0/#inbox";

      await act(async () => {
        render(<BookmarkManager />);
      });

      // クリックするブックマークを選択（例：2番目のブックマーク）
      const bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(bookmarkToSelect);

      const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
      const urlButton = screen.getByRole("button", {
        name: PARAMETER_BUTTON_ROLE_NAME,
      });

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

      await act(async () => {
        render(<BookmarkManager />);
      });

      // クリックするブックマークを選択（例：2番目のブックマーク）
      const bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(bookmarkToSelect);

      const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
      const urlButton = screen.getByRole("button", {
        name: PARAMETER_BUTTON_ROLE_NAME,
      });

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

      await act(async () => {
        render(<BookmarkManager />);
      });

      // クリックするブックマークを選択（例：2番目のブックマーク）
      const bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(bookmarkToSelect);

      const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
      const urlButton = screen.getByRole("button", {
        name: PARAMETER_BUTTON_ROLE_NAME,
      });

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
