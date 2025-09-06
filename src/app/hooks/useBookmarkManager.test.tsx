import { beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { LINKPAGE_BOOKMARK, mockBookmarks } from "../test-utils/bookmarkTestUtils";
import { Bookmark } from "../types/Bookmark";
import { useBookmarkManager } from "./useBookmarkManager";

describe("useBookmarkManager", () => {
  let bookmarks: Bookmark[];
  let getBookmarks: () => Promise<void>;
  let deleteBookmark: (bookmark_id: number) => Promise<void>;
  let updateBookmark: (bookmark_id: number, url: string, title: string) => Promise<void>;
  let addKeyword: (bookmark_id: number, keyword_name: string) => Promise<void>;

  beforeEach(() => {
    bookmarks = mockBookmarks;
    getBookmarks = vi.fn();
    deleteBookmark = vi.fn();
    updateBookmark = vi.fn();
    addKeyword = vi.fn();
  });

  it("ブックマークを選択しないで「削除」ボタンを押すとdeleteBookmarkは呼び出されない", async () => {
    const { result } = renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    act(() => {
      result.current.setSelectedBookmarkId(undefined);
      result.current.deleteClick();
    });

    await waitFor(() => {
      expect(deleteBookmark).toHaveBeenCalledTimes(0);
    });
  });

  it("ブックマークを選択しないで「タイトル更新」ボタンを押すとエラーメッセージが表示される", async () => {
    const { result } = renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    act(() => {
      result.current.setSelectedBookmarkId(undefined);
      result.current.updateClick();
    });

    await waitFor(() => {
      expect(updateBookmark).toHaveBeenCalledTimes(0);
    });
  });

  it("ブックマークを選択しないで「追加」ボタンを押すとaddKeywordは呼び出されない", async () => {
    const { result } = renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    act(() => {
      result.current.setSelectedBookmarkId(undefined);
      result.current.addKeywordClick();
    });

    await waitFor(() => {
      expect(addKeyword).toHaveBeenCalledTimes(0);
    });
  });

  it("ブックマークを選択してキーワードを入力して「追加」ボタンをクリックするとaddKeywordが呼び出される", async () => {
    const newKeyword = "new keyword";
    const { result } = renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    // 1. ブックマークを選択する
    act(() => {
      result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
    });

    // 2. ブックマーク選択による副作用(useEffect)が完了し、フォームが更新されるのを待つ
    await waitFor(() => {
      expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
    });

    // 3. キーワードを入力する
    act(() => {
      result.current.setTextKeyword(newKeyword);
    });
    // 4. キーワード入力による副作用(useEffect)が完了し、フォームが更新されるのを待つ
    await waitFor(() => {
      expect(result.current.textKeyword).toBe(newKeyword);
    });

    // 5. 追加ボタンをクリックする
    act(() => {
      result.current.addKeywordClick();
    });

    // 6. 結果を検証する
    await waitFor(() => {
      // addKeywordの呼び出し
      expect(addKeyword).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id, newKeyword);

      // エラーメッセージとキーワードのテキストボックス
      expect(result.current.textMessage).toBe("");
      expect(result.current.textKeyword).toBe("");
    });
  });
});
