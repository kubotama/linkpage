import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockBookmarks: Bookmark[] = createBookmarkList([
  {
    id: 1,
    url: "https://github.com/kubotama/linkpage",
    title: "kubotama/linkpage",
  },
  {
    id: 2,
    url: "https://www.google.com/",
    title: "Google",
  },
  {
    id: 3,
    url: "https://mail.google.com",
    title: "Gmail",
  },
  {
    id: 4,
    url: "https://www.amazon.co.jp/",
    title: "Amazon",
  },
]);

describe("削除ボタン", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
  });

  it("ブックマークが選択されていない場合には削除ボタンは表示されない", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    const deleteButtons = screen.queryAllByRole("button", {
      name: "削除",
    });

    await waitFor(() => {
      expect(deleteButtons).toHaveLength(0);
    });
  });

  it("ブックマークが選択されると削除ボタンが表示される", async () => {
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

    await waitFor(() => {
      const deleteButton = screen.getByRole("button", { name: "削除" });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it("ブックマークが削除される(APIの呼び出し、画面の更新)", async () => {
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

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("", { status: 204 });

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      // APIの呼び出しの確認
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/bookmark/delete");
      expect(fetchMock.mock.calls[0][1]).toEqual({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: bookmarkToSelect.id }),
      });

      // 画面の更新の確認
      expect(
        screen.queryByText(bookmarkToSelect.title)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "削除" })
      ).not.toBeInTheDocument();
    });
  });

  it("存在しないブックマークの削除しようとした場合のエラーハンドリング(404)", async () => {
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

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      "指定したIDのブックマークが見つかりませんでした。",
      {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      }
    );

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "削除" })
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "指定したIDのブックマークが見つかりませんでした。"
      );
    });
  });

  it("IDがリクエストボディに含まれていない場合のエラーハンドリング(400)", async () => {
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

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("リクエストにIDがありませんでした。", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "削除" })
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "リクエストにIDがありませんでした。"
      );
    });
  });

  it("不正なJSONデータの場合のエラーハンドリング(500)", async () => {
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

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("サーバーで予期せぬエラーが発生しました。", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "削除" })
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "BookmarkManager: Error: Failed to delete: [500] サーバーで予期せぬエラーが発生しました。"
      );
    });
  });
});
