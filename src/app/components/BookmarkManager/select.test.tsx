import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { render, screen, waitFor } from "@testing-library/react";

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

describe("ブックマークの選択", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
  });

  it("初期状態では、URLとタイトルのテキストボックスには、なにも表示されていない。選択解除のボタンが表示されていない。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const unselectButton = screen.queryAllByRole("button", {
      name: "選択解除",
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("");
      expect(titleInput).toHaveValue("");
      expect(unselectButton).toHaveLength(0);
    });
  });
  // TODO: ブックマークの行をクリックすると、URLとタイトルのテキストボックスに選択されたブックマークが表示される。選択解除のボタンが表示される。

  // TODO: 選択解除のボタンをクリックすると、URLとタイトルのテキストボックスがクリアされる。選択解除のボタンが表示されていない。
});
