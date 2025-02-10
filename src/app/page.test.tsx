import React from "react";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

import { render, screen, waitFor } from "@testing-library/react";
import Home from "./page";

import { Bookmark } from "./components/bmGrid";

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  it("タイトル", () => {
    render(<Home />);
    const title = screen.getByText("linkpage");
    expect(title).toBeInTheDocument();
  });
});

fetchMock.enableMocks();

describe("Home", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
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
});
