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
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      expect(titleInput).toHaveValue("Can't find title: [500] " + url);
    });
  });

  it("APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。", async () => {
    // APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。
    const url = "https://mail.google.com/mail/";
    const title = "Gmail";
    const title_edited = "GMAIL";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(<BookmarkManager />);
    });

    fetchMock.resetMocks();

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    fetchMock.mockResponseOnce(title);

    fireEvent.change(urlInput, { target: { value: url } });
    fireEvent.click(titleButton);

    fetchMock.mockResponseOnce(
      JSON.stringify(
        createBookmark({
          url: "https://www.example.com",
          title: "Example Site",
          id: 1,
        })
      )
    );

    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.change(titleInput, { target: { value: title_edited } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue(title_edited);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
      expect(fetchMock.mock.calls[1][0]).toEqual("/api/bookmark/add");
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
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(titleButton);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      expect(titleInput).toHaveValue("Can't find title: " + url);
    });
  });
});
