import React from "react";

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

import Home, { Bookmark } from "./page";

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("タイトル", async () => {
    const mockBookmarks: Bookmark[] = [
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      { url: "https://www.google.com/", title: "Google" },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("kubotama/linkpage")).toBeInTheDocument();
    });
  });

  it("fetches and displays bookmarks", async () => {
    const mockBookmarks: Bookmark[] = [
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      { url: "https://www.google.com/", title: "Google" },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("kubotama/linkpage")).toBeInTheDocument();
      expect(screen.getByText("Google")).toBeInTheDocument();
    });
  });

  it("renders BmGrid component", async () => {
    const mockBookmarks: Bookmark[] = [
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("kubotama/linkpage")).toBeInTheDocument();
    });
  });

  it("ローディング中にローディングメッセージが表示されること", () => {
    fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする
    render(<Home />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("ブックマークのフェッチに失敗した場合、エラーメッセージが表示されること", async () => {
    fetchMock.mockRejectOnce(new Error("Failed to fetch bookmarks"));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch bookmarks")).toBeInTheDocument();
    });
  });

  it("ブックマークが存在しない場合、タイトル(linkpage)が表示されること", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("linkpage")).toBeInTheDocument();
    });
  });
});
