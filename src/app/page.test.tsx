import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "./types/Bookmark";
import Home from "./page";
import { clickBookmark } from "./components/BookmarkManager/select.test";

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("すべてのエレメントが表示されることを確認", async () => {
    const mockBookmarks: Bookmark[] = createBookmarkList([
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      { url: "https://www.google.com/", title: "Google" },
    ]);

    await act(async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
      render(<Home />);
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    await waitFor(() => {
      expect(screen.getByText("タイトル")).toBeInTheDocument();

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const titleInput = screen.getByRole("textbox", { name: "title" });
      expect(urlInput).toHaveValue(bookmarkToSelect.url);
      expect(titleInput).toHaveValue(bookmarkToSelect.title);
    });
  });
});
