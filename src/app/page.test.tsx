import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark } from "./components/bmRow";
import Home from "./page";

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
      expect(fetchMock.call.length).toEqual(1);
      expect(fetchMock.mock.calls[0][0]).toEqual("/api/bookmark");
      expect(screen.getByText("kubotama/linkpage")).toBeInTheDocument();
    });
  });
});
