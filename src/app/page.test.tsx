// import "@testing-library/jest-dom";

// import fetchMock from "jest-fetch-mock";
// import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import Home from "./page";
import { Bookmark, createBookmarkList } from "./types/Bookmark";

const mockFetch = vi.fn();

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  beforeEach(() => {
    // fetchMock.resetMocks();
    global.fetch = mockFetch;
  });

  it("すべてのエレメントが表示されることを確認", async () => {
    const mockBookmarks: Bookmark[] = createBookmarkList([
      {
        url: "https://github.com/kubotama/linkpage",
        title: "kubotama/linkpage",
      },
      { url: "https://www.google.com/", title: "Google" },
    ]);

    // // クリックするブックマークを選択（例：2番目のブックマーク）
    // const bookmarkToSelect = mockBookmarks[1]; // Google

    // await act(async () => {
    // fetchMock.mockResolvedValueOnce(JSON.stringify(mockBookmarks));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
    render(<Home />);
    const urlInput = await screen.findByText("kubotama/linkpage");
    const titleInput = await screen.findByText("Google");
    expect(urlInput).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();

    // });

    // await waitFor(() => {
    // expect(screen.getByText("タイトル")).toBeInTheDocument();
    // expect(screen.getByText("kubotama/linkage")).toBeInTheDocument();
    // expect(screen.getByText("Google")).toBeInTheDocument();

    // const urlInput = screen.getByRole("textbox", { name: "url" });
    // const titleInput = screen.getByRole("textbox", { name: "title" });
    // expect(urlInput).toHaveValue(bookmarkToSelect.url);
    // expect(titleInput).toHaveValue(bookmarkToSelect.title);
    // });
  });
});
