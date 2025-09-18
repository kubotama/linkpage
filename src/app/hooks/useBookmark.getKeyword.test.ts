import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { mockKeywords } from "../test-utils/bookmarkTestUtils";

import { useBookmarks } from "./useBookmark";

global.fetch = vi.fn();

describe("useBookmarks - getKeywords", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("キーワードを取得する", async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockKeywords), { status: 200 })
    );
    const { result } = renderHook(() => useBookmarks());

    // Act
    await act(async () => {
      await result.current.getKeywords();
    });

    // Assert
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith("/api/keywords");

      expect(result.current.keywords).toEqual(mockKeywords);
    });
  });

  describe("エラーの出力をテストする", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      // console.errorをスパイして、エラー出力がされるか確認
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it("キーワードの取得に失敗", async () => {
      // Arrange
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "サーバー内部でエラーが発生しました。" }), {
          status: 500,
        })
      );

      const { result } = renderHook(() => useBookmarks());

      // Act
      await expect(result.current.getKeywords()).rejects.toThrow();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith("/api/keywords");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "キーワードのロードエラー:",
        expect.stringContaining("サーバー内部でエラーが発生しました。")
      );
    });
  });
});
