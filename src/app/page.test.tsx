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
      const title = screen.getByText("linkpage");
      expect(title).toBeInTheDocument();
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
    // it("ローディング中にローディングメッセージが表示されること", async () => {
    // const mockBookmarks: Bookmark[] = [
    //   {
    //     url: "https://github.com/kubotama/linkpage",
    //     title: "kubotama/linkpage",
    //   },
    // ];

    // fetchMock.mockResponseOnce(
    //   () => new Promise(() => JSON.stringify(mockBookmarks))
    // );
    fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする
    // act(() => {
    //   render(<Home />);
    // });
    render(<Home />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // await waitFor(() => {
    //   const title = screen.getByText("linkpage");
    //   expect(title).toBeInTheDocument();
    // });
    // done(expect(screen.getByText("linkpage")).toBeInTheDocument());
  });
});
