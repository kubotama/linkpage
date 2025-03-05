import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MessageProvider } from "../contexts/MessageContext";
import { BmDetail } from "./bmDetail";
import BmMessage from "./bmMessage";

describe("BmDetail", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("入力された文字列が親コンポーネントに渡されること", async () => {
    const url = "https://mail.google.com/mail/";
    const onAddBookmark = jest.fn(); // モック関数を作成

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByLabelText("url");
    const textInput = screen.getByLabelText("title") as HTMLInputElement;
    const updateButton = screen.getByText("更新");

    await userEvent.type(urlInput, url);
    await userEvent.type(textInput, "Gmail");

    await userEvent.click(updateButton);

    expect(onAddBookmark).toHaveBeenCalledTimes(1);
    expect(onAddBookmark).toHaveBeenCalledWith(url, "Gmail");
  });

  it("すべてのエレメントが表示される", () => {
    const onAddBookmark = jest.fn(); // モック関数を作成

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    expect(screen.getByLabelText("url")).toBeVisible();
    expect(screen.getByLabelText("title")).toBeInTheDocument();
    expect(screen.getByText("タイトル")).toBeInTheDocument();
    expect(screen.getByText("更新")).toBeInTheDocument();
  });

  it("タイトルを取得するボタンをクリック", async () => {
    // タイトルを取得するボタンをクリックすると、タイトルを取得するAPIを呼び出す。
    // パラメータとしてURLのテキストボックスに入力された文字列が渡される。
    // タイトルのテキストボックスに、APIから返されたタイトルが表示される。
    const url = "https://mail.google.com/mail/";
    const title = "Gmail";
    const onAddBookmark = jest.fn(); // モック関数を作成

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const titleButton = screen.getByText("タイトル");

    fetchMock.mockResponseOnce(title);

    await userEvent.type(urlInput, url);
    await userEvent.click(titleButton);

    await waitFor(() => {
      expect(titleInput.value).toEqual(title);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
    });
  });

  it("パラメータとして渡されたURLにアクセスできない場合、メッセージ領域にエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";
    const onAddBookmark = jest.fn(); // モック関数を作成

    fetchMock.mockResponseOnce("Can't find title", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title");
    const titleButton = screen.getByText("タイトル");

    await userEvent.type(urlInput, url);
    await userEvent.click(titleButton);

    await waitFor(() => {
      if (!(titleInput instanceof HTMLInputElement)) {
        fail();
      }
      expect(titleInput.value).toEqual("");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        /^Can't find title$/
      );
      expect(
        screen.queryByRole("button", { name: "確認" })
      ).toBeInTheDocument();
    });
  });

  it("APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。", async () => {
    // APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。
    const url = "https://mail.google.com/mail/";
    const title = "Gmail";
    const title_edited = "GMAIL";
    const onAddBookmark = jest.fn(); // モック関数を作成

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const titleButton = screen.getByText("タイトル");
    const updateButton = screen.getByText("更新");

    fetchMock.mockResponseOnce(title);

    await userEvent.type(urlInput, url);
    await userEvent.click(titleButton);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, title_edited);
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(titleInput.value).toEqual(title_edited);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
    });
  });

  it("URLが空白の場合、タイトルボタン、更新ボタンが無効になっている。", async () => {
    const onAddBookmark = jest.fn();

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByLabelText("url");
    const titleButton = screen.getByText("タイトル");
    const updateButton = screen.getByText("更新");

    await userEvent.clear(urlInput);

    expect(titleButton).toBeDisabled();
    expect(updateButton).toBeDisabled();
  });

  it("URLが入力されていて、タイトルが空白の場合、タイトルボタンが有効、更新ボタンが無効になっている。", async () => {
    const onAddBookmark = jest.fn();

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByLabelText("url");
    const titleButton = screen.getByText("タイトル");
    const updateButton = screen.getByText("更新");

    await userEvent.type(urlInput, "https://mail.google.com/mail/");

    expect(titleButton).toBeEnabled();
    expect(updateButton).toBeDisabled();
  });

  it("URLとタイトルが入力されている場合、タイトルボタン、更新ボタンが有効になっている。", async () => {
    const onAddBookmark = jest.fn();

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const titleButton = screen.getByText("タイトル");
    const updateButton = screen.getByText("更新");

    await userEvent.type(urlInput, "https://mail.google.com/mail/");
    await userEvent.type(titleInput, "Gmail");

    expect(titleButton).toBeEnabled();
    expect(updateButton).toBeEnabled();
  });
});
