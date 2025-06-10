import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

import { clickBookmark } from "./select.test";

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

describe("「クリア」ボタン", () => {
  it("クリアボタンがクリックされたら、URLとタイトルテキストがクリアされる。", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const clearButton = screen.getByRole("button", { name: "クリア" });

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
