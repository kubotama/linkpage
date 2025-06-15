import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import Home from "./page";
import { Bookmark, createBookmarkList } from "./types/Bookmark";

const mockFetch = vi.fn();

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
  beforeEach(() => {
    mockFetch.mockReset();
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
  });
});
