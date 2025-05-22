import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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

  it("テーブル内のブックマーク行をクリックすると、URLとタイトルのテキストボックスにそのブックマークの情報が表示される。「選択解除」のボタンが表示される。", async () => {
    // fetchMockはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "タイトル" })
      ).toBeInTheDocument();
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    // 入力フィールドの初期状態を確認（空であるべき）
    expect(urlInput).toHaveValue("");
    expect(titleInput).toHaveValue("");

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google

    // 選択したブックマークに対応するテーブル行を見つける
    // 行にはブックマークのタイトルを持つリンクが含まれている
    const bookmarkLinkInRow = screen.getByRole("link", {
      name: bookmarkToSelect.title,
    });
    const tableRow = bookmarkLinkInRow.closest("tr");

    if (!tableRow) {
      throw new Error(
        `ブックマーク "${bookmarkToSelect.title}" のテーブル行が見つかりませんでした。`
      );
    }

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    // BookmarkManager内のuseEffectによって入力フィールドが更新されるのを待つ
    await waitFor(() => {
      expect(urlInput).toHaveValue(bookmarkToSelect.url);
      expect(titleInput).toHaveValue(bookmarkToSelect.title);

      const unselectButton = screen.getByRole("button", { name: "選択解除" });
      expect(unselectButton).toBeInTheDocument();
    });
  });

  // TODO: 選択解除のボタンをクリックすると、URLとタイトルのテキストボックスがクリアされる。選択解除のボタンが表示されていない。
});
