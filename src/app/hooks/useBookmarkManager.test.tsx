import { beforeEach, describe, expect, it, vi } from "vitest";

import { act, renderHook, waitFor } from "@testing-library/react";

import { LINKED_KEYWORD, LINKPAGE_BOOKMARK, mockBookmarks } from "../test-utils/bookmarkTestUtils";
import { Bookmark } from "../types/Bookmark";
import { useBookmarkManager } from "./useBookmarkManager";

describe("useBookmarkManager", () => {
  let bookmarks: Bookmark[];
  let getBookmarks: () => Promise<void>;
  let getKeywords: () => Promise<void>;
  let deleteBookmark: (bookmark_id: number) => Promise<void>;
  let updateBookmark: (bookmark_id: number, url: string, title: string) => Promise<void>;
  let addKeyword: (bookmark_id: number, keyword_name: string) => Promise<void>;
  let unlinkKeyword: (bookmark_id: number, keyword_id: number) => Promise<void>;

  beforeEach(() => {
    bookmarks = mockBookmarks;
    getBookmarks = vi.fn();
    getKeywords = vi.fn();
    deleteBookmark = vi.fn();
    updateBookmark = vi.fn();
    addKeyword = vi.fn();
    unlinkKeyword = vi.fn();
  });

  // フックをレンダリングするヘルパー関数
  const renderMyHook = () => {
    return renderHook(() =>
      useBookmarkManager({
        bookmarks,
        getBookmarks,
        getKeywords,
        deleteBookmark,
        updateBookmark,
        addKeyword,
        unlinkKeyword,
      })
    );
  };

  describe("getBookmarks", () => {
    it("useBookmarkManagerを初期化するとgetBookmarksが呼び出される", async () => {
      const { result } = renderMyHook();

      // 結果を検証する
      await waitFor(() => {
        // getBookmarksの呼び出し
        expect(getBookmarks).toHaveBeenCalledWith();

        // エラーメッセージとキーワードのテキストボックス
        expect(result.current.textMessage).toBe("");
        expect(result.current.selectedBookmarkId).toBe(undefined);
      });
    });
  });

  describe("ブックマークを選択しない場合", () => {
    it("ブックマークを選択しないでボタンをクリックしても関数は呼び出されない", async () => {
      // Arrange
      const { result } = renderMyHook();
      act(() => {
        result.current.setSelectedBookmarkId(undefined);
      });

      // Act
      act(() => {
        result.current.deleteClick();
        result.current.updateClick();
        result.current.addKeywordClick();
        result.current.unlinkKeywordClick(LINKED_KEYWORD);
      });

      // Assert
      await waitFor(() => {
        expect(deleteBookmark).toHaveBeenCalledTimes(0);
        expect(updateBookmark).toHaveBeenCalledTimes(0);
        expect(addKeyword).toHaveBeenCalledTimes(0);
        expect(unlinkKeyword).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe("正常系のテスト", () => {
    it("ブックマークを選択して削除ボタンをクリックするとdeleteBookmarkが呼び出される", async () => {
      // Arrange
      // 1. ブックマークを選択する
      const { result } = renderMyHook();
      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });

      // 2. ブックマーク選択による副作用(useEffect)が完了し、フォームが更新されるのを待つ
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // Act
      // 3. ボタンをクリックする
      act(() => {
        result.current.deleteClick();
      });

      // 4. 結果を検証する
      await waitFor(() => {
        expect(deleteBookmark).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id);

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("");
        expect(result.current.selectedBookmarkId).toBe(undefined);
      });
    });

    it("ブックマークを選択して「更新」ボタンをクリックするとupdateBookmarkが呼び出される", async () => {
      const { result } = renderMyHook();

      // 1. ブックマークを選択する
      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });

      // 2. ブックマーク選択による副作用(useEffect)が完了し、フォームが更新されるのを待つ
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // 3. 更新ボタンをクリックする
      act(() => {
        result.current.updateClick();
      });

      // 4. 結果を検証する
      await waitFor(() => {
        // updateBookmarkの呼び出し
        expect(updateBookmark).toHaveBeenCalledWith(
          LINKPAGE_BOOKMARK.bookmark_id,
          LINKPAGE_BOOKMARK.url,
          LINKPAGE_BOOKMARK.title
        );

        // フォームの値が期待通りに設定されていることを確認
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
        expect(result.current.textTitle).toBe(LINKPAGE_BOOKMARK.title);

        // エラーメッセージとキーワードの選択されたブックマーク
        expect(result.current.textMessage).toBe("");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });

    it("ブックマークを選択してキーワードを入力して「追加」ボタンをクリックするとaddKeywordが呼び出される", async () => {
      const { result } = renderMyHook();

      const newKeyword = "new keyword";

      // Arrange: ブックマークを選択し、キーワードを入力する
      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });

      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      act(() => {
        result.current.setTextKeyword(newKeyword);
      });
      expect(result.current.textKeyword).toBe(newKeyword);

      // Act: 追加ボタンをクリックする
      act(() => {
        result.current.addKeywordClick();
      });

      // Assert: addKeywordが呼び出され、フォームがリセットされることを確認する
      await waitFor(() => {
        // addKeywordの呼び出し
        expect(addKeyword).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id, newKeyword);

        // エラーメッセージとキーワードのテキストボックス
        expect(result.current.textMessage).toBe("");
        expect(result.current.textKeyword).toBe("");
      });
    });

    it("ブックマークを選択してキーワードの解除ボタンをクリックするとunlinkKeywordが呼び出される", async () => {
      const { result } = renderMyHook();

      // 1. ブックマークを選択する
      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });

      // 2. ブックマーク選択による副作用(useEffect)が完了し、フォームが更新されるのを待つ
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // 3. キーワード解除をクリックする
      act(() => {
        result.current.unlinkKeywordClick(LINKED_KEYWORD);
      });

      // 4. 結果を検証する
      await waitFor(() => {
        // unlinkKeywordの呼び出し
        expect(unlinkKeyword).toHaveBeenCalledWith(
          LINKPAGE_BOOKMARK.bookmark_id, // 選択されたブックマークのID
          LINKED_KEYWORD.keyword_id // 解除されるキーワードのID
        );

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });

    it("ブックマークを選択してキーワードの設定ボタンをクリックするとlinkKeywordが呼び出される", async () => {
      const { result } = renderMyHook();

      // 1. ブックマークを選択する
      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });

      // 2. ブックマーク選択による副作用(useEffect)が完了し、フォームが更新されるのを待つ
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // 3. キーワード解除をクリックする
      act(() => {
        result.current.linkKeywordClick(LINKED_KEYWORD);
      });

      // 4. 結果を検証する
      await waitFor(() => {
        // unlinkKeywordの呼び出し
        expect(addKeyword).toHaveBeenCalledWith(
          LINKPAGE_BOOKMARK.bookmark_id, // 選択されたブックマークのID
          LINKED_KEYWORD.keyword_name // 解除されるキーワードの文字列
        );

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });
  });

  describe("エラー系のテスト", () => {
    it("deleteClick: deleteBookmarkに失敗するとエラーメッセージが表示される", async () => {
      // Arrange
      vi.mocked(deleteBookmark).mockRejectedValueOnce(new Error("エラーが発生しました"));

      const { result } = renderMyHook();

      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // Act
      await act(async () => {
        await result.current.deleteClick();
      });

      // Assert
      await waitFor(() => {
        // deleteBookmarkの呼び出し
        expect(deleteBookmark).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id);

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("エラーが発生しました");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });

    it("updateClick: updateBookmarkに失敗するとエラーメッセージが表示される", async () => {
      // Arrange
      vi.mocked(updateBookmark).mockRejectedValueOnce(new Error("エラーが発生しました"));

      const { result } = renderMyHook();

      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // Act
      await act(async () => {
        await result.current.updateClick();
      });

      // Assert
      await waitFor(() => {
        // deleteBookmarkの呼び出し
        expect(updateBookmark).toHaveBeenCalledWith(
          LINKPAGE_BOOKMARK.bookmark_id,
          LINKPAGE_BOOKMARK.url,
          LINKPAGE_BOOKMARK.title
        );

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("エラーが発生しました");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });

    it("addKeywordClick: addKeywordに失敗するとエラーメッセージが表示される", async () => {
      // Arrange
      vi.mocked(addKeyword).mockRejectedValueOnce(new Error("エラーが発生しました"));

      const { result } = renderMyHook();
      const newKeyword = "new keyword";

      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      act(() => {
        result.current.setTextKeyword(newKeyword);
      });
      await waitFor(() => {
        expect(result.current.textKeyword).toBe(newKeyword);
      });

      // Act
      await act(async () => {
        await result.current.addKeywordClick();
      });

      // Assert
      await waitFor(() => {
        // addKeywordの呼び出し
        expect(addKeyword).toHaveBeenCalledWith(LINKPAGE_BOOKMARK.bookmark_id, newKeyword);

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("エラーが発生しました");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });

    it("unlinkKeywordClick: unlinkKeywordに失敗するとエラーメッセージが表示される", async () => {
      // Arrange
      vi.mocked(unlinkKeyword).mockRejectedValueOnce(new Error("エラーが発生しました"));

      const { result } = renderMyHook();

      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // Act
      await act(async () => {
        await result.current.unlinkKeywordClick(LINKED_KEYWORD);
      });

      // Assert
      await waitFor(() => {
        // unlinkKeywordの呼び出し
        expect(unlinkKeyword).toHaveBeenCalledWith(
          LINKPAGE_BOOKMARK.bookmark_id,
          LINKED_KEYWORD.keyword_id
        );

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("エラーが発生しました");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });

    it("linkKeywordClick: addKeywordに失敗するとエラーメッセージが表示される", async () => {
      // Arrange
      vi.mocked(addKeyword).mockRejectedValueOnce(new Error("エラーが発生しました"));

      const { result } = renderMyHook();

      act(() => {
        result.current.setSelectedBookmarkId(LINKPAGE_BOOKMARK.bookmark_id);
      });
      await waitFor(() => {
        expect(result.current.textUrl).toBe(LINKPAGE_BOOKMARK.url);
      });

      // Act
      await act(async () => {
        await result.current.linkKeywordClick(LINKED_KEYWORD);
      });

      // Assert
      await waitFor(() => {
        // addKeywordの呼び出し
        expect(addKeyword).toHaveBeenCalledWith(
          LINKPAGE_BOOKMARK.bookmark_id,
          LINKED_KEYWORD.keyword_name
        );

        // エラーメッセージと選択されたブックマーク
        expect(result.current.textMessage).toBe("エラーが発生しました");
        expect(result.current.selectedBookmarkId).toBe(LINKPAGE_BOOKMARK.bookmark_id);
      });
    });
  });
});
