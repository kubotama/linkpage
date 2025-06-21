import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { mockBookmarks } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";
import { clickBookmark } from "../../test-utils/click.test";

const mockFetch = vi.fn();

describe("BookmarkManagerのURLとタイトルのテキストとボタンのテスト", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });
  it("タイトルを取得するボタンをクリック", async () => {
    // タイトルを取得するボタンをクリックすると、タイトルを取得するAPIを呼び出す。
    // パラメータとしてURLのテキストボックスに入力された文字列が渡される。
    // タイトルのテキストボックスに、APIから返されたタイトルが表示される。

    // mockFetchはbeforeEachでmockBookmarksを返すように設定されています

    const url = "https://mail.google.com/mail/";
    const title = "Gmail";

    await act(async () => {
      render(<BookmarkManager />);
    });

    mockFetch.mockReset();

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    // タイトルをAPIで取得する前は、クリアされていることを確認
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: "" } });
    });
    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => title,
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toEqual(
        "/api/title?url=" + encodeURIComponent(url)
      );
      expect(titleInput).toHaveValue(title);
    });
  });

  it("パラメータとして渡されたURLにアクセスできない場合、タイトルのテキストボックスにエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、エラーメッセージを表示する。

    // mockFetchはbeforeEachでmockBookmarksを返すように設定されています

    const url = "https://mail.google.com/mail/";

    await act(async () => {
      render(<BookmarkManager />);
    });

    mockFetch.mockReset();

    mockFetch.mockResolvedValueOnce({
      ok: false, // 500の場合は false
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toEqual(
        "/api/title?url=" + encodeURIComponent(url)
      );

      const messageText = screen.getByTestId("bookmark-message");
      expect(messageText).toHaveTextContent(
        "タイトルの取得中にエラーが発生しました。"
      );
    });
  });

  it("APIからタイトルが返ってこない場合、タイトルのテキストボックスにエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、エラーメッセージを表示する。

    // mockFetchはbeforeEachでmockBookmarksを返すように設定されています

    const url = "https://mail.google.com/mail/";

    await act(async () => {
      render(<BookmarkManager />);
    });

    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "",
    });

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toEqual(
        "/api/title?url=" + encodeURIComponent(url)
      );

      const messageText = screen.getByTestId("bookmark-message");
      expect(messageText).toHaveTextContent(
        "タイトルの取得中にエラーが発生しました。"
      );
    });
  });

  it("タイトル取得APIでエラーが発生した場合、エラーメッセージと閉じるボタンが表示され、閉じるボタンで消去される", async () => {
    const url = "https://error.example.com/";

    // 1. Initial load of bookmarks
    // mockFetchはbeforeEachでmockBookmarksを返すように設定されています

    await act(async () => {
      render(<BookmarkManager />);
    });
    // Wait for initial load to complete and loading message to disappear
    await waitFor(() => {
      expect(
        screen.queryByText("ブックマークをロード中...")
      ).not.toBeInTheDocument();
    });

    // Reset mocks for the next specific fetch operations
    // fetchMock.resetMocks();
    mockFetch.mockReset();

    // クリックするブックマークを選択（例：2番目のブックマーク）
    const bookmarkToSelect = mockBookmarks[1]; // Google
    await clickBookmark(bookmarkToSelect);

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleButton = screen.getByRole("button", { name: "タイトル" });

    // 2. Mock the title fetch API to return an error
    mockFetch.mockResolvedValueOnce({
      ok: false, // 500の場合は false
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
    // 3. User inputs URL and clicks "Get Title"
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    // 4. Verify error message and close button appear
    const errorSpan = await screen.findByTestId("bookmark-message");
    expect(errorSpan).toHaveTextContent(
      "タイトルの取得中にエラーが発生しました。"
    );
    const closeButton = await screen.findByRole("button", { name: "閉じる" });
    expect(closeButton).toBeInTheDocument();

    // 5. Click the close button and verify message and button disappear
    await act(async () => {
      fireEvent.click(closeButton);
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "閉じる" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("タイトルの取得中にエラーが発生しました。")
      ).not.toBeInTheDocument();
      // Check that the message span is still there but empty or hidden
      expect(screen.queryAllByTestId("bookmark-message")).toHaveLength(0);
    });
  });
});
