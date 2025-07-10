import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import { mockBookmarks } from "../../types/Bookmark";
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

    await act(async () => {
      render(<BookmarkManager />);
    });

    await waitFor(() => {
      const bm = screen.getByText("Amazon");
      expect(bm).toBeInTheDocument();
    });
  });

  it("ローディング中にローディングメッセージが表示されること", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => new Promise(() => []),
    });

    render(<BookmarkManager />);

    expect(screen.getByTestId("bookmark-message")).toHaveTextContent(
      /^ブックマークをロード中...$/
    );
  });

  it("HTTPステータス500でfetchした場合、エラーメッセージが表示される", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { "Content-Type": "text/plain" },
      json: async () => "Internal Error",
    });

    await act(async () => {
      render(<BookmarkManager />);
    });

    const errorMessage = await screen.findByTestId("bookmark-message");
    expect(errorMessage).toHaveTextContent(
      /ブックマークのロード中にエラーが発生しました。/
    );
  });
});
