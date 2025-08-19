import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import { mockBookmarks } from "../../test-utils/bookmarkTestUtils";
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
      status: 200,
      json: async () => mockBookmarks,
    });

    render(<BookmarkManager />);

    const bm = await screen.findByText("Amazon");
    expect(bm).toBeVisible();
  });

  it("ローディング中にローディングメッセージが表示されること", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => new Promise(() => []),
    });

    render(<BookmarkManager />);

    expect(screen.getByTestId("bookmark-message")).toHaveTextContent(/^ブックマークをロード中...$/);
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const errorText = "Internal Error";
    const statusCode = 500;

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: statusCode,
      headers: { "Content-Type": "application/json" },
      json: async () => ({ message: errorText }),
    });

    render(<BookmarkManager />);

    const errorMessage = await screen.findByTestId("bookmark-message");
    expect(errorMessage).toHaveTextContent(/ブックマークのロード中にエラーが発生しました。/);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "ブックマークのロードエラー:",
      `[${statusCode}] ${errorText}`
    );

    consoleErrorSpy.mockRestore();
  });
});
