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

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const textInput = screen.getByRole("textbox", { name: "title" });

    const updateButton = screen.getByRole("button", { name: "追加" });

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

    expect(screen.getByRole("textbox", { name: "url" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "title" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "タイトル" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });

  it("タイトルを取得するボタンをクリック", async () => {
    // タイトルを取得するボタンをクリックすると、タイトルを取得するAPIを呼び出す。
    // パラメータとしてURLのテキストボックスに入力された文字列が渡される。
    // タイトルのテキストボックスに、APIから返されたタイトルが表示される。
    const user = userEvent.setup();

    const url = "https://mail.google.com/mail/";
    const title = "Gmail";
    const onAddBookmark = jest.fn(); // モック関数を作成

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    // タイトルをAPIで取得する前は、クリアされていることを確認
    await user.clear(titleInput);
    expect(titleInput).toHaveValue("");

    fetchMock.mockResponseOnce(title);

    await user.type(urlInput, url);

    await user.click(titleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
      expect(titleInput).toHaveValue(title);
    });
  });

  it("パラメータとして渡されたURLにアクセスできない場合、メッセージ領域にエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";
    const onAddBookmark = jest.fn(); // モック関数を作成

    const user = userEvent.setup();

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

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await user.type(urlInput, url);
    await user.click(titleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        "Can't find title: [500] " + url
      );
      expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
      expect(titleInput).toHaveValue("");
    });
  });

  it("APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。", async () => {
    // APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。
    const url = "https://mail.google.com/mail/";
    const title = "Gmail";
    const title_edited = "GMAIL";
    const onAddBookmark = jest.fn(); // モック関数を作成
    const user = userEvent.setup();

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    fetchMock.mockResponseOnce(title);

    await user.type(urlInput, url);
    await user.click(titleButton);

    await user.clear(titleInput);
    await user.type(titleInput, title_edited);
    await user.click(updateButton);

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
    const user = userEvent.setup();

    fetchMock.mockResponseOnce("");

    render(
      <MessageProvider>
        <BmMessage />
        <BmDetail onAddBookmark={onAddBookmark} />
      </MessageProvider>
    );

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await user.type(urlInput, url);
    await user.click(titleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);

      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        "Can't find title: " + url
      );
      expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
      expect(titleInput).toHaveValue("");
    });
  });
});

describe("URLから無駄な文字列を削除する#61", () => {
  describe("#や?の後ろを削除する", () => {
    it("https://mail.google.com/mail/u/0/#inbox", async () => {
      const user = userEvent.setup();
      const url = "https://mail.google.com/mail/u/0/#inboxs";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "URL" });

      await user.type(urlInput, url);
      await user.click(urlButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });

    it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh", async () => {
      const user = userEvent.setup();
      const url =
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "URL" });

      await user.type(urlInput, url);
      await user.click(urlButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue(
          "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/"
        );
      });
    });

    it("https://mail.google.com/mail/u/0/", async () => {
      const user = userEvent.setup();
      const url = "https://mail.google.com/mail/u/0/";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "URL" });

      await user.type(urlInput, url);
      await user.click(urlButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });
  });

  describe("URLから、/の階層を一段、削除する", () => {
    it("https://mail.google.com/mail/u/0/", async () => {
      const user = userEvent.setup();
      const url = "https://mail.google.com/mail/u/0/#inbox";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const pathButton = screen.getByRole("button", { name: "←" });

      await user.type(urlInput, url);
      await user.click(pathButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });

    it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376", async () => {
      const user = userEvent.setup();
      const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const pathButton = screen.getByRole("button", { name: "←" });

      await user.type(urlInput, url);
      await user.click(pathButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue(
          "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
        );
      });
    });

    it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/", async () => {
      const user = userEvent.setup();
      const url =
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const pathButton = screen.getByRole("button", { name: "←" });

      await user.type(urlInput, url);
      await user.click(pathButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue(
          "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
        );
      });
    });

    it("https://xtech.nikkei.com", async () => {
      const user = userEvent.setup();
      const url = "https://xtech.nikkei.com";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const pathButton = screen.getByRole("button", { name: "←" });

      await user.type(urlInput, url);
      await user.click(pathButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://xtech.nikkei.com");
      });
    });

    it("https://xtech.nikkei.com/", async () => {
      const user = userEvent.setup();
      const url = "https://xtech.nikkei.com/";

      render(
        <MessageProvider>
          <BmMessage />
          <BmDetail onAddBookmark={jest.fn()} />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const pathButton = screen.getByRole("button", { name: "←" });

      await user.type(urlInput, url);
      await user.click(pathButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://xtech.nikkei.com/");
      });
    });
  });
});
