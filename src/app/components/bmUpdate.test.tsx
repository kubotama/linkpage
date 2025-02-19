import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

import { BmUpdate } from "./bmUpdate";

describe("BmUpdate", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("入力された文字列が親コンポーネントに渡されること", () => {
    const url = "https://mail.google.com/mail/";
    const onBmUpdate = jest.fn(); // モック関数を作成

    render(<BmUpdate onBmUpdate={onBmUpdate} />);

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

    render(<BmUpdate onBmUpdate={onBmUpdate} />);

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

    render(<BmUpdate onBmUpdate={onBmUpdate} />);
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
      expect(fetchMock.mock.calls[0][0]).toEqual("/title?url=" + url);
    });
  });
});
