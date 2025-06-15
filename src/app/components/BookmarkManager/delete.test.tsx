import "@testing-library/jest-dom";

import { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

import { clickBookmark } from "../../test-utils/click.test";

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

const mockFetch = vi.fn();

describe("削除ボタン", () => {
  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
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
    await act(async () => {
      render(<BookmarkManager />);
    });

    // 初期データがロードされ、UIが安定するのを待つ
    // テーブル内に既知のブックマークのタイトルが表示されることを確認
    // また、アクションボタンが表示されていることで、メインUIの準備ができていることを確認
    await waitFor(() => {
      expect(screen.getByText(mockBookmarks[0].title)).toBeInTheDocument();
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

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
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    // fetchMock.resetMocks();
    // fetchMock.mockResponseOnce("", { status: 204 });
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      // APIの呼び出しの確認
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toEqual("/api/bookmark/delete");
      expect(mockFetch.mock.calls[0][1]).toEqual({
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
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: false, // 404の場合は false
      status: 404,
      headers: { "Content-Type": "text/plain" },
      text: async () => "指定されたブックマークがありません。",
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの削除中にエラーが発生しました。"
      );
      // 削除操作のコンテキスト（選択されたブックマークのタイトルや削除ボタン）が依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
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
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: false, // 400の場合は false
      status: 400,
      headers: { "Content-Type": "text/plain" },
      text: async () => "リクエストにIDがありませんでした。",
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの削除中にエラーが発生しました。"
      );
      // 削除操作のコンテキスト（選択されたブックマークのタイトルや削除ボタン）が依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
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

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: false, // 500の場合は false
      status: 500,
      headers: { "Content-Type": "text/plain" },
      text: async () => "サーバーで予期せぬエラーが発生しました。",
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
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの削除中にエラーが発生しました。"
      );
      // 削除操作のコンテキスト（選択されたブックマークのタイトルや削除ボタン）が依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });
  });
});
