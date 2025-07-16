import "@testing-library/jest-dom";

import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import {
  ADD_BUTTON_ROLE_NAME,
  FORM_KEYWORD_DETAIL,
  KEYWORD_ROLE_NAME,
} from "../../constants/constants";
import { clickBookmark } from "../../test-utils/bookmarkTestUtils";
import { mockBookmarks } from "../../types/Bookmark";
import { BookmarkManager } from "../BookmarkManager";

const mockFetch = vi.fn();

describe("キーワード詳細フォームの表示のテスト", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBookmarks,
    });
  });

  it("ブックマークを選択していないと、キーワード設定フォームが表示されていない。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    await waitFor(() => {
      expect(screen.queryByRole("form", { name: FORM_KEYWORD_DETAIL })).not.toBeInTheDocument();
    });
  });

  it("ブックマークを選択すると、キーワード設定フォーム(キーワードを入力するテキストボックスと「追加」ボタン)が表示される。", async () => {
    await act(async () => {
      render(<BookmarkManager />);
    });

    await clickBookmark(mockBookmarks[1]);

    await waitFor(() => {
      expect(screen.getByRole("form", { name: FORM_KEYWORD_DETAIL })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: KEYWORD_ROLE_NAME })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: ADD_BUTTON_ROLE_NAME })).toBeInTheDocument();
    });
  });
});
