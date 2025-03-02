import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { MessageProvider } from "../contexts/MessageContext";
import BmMessage from "./bmMessage";
import { Bookmark } from "./bmRow";
import { LinkPage } from "./LinkPage";

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

describe("ブックマークのデータを表示を確認", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("Amazonのリンクを生成するテスト", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <MessageProvider>
        <BmMessage />
        <LinkPage />
      </MessageProvider>
    );

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
        <LinkPage />
      </MessageProvider>
    );

    expect(screen.getByTestId("bm-message")).toHaveTextContent(/^Loading...$/);
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce("Internal Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    render(
      <MessageProvider>
        <BmMessage />
        <LinkPage />
      </MessageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        /Failed to fetch: \[500\] Internal Server Error$/
      );
    });
  });
});
