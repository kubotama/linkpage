import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

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

describe("タイトルの更新ボタン", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
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
    fetchMock.mockResponseOnce("", { status: 200 });

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const updateButton = screen.getByRole("button", { name: updateLabel });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const updateTitle = "更新されたタイトル";

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: updateTitle } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      // APIの呼び出しの確認
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/bookmark/update");
      expect(fetchMock.mock.calls[0][1]).toEqual({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: bookmarkToSelect.id, title: updateTitle }),
      });

      // 画面の更新の確認
      expect(screen.getByText(updateTitle)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: updateLabel })
      ).not.toBeInTheDocument();
    });
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
    fetchMock.mockResponseOnce("指定されたブックマークがありません。", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const updateButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
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
    fetchMock.mockResponseOnce("タイトルが指定されていません。", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const updateButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
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

    const updeteButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updeteButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
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
    fetchMock.mockResponseOnce("IDは正の整数である必要があります。", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });

    // テーブル行のクリックをシミュレート
    await act(async () => {
      fireEvent.click(tableRow);
    });

    const updaeteButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updaeteButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
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

    const updateButton = screen.getByRole("button", { name: updateLabel });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      // 画面の更新の確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: updateLabel })
      ).toBeInTheDocument();
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークのタイトル更新中にエラーが発生しました。"
      );
    });
  });
});
