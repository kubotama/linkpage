import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";

import BmMessage from "../components/bmMessage";
import { MessageProvider } from "../contexts/MessageContext";
import { BmGrid } from "./bmGrid";
import { Bookmark } from "./bmRow";

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

/***
 * このテストは、Bookmarksクラスのインスタンスを生成し、そのインスタンスのをテストします。
 * Bookmarksクラスは、ブックマークのデータを定義するクラスです。
 * Bookmarksクラスに定義されているブックマークを返します。
 **/

describe("ブックマークのデータのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("GitHubのリンクを生成するテスト", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <MessageProvider>
        <BmMessage />
        <BmGrid />
      </MessageProvider>
    );

    await waitFor(() => {
      const bm = screen.getByText("kubotama/linkpage");
      expect(bm).toBeInTheDocument();
      expect(bm).toHaveAttribute(
        "href",
        "https://github.com/kubotama/linkpage"
      );
      expect(bm).toHaveAttribute("target", "_blank");
    });
  });

  it("Amazonのリンクを生成するテスト", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <MessageProvider>
        <BmMessage />
        <BmGrid />
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
        <BmGrid />
      </MessageProvider>
    );

    expect(screen.getByTestId("bm-message")).toHaveTextContent(/^Loading...$/);
  });

  it("ブックマークのフェッチに失敗した場合、エラーメッセージが表示されること", async () => {
    fetchMock.mockRejectOnce(new Error("Failed to fetch bookmarks"));

    render(
      <MessageProvider>
        <BmMessage />
        <BmGrid />
      </MessageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("bm-message")).toHaveTextContent(
        /^Failed to fetch bookmarks$/
      );
    });
  });

  it("ブックマークが存在しない場合、タイトル(linkpage)が表示されること", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));

    render(<BmGrid />);

    await waitFor(() => {
      expect(screen.queryByText("linkpage")).toBeNull();
    });
  });

  it("fetchしたときにエラーコード(500)が返ってきた場合", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: "Internal Error" }), {
      status: 500,
      statusText: "Internal Error",
    });
    render(<BmGrid />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });
  });
});
