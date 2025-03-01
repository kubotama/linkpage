import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark } from "../components/bmRow";
import { BookmarkProvider, useBookmarks } from "./BookmarkContext";

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
  const { bookmarks, loading, error } = useBookmarks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
});
