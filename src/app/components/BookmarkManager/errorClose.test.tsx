import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clickBookmark } from "../../test-utils/click.test";
import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

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

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "URLを入力してください。",
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: "" } });
      fireEvent.change(titleInput, { target: { value: "" } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      const errorSpan = screen.getByTestId("bookmark-message");
      expect(errorSpan).toHaveTextContent(
        "タイトルの取得中にエラーが発生しました。"
      );
      expect(errorSpan).toHaveStyle("color: rgb(255, 0, 0)");
    });

    const closeButton = screen.getByRole("button", { name: "閉じる" });

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
    const closeButton = screen.queryByRole("button", { name: "閉じる" });
    expect(closeButton).not.toBeInTheDocument();
  });
});
