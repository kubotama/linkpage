import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { mockBookmarks } from "../test-utils/bookmarkTestUtils";
import { Bookmark } from "../types/Bookmark";
import { useBookmarkManager } from "./useBookmarkManager";

// vitest.setup.tsでグローバルに設定されたMockEventSourceの型定義
// これにより、テスト内でMockEventSourceの静的プロパティにアクセスできます
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const global: {
  EventSource: {
    new (url: string): any;
    instances: any[];
  };
};

const MockEventSource = global.EventSource;

describe("useBookmarkManager › SSE", () => {
  let bookmarks: Bookmark[];
  let getBookmarks: () => Promise<void>;
  let deleteBookmark: (bookmark_id: number) => Promise<void>;
  let updateBookmark: (bookmark_id: number, url: string, title: string) => Promise<void>;
  let addKeyword: (bookmark_id: number, keyword_name: string) => Promise<void>;

  beforeEach(() => {
    // 各テストの前にモックとインスタンスリストをリセット
    vi.clearAllMocks();
    MockEventSource.instances = [];
    bookmarks = mockBookmarks;
    getBookmarks = vi.fn();
    deleteBookmark = vi.fn();
    updateBookmark = vi.fn();
    addKeyword = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should connect to SSE and call getBookmarks on message", async () => {
    renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    // 初期ロードで1回呼ばれることを確認
    expect(getBookmarks).toHaveBeenCalledTimes(1);

    // EventSourceが正しいURLで作成されたことを確認
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe("/api/events");

    // サーバーからメッセージを擬似的に送信
    act(() => {
      MockEventSource.instances[0].emitMessage({ type: "bookmarks-updated" });
    });

    // SSEイベントで追加で1回呼び出されたことを確認 (合計2回)
    await waitFor(() => {
      expect(getBookmarks).toHaveBeenCalledTimes(2);
    });
  });

  it("should close EventSource on unmount", () => {
    const { unmount } = renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    expect(MockEventSource.instances).toHaveLength(1);
    const eventSourceInstance = MockEventSource.instances[0];

    unmount();

    // unmount時にcloseが呼ばれたことを確認
    expect(eventSourceInstance.close).toHaveBeenCalledTimes(1);
  });

  it("should handle SSE errors and log them", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    const eventSourceInstance = MockEventSource.instances[0];

    // エラーを擬似的に発生させる
    act(() => {
      eventSourceInstance.onerror(new Error("test error"));
    });

    // console.errorが呼ばれたことを確認
    expect(consoleErrorSpy).toHaveBeenCalledWith("EventSource failed:", expect.any(Error));
    expect(eventSourceInstance.close).toHaveBeenCalledTimes(0);
  });

  it("should handle invalid JSON data from SSE and not call getBookmarks", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderHook(() =>
      useBookmarkManager({ bookmarks, getBookmarks, deleteBookmark, updateBookmark, addKeyword })
    );

    // onmessageを直接呼び出して不正なデータを渡す
    act(() => {
      MockEventSource.instances[0].onmessage({ data: "invalid json" });
    });

    // getBookmarksは追加で呼ばれないことを確認（初期ロードの1回のみ）
    expect(getBookmarks).toHaveBeenCalledTimes(1);
    // console.errorが呼ばれたことを確認
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to parse SSE message data:",
      expect.any(Error),
      "invalid json"
    );
  });
});
