import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BOOKMARKS_ENDPOINT } from "../../constants/apiEndpoints";
import { TITLE_ROLE_NAME, UPDATE_BUTTON_ROLE_NAME, URL_ROLE_NAME } from "../../constants/constants";
import { clickBookmark, mockBookmarks } from "../../test-utils/bookmarkTestUtils";
import { BookmarkManager } from "../BookmarkManager";
import { Bookmark } from "../../types/Bookmark";

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
      name: UPDATE_BUTTON_ROLE_NAME,
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
      const updateButton = screen.getByRole("button", {
        name: UPDATE_BUTTON_ROLE_NAME,
      });
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

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });
    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const titleInput = screen.getByRole("textbox", { name: TITLE_ROLE_NAME });

    const updateUrl = "https://www.google.com/mail";
    const updateTitle = "更新されたタイトル";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: updateUrl } });
      fireEvent.change(titleInput, { target: { value: updateTitle } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      // APIの呼び出しの確認
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toEqual(
        `${BOOKMARKS_ENDPOINT}/${bookmarkToSelect.bookmark_id}`
      );
      expect(mockFetch.mock.calls[0][1]).toEqual({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: updateUrl,
          title: updateTitle,
        }),
      });
    });
    await waitFor(() => {
      // 更新されたタイトルが表示されていることを確認
      const updateText = screen.getAllByText(updateTitle);
      expect(updateText).toHaveLength(1);

      // 画面の更新の確認;
      expect(urlInput).toHaveValue(updateUrl);
      expect(titleInput).toHaveValue(updateTitle);
      expect(updateButton).toBeInTheDocument();
    });

    const updatedBookmark: Bookmark = {
      bookmark_id: bookmarkToSelect.bookmark_id,
      url: updateUrl,
      title: updateTitle,
      keywords: bookmarkToSelect.keywords,
    };
    clickBookmark(updatedBookmark);
    await waitFor(() => {
      expect(urlInput).toHaveValue(updateUrl);
      expect(titleInput).toHaveValue(updateTitle);
    });
  });

  it("同じURLを指定された場合には409を返す。", async () => {
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

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });
    const urlInput = screen.getByRole("textbox", { name: URL_ROLE_NAME });
    const titleInput = screen.getByRole("textbox", { name: TITLE_ROLE_NAME });

    const updateUrl = mockBookmarks[2].url;
    const updateTitle = "更新されたタイトル";
    mockFetch.mockResolvedValueOnce({
      ok: false, // 409の場合は false
      status: 409,
      json: async () => ({
        message: "指定されたURLのブックマークは既に登録されています。",
      }),
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: updateUrl } });
      fireEvent.change(titleInput, { target: { value: updateTitle } });
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "指定されたURLのブックマークは既に登録されています。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
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
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    mockFetch.mockResolvedValueOnce({
      ok: false, // 404の場合は false
      status: 404,
      headers: { "Content-Type": "application/json" },
      json: async () => ({
        message: "指定されたブックマークがありません。",
      }),
    });

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
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
      headers: { "Content-Type": "application/json" },
      json: async () => ({
        message: "タイトルが指定されていません。",
      }),
    });

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
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
      headers: { "Content-Type": "application/json" },
      json: async () => ({
        message: "リクエストにIDがありませんでした。",
      }),
    });

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
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
      headers: { "Content-Type": "application/json" },
      json: async () => ({
        message: "IDは正の整数である必要があります。",
      }),
    });

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
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
      headers: { "Content-Type": "application/json" },
      json: async () => ({
        message: "サーバーで予期せぬエラーが発生しました。",
      }),
    });

    const updateButton = screen.getByRole("button", {
      name: UPDATE_BUTTON_ROLE_NAME,
    });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
        "ブックマークの更新中にエラーが発生しました。"
      );
      // 更新操作のコンテキストが依然として表示されていることを確認
      expect(screen.getByText(bookmarkToSelect.title)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: UPDATE_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });
});
