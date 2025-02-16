import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

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

    render(<BmGrid />);

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

    render(<BmGrid />);

    await waitFor(() => {
      const bm = screen.getByText("Amazon");
      expect(bm).toBeInTheDocument();
      expect(bm).toHaveAttribute("href", "https://www.amazon.co.jp/");
      expect(bm).toHaveAttribute("target", "_blank");
    });
  });

  it("ローディング中にローディングメッセージが表示されること", () => {
    fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする
    render(<BmGrid />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("ブックマークのフェッチに失敗した場合、エラーメッセージが表示されること", async () => {
    fetchMock.mockRejectOnce(new Error("Failed to fetch bookmarks"));

    render(<BmGrid />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch bookmarks")).toBeInTheDocument();
    });
  });

  it("ブックマークが存在しない場合、タイトル(linkpage)が表示されること", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));

    render(<BmGrid />);

    await waitFor(() => {
      expect(screen.queryByText("linkpage")).toBeNull();
    });
  });
});
