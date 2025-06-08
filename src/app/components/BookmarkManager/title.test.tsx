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

describe("BookmarkManagerのURLとタイトルのテキストとボタンのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("タイトルを取得するボタンをクリック", async () => {
    // タイトルを取得するボタンをクリックすると、タイトルを取得するAPIを呼び出す。
    // パラメータとしてURLのテキストボックスに入力された文字列が渡される。
    // タイトルのテキストボックスに、APIから返されたタイトルが表示される。

    const url = "https://mail.google.com/mail/";
    const title = "Gmail";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    fetchMock.resetMocks();

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

    fetchMock.mockResponseOnce(title);

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
      expect(titleInput).toHaveValue(title);
    });
  });

  it("パラメータとして渡されたURLにアクセスできない場合、タイトルのテキストボックスにエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、エラーメッセージを表示する。
    const url = "https://mail.google.com/mail/";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    fetchMock.resetMocks();

    fetchMock.mockResponseOnce("Can't find title", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      const messageText = screen.getByTestId("bookmark-message");
      expect(messageText).toHaveTextContent(
        "タイトルの取得中にエラーが発生しました。"
      );
    });
  });

  it("APIからタイトルが返ってこない場合、タイトルのテキストボックスにエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、エラーメッセージを表示する。
    const url = "https://mail.google.com/mail/";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("");

    const urlInput = screen.getByRole("textbox", { name: "url" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      const messageText = screen.getByTestId("bookmark-message");
      expect(messageText).toHaveTextContent(
        "タイトルの取得中にエラーが発生しました。"
      );
    });
  });

  it("タイトル取得APIでエラーが発生した場合、エラーメッセージと閉じるボタンが表示され、閉じるボタンで消去される", async () => {
    const url = "https://error.example.com/";

    // 1. Initial load of bookmarks
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
    await act(async () => {
      render(<BookmarkManager />);
    });
    // Wait for initial load to complete and loading message to disappear
    await waitFor(() => {
      expect(
        screen.queryByText("ブックマークをロード中...")
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "タイトル" })
      ).toBeInTheDocument();
    });

    // Reset mocks for the next specific fetch operations
    fetchMock.resetMocks();

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleButton = screen.getByRole("button", { name: "タイトル" });

    // 2. Mock the title fetch API to return an error
    fetchMock.mockResponseOnce("Simulated Server Error", {
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
