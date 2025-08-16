import "@testing-library/jest-dom";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import Home from "./page";
import { mockBookmarks } from "./test-utils/bookmarkTestUtils";

const mockFetch = vi.fn();

describe("テスト環境を動作確認するためのサンプルのテスト", () => {
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
    render(<Home />);
    const urlInput = await screen.findByText("kubotama/linkpage");
    const titleInput = await screen.findByText("Google");
    expect(urlInput).toBeVisible();
    expect(titleInput).toBeVisible();
  });
});
