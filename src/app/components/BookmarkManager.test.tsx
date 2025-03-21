import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React, { act } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MessageProvider } from "../contexts/MessageContext";
import BmMessage from "./bmMessage";
import { Bookmark, BookmarkManager } from "./BookmarkManager";

const mockBookmarks: Bookmark[] = [
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
];

describe("BookmarkManagerの表示を確認", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("すべてのエレメントが表示されることを確認", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    await waitFor(() => {
      const bm = screen.getByText("Amazon");
      expect(bm).toBeInTheDocument();
      expect(bm).toHaveAttribute("href", "https://www.amazon.co.jp/");
      expect(bm).toHaveAttribute("target", "_blank");
    });
  });

  it("ローディング中にローディングメッセージが表示されること", () => {
    fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする
    render(
      <MessageProvider>
        <BmMessage />
        <BookmarkManager />
      </MessageProvider>
    );

    expect(screen.getByTestId("bm-message")).toHaveTextContent(/^Loading...$/);
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce("Internal Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        /Failed to fetch: \[500\] Internal Server Error$/
      );
    });
  });
});

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
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
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

  it("パラメータとして渡されたURLにアクセスできない場合、メッセージ領域にエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    // render(
    //   <MessageProvider>
    //     <BmMessage />
    //     <BookmarkManager />
    //   </MessageProvider>
    // );
    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
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

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    fetchMock.resetMocks();

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const titleInput = screen.getByRole("textbox", { name: "title" });

    const titleButton = screen.getByRole("button", { name: "タイトル" });
    const updateButton = screen.getByRole("button", { name: "追加" });

    fetchMock.mockResponseOnce(title);

    fireEvent.change(urlInput, { target: { value: url } });
    fireEvent.click(titleButton);

    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.change(titleInput, { target: { value: title_edited } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue(title_edited);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
      expect(fetchMock.mock.calls[1][0]).toEqual("/api/bookmark");
    });
  });

  it("APIからタイトルが返ってこない場合、メッセージ領域にエラーメッセージを表示する。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
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

      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        "Can't find title: " + url
      );
      expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
      expect(titleInput).toHaveValue("");
    });
  });
});

describe("「パラメータ」ボタン: URLから無駄な文字列を削除する#61", () => {
  describe("#や?の後ろを削除する", () => {
    it("https://mail.google.com/mail/u/0/#inbox", async () => {
      const url = "https://mail.google.com/mail/u/0/#inbox";

      fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

      await act(async () => {
        render(
          <MessageProvider>
            <BmMessage />
            <BookmarkManager />
          </MessageProvider>
        );
      });
      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });

    it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh", async () => {
      const url =
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh";

      fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

      await act(async () => {
        render(
          <MessageProvider>
            <BmMessage />
            <BookmarkManager />
          </MessageProvider>
        );
      });

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue(
          "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/"
        );
      });
    });

    it("https://mail.google.com/mail/u/0/", async () => {
      const url = "https://mail.google.com/mail/u/0/";

      await act(async () => {
        render(
          <MessageProvider>
            <BmMessage />
            <BookmarkManager />
          </MessageProvider>
        );
      });

      const urlInput = screen.getByRole("textbox", { name: "url" });
      const urlButton = screen.getByRole("button", { name: "パラメータ" });

      await act(async () => {
        fireEvent.change(urlInput, { target: { value: url } });
        fireEvent.click(urlButton);
      });

      await waitFor(() => {
        expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
      });
    });
  });
});

describe("「←」ボタン: URLから、/の階層を一段、削除する", () => {
  it("https://mail.google.com/mail/u/0/", async () => {
    const url = "https://mail.google.com/mail/u/0/#inbox";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://mail.google.com/mail/u/0/");
    });
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376", async () => {
    const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue(
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
      );
    });
  });

  it("https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/", async () => {
    const url = "https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue(
        "https://xtech.nikkei.com/atcl/nxt/column/18/00148/"
      );
    });
  });

  it("https://xtech.nikkei.com", async () => {
    const url = "https://xtech.nikkei.com";
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });
    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

    await waitFor(() => {
      expect(urlInput).toHaveValue("https://xtech.nikkei.com");
    });
  });

  it("https://xtech.nikkei.com/", async () => {
    const url = "https://xtech.nikkei.com/";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const pathButton = screen.getByRole("button", { name: "←" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(pathButton);
    });

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

describe("「開く」ボタン: 入力されたURLを新しいタブで開く", () => {
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
    const url = "https://xtech.nikkei.com/";

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const openButton = screen.getByRole("button", { name: "開く" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: url } });
      fireEvent.click(openButton);
    });

    expect(mockOpen).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
  });

  it("不正なURLを入力した場合", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
    await act(async () => {
      render(
        <MessageProvider>
          <BmMessage />
          <BookmarkManager />
        </MessageProvider>
      );
    });

    const urlInput = screen.getByRole("textbox", { name: "url" });
    const openButton = screen.getByRole("button", { name: "開く" });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: "invalid-url" } });
      fireEvent.click(openButton);
    });

    expect(screen.getByTestId("bm-message")).toHaveTextContent(
      "Invalid URL: invalid-url"
    );
    expect(mockOpen).not.toHaveBeenCalled();
  });
});
