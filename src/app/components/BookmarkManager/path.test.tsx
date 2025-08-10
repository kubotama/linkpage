import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ARROW_BUTTON_ROLE_NAME, URL_ROLE_NAME } from "../../constants/constants";
import { clickBookmark, mockBookmarks } from "../../test-utils/bookmarkTestUtils";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

const expectChangedText = (url: string, changedUrl: string) => {
  const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
  const pathButton = screen.getByRole("button", {
    name: ARROW_BUTTON_ROLE_NAME,
  });

  fireEvent.change(urlInput, { target: { value: url } });
  fireEvent.click(pathButton);

  expect(urlInput).toHaveValue(changedUrl);
};

describe("「←」ボタン: URLから、/の階層を一段、削除する", () => {
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

    await clickBookmark(mockBookmarks[1]);
  });
  it("https://mail.google.com/mail/u/0/", async () => {
    expectChangedText(
      "https://mail.google.com/mail/u/0/#inbox",
      "https://mail.google.com/mail/u/#inbox"
    );
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376", async () => {
    expectChangedText(
      "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376",
      "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
    );
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/", async () => {
    expectChangedText(
      "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/",
      "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
    );
  });

  it("https://xtech.nikkei.com", async () => {
    expectChangedText("https://xtech.nikkei.com", "https://xtech.nikkei.com");
  });

  it("https://xtech.nikkei.com/", async () => {
    expectChangedText("https://xtech.nikkei.com/", "https://xtech.nikkei.com/");
  });

  it("https://xtech.nikkei.com/atcl", async () => {
    expectChangedText("https://xtech.nikkei.com/atcl", "https://xtech.nikkei.com/");
  });

  it("invalid-url", async () => {
    const url = "invalid-url";
    expectChangedText(url, url);
  });
});
