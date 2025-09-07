import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } from "../../constants/httpStatusCodes";
import { assertErrorMessage, mockBookmarks } from "../../test-utils/bookmarkTestUtils";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("BookmarkManagerの表示を確認", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("すべてのエレメントが表示されることを確認", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => mockBookmarks,
    });

    render(<BookmarkManager />);

    const bm = await screen.findByText("Amazon");
    expect(bm).toBeVisible();
  });

  it("ローディング中にローディングメッセージが表示されること", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => new Promise(() => []),
    });

    render(<BookmarkManager />);

    await assertErrorMessage({
      message: "ブックマークをロード中...",
      isError: false,
      isAsync: false,
    });
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const errorText = "サーバー内部でエラーが発生しました。";
      const statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: statusCode,
        headers: { "Content-Type": "application/json" },
        text: async () => JSON.stringify({ message: errorText }),
      });

      render(<BookmarkManager />);

      await assertErrorMessage({
        message: errorText,
        isError: true,
        isAsync: true,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "ブックマークのロードエラー:",
        `ApiError: [${statusCode}] ${errorText}`
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
