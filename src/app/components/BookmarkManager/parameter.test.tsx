import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import { PARAMETER_BUTTON_ROLE_NAME } from "../../constants/constants";
import {
  clickBookmark,
  expectBookmarkFormValues,
  mockBookmarks,
  setBookmarkFormValuesAndClickButton,
} from "../../test-utils/bookmarkTestUtils";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("「パラメータ」ボタン: URLから無駄な文字列を削除する#61", () => {
  describe("#や?の後ろを削除する", () => {
    beforeEach(async () => {
      mockFetch.mockReset();
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBookmarks,
      });

      render(<BookmarkManager />);
      await waitFor(() => {
        expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
      });

      const bookmarkToSelect = mockBookmarks[1]; // Google
      await clickBookmark(bookmarkToSelect);
    });

    it.each([
      {
        url: "https://mail.google.com/mail/u/0/#inbox",
        expectedUrl: "https://mail.google.com/mail/u/0/",
      },
      {
        url: "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh",
        expectedUrl: "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/",
      },
      {
        url: "https://mail.google.com/mail/u/0/",
        expectedUrl: "https://mail.google.com/mail/u/0/",
      },
    ])("無駄なパラメータを削除するテスト: $url", async ({ url, expectedUrl }) => {
      setBookmarkFormValuesAndClickButton({ url }, PARAMETER_BUTTON_ROLE_NAME);

      await expectBookmarkFormValues({ url: expectedUrl });
    });
  });
});
