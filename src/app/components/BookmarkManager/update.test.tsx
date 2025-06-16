import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";
import { clickBookmark } from "../../test-utils/click.test";

const updateLabel = "タイトル更新";

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

describe("タイトルの更新ボタン", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });
  it("ブックマークが選択されていない場合には、タイトルの更新ボタンは表示されない。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    const updateButtons = screen.queryAllByRole("button", {
      name: updateLabel,
    });

    await waitFor(() => {
      expect(updateButtons).toHaveLength(0);
    });
  });

  it("ブックマークが選択されている場合には、タイトルの更新ボタンが表示される。", async () => {
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
      const updateButton = screen.getByRole("button", { name: updateLabel });
      expect(updateButton).toBeInTheDocument();
    });
  });

  it("ブックマークのタイトルが更新される。(APIの呼び出し、画面の更新)", async () => {
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
    mockFetch.mockReset();

    const updateButton = screen.getByRole("button", { name: updateLabel });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const updateTitle = "更新されたタイトル";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: updateTitle } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      // APIの呼び出しの確認
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toEqual("/api/bookmark/update");
      expect(mockFetch.mock.calls[0][1]).toEqual({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: bookmarkToSelect.id, title: updateTitle }),
      });
    });
    const updateText = await screen.findByText(updateTitle);
    expect(updateText).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: updateLabel })
    ).not.toBeInTheDocument();
  });

  it("登録されていないブックマークIDを指定された場合は404を返す。", async () => {
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

    mockFetch.mockResolvedValueOnce({
      ok: false, // 404の場合は false
      status: 404,
      headers: { "Content-Type": "text/plain" },
      text: async () => "指定されたブックマークがありません。",
    });
    const updateButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
    });
  });

  it("タイトルが指定されていない場合には400を返す。", async () => {
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
      text: async () => "タイトルが指定されていません。",
    });

    const updateButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
    });
  });

  it("IDが指定されていない場合には400を返す。", async () => {
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

    mockFetch.mockResolvedValueOnce({
      ok: false, // 400の場合は false
      status: 400,
      headers: { "Content-Type": "text/plain" },
      text: async () => "リクエストにIDがありませんでした。",
    });
    const updeteButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updeteButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
    });
  });

  it("不正な形式(文字列)のIDを指定された場合には400を返す。", async () => {
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

    mockFetch.mockResolvedValueOnce({
      ok: false, // 400の場合は false
      status: 400,
      headers: { "Content-Type": "text/plain" },
      text: async () => "IDは正の整数である必要があります。",
    });

    const updaeteButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updaeteButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
    });
  });

  it("不正なJSONデータの場合は500を返す。", async () => {
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

    mockFetch.mockResolvedValueOnce({
      ok: false, // 500の場合は false
      status: 500,
      headers: { "Content-Type": "text/plain" },
      text: async () => "サーバーで予期せぬエラーが発生しました。",
    });

    const updateButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
    });
  });
});
