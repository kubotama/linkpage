import "@testing-library/jest-dom";

// import fetchMock from "jest-fetch-mock";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark, createBookmarkList } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockBookmarks: Bookmark[] = createBookmarkList([
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
]);

const mockFetch = vi.fn();

describe("BookmarkManagerの表示を確認", () => {
  // beforeEach(() => {
  //   fetchMock.resetMocks();
  // });
  beforeEach(() => {
    // fetchMock.resetMocks();
    // fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("すべてのエレメントが表示されることを確認", async () => {
    // fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });

    await act(async () => {
      render(<BookmarkManager />);
    });

    await waitFor(() => {
      const bm = screen.getByText("Amazon");
      expect(bm).toBeInTheDocument();
      expect(bm).toHaveAttribute("href", "https://www.amazon.co.jp/");
      expect(bm).toHaveAttribute("target", "_blank");
    });
  });

  it("ローディング中にローディングメッセージが表示されること", () => {
    // fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(<BookmarkManager />);

    expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
      /^ブックマークをロード中...$/
    );
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    // fetchMock.mockResponseOnce("Internal Error", {
    //   status: 500,
    //   headers: { "Content-Type": "text/plain" },
    // });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { "Content-Type": "text/plain" },
      text: async () => "Internal Error",
    });

    await act(async () => {
      render(<BookmarkManager />);
    });

    const errorMessage = await screen.findByTestId("bookmark-message");
    expect(errorMessage).toHaveTextContent(
      /ブックマークのロード中にエラーが発生しました。/
    );

    // await waitFor(() => {
    // expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
    //   /ブックマークのロード中にエラーが発生しました。$/
    // );
    // });
  });
});
