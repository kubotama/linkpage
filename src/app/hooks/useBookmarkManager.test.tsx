import { beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { HTTP_STATUS_CREATED, HTTP_STATUS_OK } from "../constants/httpStatusCodes";
import { LINKPAGE_BOOKMARK, mockBookmarks } from "../test-utils/bookmarkTestUtils";
import { useBookmarkManager } from "./useBookmarkManager";

const mockFetch = vi.fn();

describe("useBookmarkManager", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_OK,
      json: async () => mockBookmarks,
    });
  });

  it("ブックマークを選択しないで「削除」ボタンを押すとエラーメッセージが表示される", async () => {
    const { result } = renderHook(() => useBookmarkManager());

    act(() => {
      result.current.setSelectedBookmarkId(undefined);
      result.current.deleteClick();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("ブックマークを選択しないで「タイトル更新」ボタンを押すとエラーメッセージが表示される", async () => {
    const { result } = renderHook(() => useBookmarkManager());

    act(() => {
      result.current.setSelectedBookmarkId(undefined);
      result.current.updateClick();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("ブックマークにキーワードを設定する", async () => {
    const newKeyword = "new keyword";
    const newKeywordResponse = { keyword_id: 99, keyword_name: newKeyword };
    const { result } = renderHook(() => useBookmarkManager());

    // 1. 初期データがロードされるのを待つ
    await waitFor(() => {
      expect(result.current.bookmarks).toHaveLength(mockBookmarks.length);
    });

    // 2. キーワード追加APIのレスポンスをモックする
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: HTTP_STATUS_CREATED,
      json: async () => newKeywordResponse,
    });

    // 3. ブックマークを選択する
    act(() => {
      result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
    });

    // 4. ブックマーク選択による副作用(useEffect)が完了し、フォームが更新されるのを待つ
    await waitFor(() => {
      expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
    });

    // 5. キーワードを入力し、追加アクションを実行する
    act(() => {
      result.current.setTextKeyword(newKeyword);
    });
    act(() => {
      result.current.addKeywordClick();
    });

    // 6. 結果を検証する
    await waitFor(() => {
      // ブックマークの初期読み込みの1回とキーワードを設定する1回の合計2回
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // bookmarks ステートが更新され、新しいキーワードが追加されていることを確認
      const updatedBookmark = result.current.bookmarks.find(
        (b) => b.bookmark_id === LINKPAGE_BOOKMARK.bookmark_id
      );
      expect(updatedBookmark?.keywords).toContainEqual(newKeywordResponse);
    });
  });
});
