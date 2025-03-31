import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React, { act } from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark } from "./components/BookmarkManager";
import Home from "./page";

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("すべてのエレメントが表示されることを確認", async () => {
    const mockBookmarks: Bookmark[] = [
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      { url: "https://www.google.com/", title: "Google" },
    ];

    await act(async () => {
      fetchMock.mockResponseOnce("180");
      fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
      render(<Home />);
    });

    await waitFor(() => {
      // expect(screen.getByTestId("bm-message")).toHaveTextContent(/^linkpage$/);
      // expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();

      expect(screen.getByText("kubotama/linkpage")).toBeInTheDocument();
      expect(screen.getByText("Google")).toBeInTheDocument();

      // expect(screen.getByLabelText("url")).toBeInTheDocument();
      // expect(screen.getByLabelText("title")).toBeInTheDocument();

      expect(screen.getByRole("textbox", { name: "url" })).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: "title" })
      ).toBeInTheDocument();
      expect(screen.getByText("タイトル")).toBeInTheDocument();
      expect(screen.getByText("追加")).toBeInTheDocument();

      expect(screen.getByText("kubotama/linkpage")).toBeInTheDocument();
    });
  });
});
