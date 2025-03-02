import "@testing-library/jest-dom";

import fetchMock from "jest-fetch-mock";
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";

import { Bookmark } from "./bmRow";
import { BookmarkManager } from "./BookmarkManager";

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

describe("BookmarkManager", () => {
  const mockOnBookmarksUpdate = jest.fn();
  const mockOnLoadingChange = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  it("ブックマークの取得に成功した場合、コールバックが正しく呼ばれる", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockBookmarks));

    render(
      <BookmarkManager
        onBookmarksUpdate={mockOnBookmarksUpdate}
        onLoadingChange={mockOnLoadingChange}
        onError={mockOnError}
      >
        <div>Test Content</div>
      </BookmarkManager>
    );

    await waitFor(() => {
      expect(mockOnBookmarksUpdate).toHaveBeenCalledWith(mockBookmarks);
      expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  it("ローディング状態が正しく更新される", async () => {
    fetchMock.mockResponseOnce(() => new Promise(() => [])); // リクエストがresolveしないようにする

    render(
      <BookmarkManager
        onBookmarksUpdate={mockOnBookmarksUpdate}
        onLoadingChange={mockOnLoadingChange}
        onError={mockOnError}
      >
        <div>Test Content</div>
      </BookmarkManager>
    );

    expect(mockOnLoadingChange).not.toHaveBeenCalledWith(false);
  });

  it("HTTPステータス500でfetchした場合、エラーコールバックが呼ばれる", async () => {
    fetchMock.mockResponseOnce("Internal Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });

    render(
      <BookmarkManager
        onBookmarksUpdate={mockOnBookmarksUpdate}
        onLoadingChange={mockOnLoadingChange}
        onError={mockOnError}
      >
        <div>Test Content</div>
      </BookmarkManager>
    );

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        "Failed to fetch: [500] Internal Server Error"
      );
      expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
      expect(mockOnBookmarksUpdate).not.toHaveBeenCalled();
    });
  });

  it("子コンポーネントが正しくレンダリングされる", () => {
    render(
      <BookmarkManager
        onBookmarksUpdate={mockOnBookmarksUpdate}
        onLoadingChange={mockOnLoadingChange}
        onError={mockOnError}
      >
        <div data-testid="test-content">Test Content</div>
      </BookmarkManager>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
