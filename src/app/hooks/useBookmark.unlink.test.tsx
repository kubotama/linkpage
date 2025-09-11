import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { useBookmarks } from "./useBookmark";
import { mockBookmarks } from "../test-utils/bookmarkTestUtils";
import { BOOKMARKS_ENDPOINT } from "../constants/apiEndpoints";

global.fetch = vi.fn();

describe("useBookmarks - unlinkKeyword", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  it("should unlink a keyword from a bookmark and update the state", async () => {
    // Arrange
    const bookmarkId = 1;
    const keywordId = 1;
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(mockBookmarks), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const { result } = renderHook(() => useBookmarks());

    // Act
    await act(async () => {
      await result.current.getBookmarks();
    });

    // Assert
    expect(result.current.bookmarks.length).toBe(mockBookmarks.length);

    // Act
    await act(async () => {
      await result.current.unlinkKeyword(bookmarkId, keywordId);
    });

    // Assert
    await waitFor(() => {
      const updatedBookmark = result.current.bookmarks.find((b) => b.bookmark_id === bookmarkId);
      expect(updatedBookmark?.keywords.some((k) => k.keyword_id === keywordId)).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith(
      `${BOOKMARKS_ENDPOINT}/${bookmarkId}/keywords/${keywordId}`,
      {
        method: "DELETE",
      }
    );
  });

  it("should throw an error if unlinking a keyword fails", async () => {
    // Arrange
    const bookmarkId = 1;
    const keywordId = 1;
    const errorMessage = "Failed to unlink keyword";
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(mockBookmarks), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: errorMessage }), { status: 500 })
      );

    const { result } = renderHook(() => useBookmarks());

    // Act
    await act(async () => {
      await result.current.getBookmarks();
    });

    // Assert
    expect(result.current.bookmarks.length).toBe(mockBookmarks.length);

    // Act & Assert
    await expect(result.current.unlinkKeyword(bookmarkId, keywordId)).rejects.toThrow();

    expect(fetch).toHaveBeenCalledWith(
      `${BOOKMARKS_ENDPOINT}/${bookmarkId}/keywords/${keywordId}`,
      {
        method: "DELETE",
      }
    );
  });
});
