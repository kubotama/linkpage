import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React, { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MessageProvider } from "../contexts/MessageContext";
import BmMessage from "./bmMessage";
import { BookmarkManager } from "./BookmarkManager";

describe("BookmarkManagerのURLとタイトルのテキストとボタンのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("すべてのエレメントが表示される", async () => {
    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

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
    // const user = userEvent.setup();

    const url = "https://mail.google.com/mail/";
    const title = "Gmail";

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

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
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/api/title?url=" + url);
      expect(titleInput).toHaveValue(title);
    });
  });

  it("パラメータとして渡されたURLにアクセスできない場合、メッセージ領域にエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";

    const user = userEvent.setup();

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    fetchMock.mockResponseOnce("Can't find title", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await user.type(urlInput, url);
    await user.click(titleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/api/title?url=" + url);

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
    // const onAddBookmark = jest.fn(); // モック関数を作成
    const user = userEvent.setup();

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
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
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls[1][0]).toEqual("/api/title?url=" + url);
      expect(fetchMock.mock.calls[2][0]).toEqual("/api/bookmark");
    });
  });

  it("APIからタイトルが返ってこない場合、メッセージ領域にエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";
    const user = userEvent.setup();

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    fetchMock.mockResponseOnce("");

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });

    await user.type(urlInput, url);
    await user.click(titleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/api/title?url=" + url);

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
      const url = "https://mail.google.com/mail/u/0/#inbox";

      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

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
          <BookmarkManager />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

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
          <BookmarkManager />
        </MessageProvider>
      );

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await user.type(urlInput, url);
      await user.click(urlButton);

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
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
        <BookmarkManager />
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
        <BookmarkManager />
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
    const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/";

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
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
        <BookmarkManager />
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
        <BookmarkManager />
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

// Mock for window.open to test the 'Open' button functionality
const mockOpen = jest.fn();
const originalOpen = window.open;

// Interface to mock window.location for testing purposes
interface MockedLocation {
  href: string;
}

describe("入力されたURLを新しいタブで開く", () => {
  let originalLocation: Location;

  beforeAll(() => {
    // 元のlocationを保存
    originalLocation = window.location;

    // window.open をモック
    window.open = mockOpen as typeof window.open;

    // window.location をモックする代替アプローチ
    // Object.definePropertyを使用して一時的にlocationプロパティを再定義
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
      writable: true,
    });
  });

  afterAll(() => {
    // テスト後に元の実装を復元
    window.open = originalOpen;

    // locationを元に戻す
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
  });

  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();

    // hrefをリセット
    (window.location as MockedLocation).href = "";
  });

  it("「開く」ボタンをクリック", async () => {
    const user = userEvent.setup();
    const url = "https://xtech.nikkei.com/";

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const openButton = screen.getByRole("button", { name: "開く" });

    await user.type(urlInput, url);
    await user.click(openButton);

    expect(mockOpen).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
  });

  it("不正なURLを入力した場合", async () => {
    const user = userEvent.setup();

    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const openButton = screen.getByRole("button", { name: "開く" });

    await user.type(urlInput, "invalid-url");
    await user.click(openButton);

    expect(screen.getByTestId("bm-message")).toHaveTextContent(
      "Invalid URL: invalid-url"
    );
    expect(mockOpen).not.toHaveBeenCalled();
  });
});
