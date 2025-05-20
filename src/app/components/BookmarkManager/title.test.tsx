import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import {
  Bookmark,
  createBookmark,
  createBookmarkList,
} from "../../types/Bookmark";
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
      expect(messageText).toHaveTextContent("Can't find title: [500] " + url);
    });
  });

  it("APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。", async () => {
    const url = "https://mail.google.com/mail/";
    const initialTitleFromApi = "Gmail";
    const editedTitle = "GMAIL_EDITED";

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
    const titleInput = screen.getByRole("textbox", { name: "title" });
    const titleButton = screen.getByRole("button", { name: "タイトル" });

    // 2. Mock the title fetch API
    fetchMock.mockResponseOnce(initialTitleFromApi);

    // 3. User inputs URL and clicks "Get Title"
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    // 4. Wait for title to be fetched and UI to update
    //    - titleInput should have initialTitleFromApi
    //    - "タイトルを取得中..." message should disappear
    //    - "追加" button should become visible
    await waitFor(() => {
      expect(titleInput).toHaveValue(initialTitleFromApi);
      expect(screen.queryByText("タイトルを取得中...")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    });

    // 5. Get the "追加" button (it's now visible)
    const updateButton = screen.getByRole("button", { name: "追加" });

    // 6. Mock the add bookmark API response
    const mockAddedBookmark = { id: 5, url: url, title: editedTitle }; // Example ID
    fetchMock.mockResponseOnce(JSON.stringify(mockAddedBookmark));

    // 7. User edits the title and clicks "追加"
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: editedTitle } });
      fireEvent.click(updateButton);
    });

    // 8. Assertions
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2); // 1 for title, 1 for add

      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
      expect(fetchMock.mock.calls[1][0]).toEqual("/api/bookmark/add");
      expect(fetchMock.mock.calls[1][1]?.body).toEqual(
        JSON.stringify(createBookmark({ url: url, title: editedTitle }))
      );
      // Check if the new bookmark title appears in the document (e.g., in the table)
      expect(screen.getByText(editedTitle)).toBeInTheDocument();
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
      expect(messageText).toHaveTextContent("Can't find title: " + url);
    });
  });
});
