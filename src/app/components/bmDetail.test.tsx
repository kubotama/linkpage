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
    const user = userEvent.setup();
    const url = "https://mail.google.com/mail/";
    const onAddBookmark = jest.fn(); // モック関数を作成

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    // const urlInput = screen.getByLabelText("url");
    // const textInput = screen.getByLabelText("title") as HTMLInputElement;
    const urlInput = screen.getByRole("textbox", { name: "url" });
    const textInput = screen.getByRole("textbox", { name: "title" });

    const updateButton = screen.getByText("更新");

    // await user.type(urlInput.querySelector("input") as HTMLInputElement, url);
    // await user.type(
    //   textInput.querySelector("input") as HTMLInputElement,
    //   "Gmail"
    // );
    await user.type(urlInput, url);
    await user.type(textInput, "Gmail");

    await user.click(updateButton);

    await waitFor(() => {
      expect(onAddBookmark).toHaveBeenCalledTimes(1);
      expect(onAddBookmark).toHaveBeenCalledWith(url, "Gmail");
    });
  });

  it("すべてのエレメントが表示される", () => {
    const onAddBookmark = jest.fn(); // モック関数を作成

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    // expect(screen.getByLabelText("url")).toBeVisible();
    // expect(screen.getByLabelText("title")).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: "url" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "title" })).toBeInTheDocument();
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

    // const urlInput = screen.getByLabelText("url");
    // const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByText("タイトル");

    expect(screen.queryByDisplayValue(title)).toBeNull();
    fetchMock.mockResponseOnce(title);

    await userEvent.type(urlInput, url);
    // await userEvent.type(
    //   urlInput.querySelector("input") as HTMLInputElement,
    //   url
    // );

    await userEvent.click(titleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
      expect(titleInput).toHaveValue(title);
      expect(screen.getByDisplayValue(title)).toBeInTheDocument();
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

    // const { getByRole } = render(
    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    // const urlInput = screen.getByLabelText("url");
    // const titleInput = screen.getByLabelText("title");
    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByText("タイトル");

    await userEvent.type(urlInput, url);
    // await userEvent.type(
    //   urlInput.querySelector("input") as HTMLInputElement,
    //   url
    // );
    await userEvent.click(titleButton);

    await waitFor(() => {
      // if (!(titleInput instanceof HTMLInputElement)) {
      //   fail();
      // }
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        "Can't find title: [500] " + url
      );
      expect(
        screen.queryByRole("button", { name: "確認" })
      ).toBeInTheDocument();
      expect(titleInput).toHaveValue("");
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

    // const urlInput = screen.getByLabelText("url");
    // const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByText("タイトル");
    const updateButton = screen.getByText("更新");

    fetchMock.mockResponseOnce(title);

    await userEvent.type(urlInput, url);
    // await userEvent.type(
    //   urlInput.querySelector("input") as HTMLInputElement,
    //   url
    // );
    await userEvent.click(titleButton);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, title_edited);
    // await userEvent.type(
    //   titleInput.querySelector("input") as HTMLInputElement,
    //   title_edited
    // );
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue(title_edited);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
    });
  });

  it("APIからタイトルが返ってこない場合、メッセージ領域にエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";
    const onAddBookmark = jest.fn(); // モック関数を作成

    fetchMock.mockResponseOnce("");

    // const { getByRole } = render(
    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    // const urlInput = screen.getByLabelText("url");
    // const titleInput = screen.getByLabelText("title");
    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByText("タイトル");

    await userEvent.type(urlInput, url);
    // await userEvent.type(
    //   urlInput.querySelector("input") as HTMLInputElement,
    //   url
    // );
    await userEvent.click(titleButton);

    await waitFor(() => {
      // if (!(titleInput instanceof HTMLInputElement)) {
      //   fail();
      // }
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        "Can't find title: " + url
      );
      expect(
        screen.queryByRole("button", { name: "確認" })
      ).toBeInTheDocument();
      expect(titleInput).toHaveValue("");
    });
  });
});
