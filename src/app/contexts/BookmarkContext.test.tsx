import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark } from "../components/bmRow";
import { BookmarkProvider, useBookmark } from "./BookmarkContext";

const mockBookmarks: Bookmark[] = [
  {
    url: "https://example.com",
    title: "Example",
  },
  {
    url: "https://test.com",
    title: "Test",
  },
];

// テスト用のコンシューマーコンポーネント
const TestComponent = () => {
  const { bookmarks, loading, error } = useBookmark();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <ul>
        {bookmarks.map((bookmark) => (
          <li key={bookmark.url}>{bookmark.title}</li>
        ))}
      </ul>
    </div>
  );
};

describe("BookmarkProvider", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("ブックマークの取得をテスト", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <BookmarkProvider>
        <TestComponent />
      </BookmarkProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Example")).toBeInTheDocument();
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  it("ローディング中に「ローディング中...」が表示される。", async () => {
    fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする

    render(
      <BookmarkProvider>
        <TestComponent />
      </BookmarkProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByText("Example")).not.toBeInTheDocument();
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    fetchMock.mockResponseOnce("Internal Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    render(
      <BookmarkProvider>
        <TestComponent />
      </BookmarkProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch: 500")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByText("Example")).not.toBeInTheDocument();
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });
  });

  it("プロバイダーの外で利用した場合", () => {
    try {
      render(<TestComponent />);
      fail("発生すべき例外が発生しませんでした");
    } catch (error: unknown) {
      expect((error as Error).message).toBe(
        "useBookmark must be used within a BookmarkProvider"
      );
    }
  });
});
