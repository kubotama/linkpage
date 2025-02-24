import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BmDetail } from "./bmDetail";

describe("BmDetail", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("入力された文字列が親コンポーネントに渡されること", () => {
    const url = "https://mail.google.com/mail/";
    const onBmUpdate = jest.fn(); // モック関数を作成

    render(<BmDetail onBmUpdate={onBmUpdate} />);

    const urlInput = screen.getByLabelText("url");
    const updateButton = screen.getByText("更新");

    fireEvent.change(urlInput, {
      target: { value: url },
    });
    fireEvent.click(updateButton);

    expect(onBmUpdate).toHaveBeenCalledTimes(1);
    expect(onBmUpdate).toHaveBeenCalledWith(url, "");
  });

  it("すべてのエレメントが表示される", () => {
    const onBmUpdate = jest.fn(); // モック関数を作成

    render(<BmDetail onBmUpdate={onBmUpdate} />);

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
    const onBmUpdate = jest.fn(); // モック関数を作成

    render(<BmDetail onBmUpdate={onBmUpdate} />);
    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const titleButton = screen.getByText("タイトル");

    fetchMock.mockResponseOnce(title);

    fireEvent.change(urlInput, {
      target: { value: url },
    });
    fireEvent.click(titleButton);

    await waitFor(() => {
      expect(titleInput.value).toEqual(title);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
    });
  });

  it("パラメータとして渡されたURLにアクセスできない場合、タイトルのテキストボックスに、なにも表示しない。", async () => {
    // タイトルを取得するボタンをクリックして、エラーコード500の場合、タイトルのテキストボックスに、なにも表示しない。
    const url = "https://mail.google.com/mail/";
    const onBmUpdate = jest.fn(); // モック関数を作成

    fetchMock.mockResponseOnce(
      JSON.stringify({ message: "Can't find title" }),
      { status: 500 }
    );

    render(<BmDetail onBmUpdate={onBmUpdate} />);

    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title");
    const titleButton = screen.getByText("タイトル");

    fireEvent.change(urlInput, {
      target: { value: url },
    });
    fireEvent.click(titleButton);

    await waitFor(() => {
      if (!(titleInput instanceof HTMLInputElement)) {
        fail();
      }
      expect(titleInput.value).toEqual("");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
    });
  });

  it("APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。", async () => {
    // APIからタイトルを取得した後に、テキストボックスでタイトルを編集した場合、更新ボタンをクリックすると編集後のテキストが渡される。
    const url = "https://mail.google.com/mail/";
    const title = "Gmail";
    const title_edited = "GMAIL";
    const onBmUpdate = jest.fn(); // モック関数を作成

    render(<BmDetail onBmUpdate={onBmUpdate} />);
    const urlInput = screen.getByLabelText("url");
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    const titleButton = screen.getByText("タイトル");
    const updateButton = screen.getByText("更新");

    fetchMock.mockResponseOnce(title);

    fireEvent.change(urlInput, {
      target: { value: url },
    });
    fireEvent.click(titleButton);

    await waitFor(() => {
      fireEvent.change(titleInput, {
        target: { value: title_edited },
      });
      fireEvent.click(updateButton);
      expect(titleInput.value).toEqual(title_edited);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/title?url=" + url);
    });
  });
});
